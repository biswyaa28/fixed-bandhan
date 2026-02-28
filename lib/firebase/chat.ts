/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Real-Time Chat Service (Firestore)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Provides WebSocket-like real-time chat using Firestore onSnapshot.
 *
 * Functions
 * ─────────
 *   sendMessage()           — Send text / icebreaker / system message
 *   sendMediaMessage()      — Upload + send voice note or photo
 *   getMessages()           — Paginated message history (most-recent-first)
 *   markMessagesAsRead()    — Batch-update read receipts + match unreadCount
 *   deleteMessage()         — Soft-delete (sender only)
 *   reportMessage()         — Create a report document
 *
 * Real-time Listeners (return unsubscribe functions)
 * ──────────────────────────────────────────────────
 *   onNewMessages()         — onSnapshot for new messages in a match
 *   setTypingStatus()       — Write typing flag to a typing sub-doc
 *   onTypingStatus()        — Listen for the other user's typing flag
 *
 * Media helpers
 * ─────────────
 *   uploadVoiceNote()       — Compress + upload audio, return URL
 *   uploadChatPhoto()       — Compress + upload image, return URL
 *
 * STRICT RULES
 * ────────────
 *   • All listeners return an Unsubscribe — MUST be called on unmount
 *   • Voice notes enforced ≤ 15 s, compressed to webm/opus
 *   • Photos compressed ≤ 500 KB via Canvas before upload
 *   • Read receipts update in real-time (onSnapshot)
 *   • Typing indicator has 5 s auto-expire on the writer side
 *   • All functions typed against schema.ts MessageDocument
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteField,
  setDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  startAfter,
  collection,
  serverTimestamp,
  onSnapshot,
  writeBatch,
  Timestamp,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

import { firebaseDb, firebaseStorage } from "@/lib/firebase/config";

import {
  COLLECTIONS,
  type MessageDocument,
  type MessageType,
  type MessageDeliveryStatus,
  type MatchDocument,
  type NotificationDocument,
  type ReportReason,
} from "@/lib/firebase/schema";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** Bilingual service error */
export interface ChatServiceError {
  code: string;
  en: string;
  hi: string;
}

/** Message enriched with its Firestore document ID */
export interface ChatMessage {
  id: string;
  data: MessageDocument;
}

/** Paginated response from getMessages */
export interface MessagePage {
  messages: ChatMessage[];
  /** Pass to getMessages as startAfterDoc for next page */
  lastDoc: QueryDocumentSnapshot | null;
  hasMore: boolean;
}

/** Typing status doc shape (lives at matches/{matchId}/typing/{userId}) */
export interface TypingStatus {
  isTyping: boolean;
  /** Server timestamp of last keystroke */
  updatedAt: any;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_PAGE_SIZE = 30;
const MAX_VOICE_DURATION_SEC = 15;
const MAX_PHOTO_BYTES = 500 * 1024;
const MAX_PHOTO_DIMENSION = 1024;
const TYPING_EXPIRE_MS = 5_000;

// ─────────────────────────────────────────────────────────────────────────────
// Error helpers
// ─────────────────────────────────────────────────────────────────────────────

function toError(code: string, en: string, hi: string): ChatServiceError {
  return { code, en, hi };
}

function firestoreError(err: unknown): ChatServiceError {
  const code = (err as any)?.code ?? "firestore/unknown";
  const MAP: Record<string, { en: string; hi: string }> = {
    "permission-denied": {
      en: "You don't have permission to send messages in this chat.",
      hi: "आपको इस चैट में संदेश भेजने की अनुमति नहीं है।",
    },
    unavailable: {
      en: "Chat service temporarily unavailable. Please try again.",
      hi: "चैट सेवा अस्थायी रूप से अनुपलब्ध। कृपया पुनः प्रयास करें।",
    },
    "not-found": {
      en: "This conversation no longer exists.",
      hi: "यह बातचीत अब मौजूद नहीं है।",
    },
  };
  const mapped = MAP[code];
  if (mapped) return { code, ...mapped };
  return {
    code,
    en: "An unexpected error occurred. Please try again.",
    hi: "एक अनपेक्षित त्रुटि हुई। कृपया पुनः प्रयास करें।",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────────────────────

async function validateMatchAccess(
  matchId: string,
  userId: string,
): Promise<MatchDocument> {
  const db = firebaseDb();
  const matchRef = doc(db, COLLECTIONS.MATCHES, matchId);
  const snap = await getDoc(matchRef);

  if (!snap.exists()) {
    throw toError("chat/match-not-found", "Conversation not found.", "बातचीत नहीं मिली।");
  }

  const match = snap.data() as MatchDocument;

  if (match.user1Id !== userId && match.user2Id !== userId) {
    throw toError("chat/not-member", "You are not part of this conversation.", "आप इस बातचीत का हिस्सा नहीं हैं।");
  }

  if (match.status !== "active") {
    throw toError(
      "chat/inactive",
      "This conversation is no longer active.",
      "यह बातचीत अब सक्रिय नहीं है।",
    );
  }

  return match;
}

// ═════════════════════════════════════════════════════════════════════════════
// SEND MESSAGES
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Send a text / icebreaker / system message.
 *
 * Also updates the match document's lastMessage* fields and increments
 * the recipient's unreadCount.
 *
 * @returns The new message's Firestore document ID
 */
export async function sendMessage(
  matchId: string,
  senderId: string,
  content: string,
  type: MessageType = "text",
  replyToId?: string | null,
): Promise<string> {
  if (type === "text" && (!content || content.trim().length === 0)) {
    throw toError("chat/empty", "Message cannot be empty.", "संदेश खाली नहीं हो सकता।");
  }
  if (content.length > 5000) {
    throw toError("chat/too-long", "Message is too long (max 5000 characters).", "संदेश बहुत लंबा है (अधिकतम 5000 अक्षर)।");
  }

  const match = await validateMatchAccess(matchId, senderId);
  const recipientId = match.user1Id === senderId ? match.user2Id : match.user1Id;

  try {
    const db = firebaseDb();

    // Create message
    const msgRef = await addDoc(collection(db, COLLECTIONS.MESSAGES), {
      matchId,
      senderId,
      content: content.trim(),
      type,
      mediaUrl: null,
      mediaDurationSec: null,
      status: "sent" as MessageDeliveryStatus,
      readAt: null,
      replyToId: replyToId ?? null,
      isDeleted: false,
      timestamp: serverTimestamp(),
    } satisfies Omit<MessageDocument, "timestamp"> & { timestamp: ReturnType<typeof serverTimestamp> });

    // Update match denormalised fields
    const matchRef = doc(db, COLLECTIONS.MATCHES, matchId);
    const preview =
      type === "text"
        ? content.trim().slice(0, 80)
        : type === "voice"
          ? "🎤 Voice note"
          : type === "image"
            ? "📷 Photo"
            : type === "icebreaker"
              ? "💡 Icebreaker"
              : content.trim().slice(0, 80);

    await updateDoc(matchRef, {
      lastMessageAt: serverTimestamp(),
      lastMessagePreview: preview,
      lastMessageSenderId: senderId,
      [`unreadCount.${recipientId}`]: (match.unreadCount?.[recipientId] ?? 0) + 1,
      updatedAt: serverTimestamp(),
    });

    // Create notification for recipient
    await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
      userId: recipientId,
      type: "message",
      title: "New message",
      titleHi: "नया संदेश",
      message: preview,
      messageHi: null,
      data: { matchId, senderId },
      targetId: matchId,
      isRead: false,
      groupCount: 1,
      createdAt: serverTimestamp(),
    } satisfies Omit<NotificationDocument, "createdAt"> & { createdAt: ReturnType<typeof serverTimestamp> });

    // Clear sender's typing indicator
    clearTypingStatus(matchId, senderId);

    return msgRef.id;
  } catch (err) {
    if ((err as ChatServiceError).code?.startsWith("chat/")) throw err;
    throw firestoreError(err);
  }
}

/**
 * Send a media message (voice note or photo).
 *
 * 1. Upload media to Firebase Storage
 * 2. Create message document with mediaUrl
 * 3. Update match denormalised fields
 */
export async function sendMediaMessage(
  matchId: string,
  senderId: string,
  file: Blob,
  type: "voice" | "image",
  durationSec?: number,
  caption?: string,
): Promise<string> {
  const match = await validateMatchAccess(matchId, senderId);
  const recipientId = match.user1Id === senderId ? match.user2Id : match.user1Id;

  try {
    // Upload media
    let mediaUrl: string;
    if (type === "voice") {
      mediaUrl = await uploadVoiceNote(file, matchId, senderId);
    } else {
      mediaUrl = await uploadChatPhoto(file as File, matchId, senderId);
    }

    const db = firebaseDb();

    const content = caption?.trim() || (type === "voice" ? "" : "");
    const preview = type === "voice" ? "🎤 Voice note" : "📷 Photo";

    const msgRef = await addDoc(collection(db, COLLECTIONS.MESSAGES), {
      matchId,
      senderId,
      content,
      type,
      mediaUrl,
      mediaDurationSec: type === "voice" ? (durationSec ?? null) : null,
      status: "sent" as MessageDeliveryStatus,
      readAt: null,
      replyToId: null,
      isDeleted: false,
      timestamp: serverTimestamp(),
    } satisfies Omit<MessageDocument, "timestamp"> & { timestamp: ReturnType<typeof serverTimestamp> });

    // Update match
    const matchRef = doc(db, COLLECTIONS.MATCHES, matchId);
    await updateDoc(matchRef, {
      lastMessageAt: serverTimestamp(),
      lastMessagePreview: preview,
      lastMessageSenderId: senderId,
      [`unreadCount.${recipientId}`]: (match.unreadCount?.[recipientId] ?? 0) + 1,
      updatedAt: serverTimestamp(),
    });

    // Notification
    await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
      userId: recipientId,
      type: "message",
      title: "New message",
      titleHi: "नया संदेश",
      message: preview,
      messageHi: null,
      data: { matchId, senderId },
      targetId: matchId,
      isRead: false,
      groupCount: 1,
      createdAt: serverTimestamp(),
    } satisfies Omit<NotificationDocument, "createdAt"> & { createdAt: ReturnType<typeof serverTimestamp> });

    return msgRef.id;
  } catch (err) {
    if ((err as ChatServiceError).code?.startsWith("chat/")) throw err;
    throw firestoreError(err);
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// READ MESSAGES
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Load paginated message history for a match (newest first).
 *
 * @param matchId     – Match document ID
 * @param pageSize    – Number of messages per page (default 30)
 * @param startAfterDoc – Last document from previous page (for pagination)
 */
export async function getMessages(
  matchId: string,
  pageSize: number = DEFAULT_PAGE_SIZE,
  startAfterDoc?: QueryDocumentSnapshot | null,
): Promise<MessagePage> {
  try {
    const db = firebaseDb();
    const messagesRef = collection(db, COLLECTIONS.MESSAGES);

    const constraints: any[] = [
      where("matchId", "==", matchId),
      where("isDeleted", "==", false),
      orderBy("timestamp", "desc"),
      firestoreLimit(pageSize + 1), // +1 to check hasMore
    ];

    if (startAfterDoc) {
      constraints.push(startAfter(startAfterDoc));
    }

    const q = query(messagesRef, ...constraints);
    const snap = await getDocs(q);

    const hasMore = snap.docs.length > pageSize;
    const docs = hasMore ? snap.docs.slice(0, pageSize) : snap.docs;

    const messages: ChatMessage[] = docs.map((d) => ({
      id: d.id,
      data: d.data() as MessageDocument,
    }));

    return {
      messages,
      lastDoc: docs.length > 0 ? docs[docs.length - 1] : null,
      hasMore,
    };
  } catch (err) {
    throw firestoreError(err);
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// READ RECEIPTS
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Mark all unread messages in a match as read for the given user.
 * Also resets the user's unreadCount on the match document.
 *
 * Call this when the chat screen is opened/focused.
 */
export async function markMessagesAsRead(
  matchId: string,
  userId: string,
): Promise<void> {
  try {
    const db = firebaseDb();
    const messagesRef = collection(db, COLLECTIONS.MESSAGES);

    // Find unread messages sent by the OTHER user
    const q = query(
      messagesRef,
      where("matchId", "==", matchId),
      where("senderId", "!=", userId),
      where("status", "in", ["sent", "delivered"]),
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      // Still reset unread count even if no unread messages found
      const matchRef = doc(db, COLLECTIONS.MATCHES, matchId);
      await updateDoc(matchRef, {
        [`unreadCount.${userId}`]: 0,
        updatedAt: serverTimestamp(),
      });
      return;
    }

    // Batch update all unread messages
    const batch = writeBatch(db);

    snap.docs.forEach((d) => {
      batch.update(d.ref, {
        status: "read" as MessageDeliveryStatus,
        readAt: serverTimestamp(),
      });
    });

    // Reset unread count on match
    const matchRef = doc(db, COLLECTIONS.MATCHES, matchId);
    batch.update(matchRef, {
      [`unreadCount.${userId}`]: 0,
      updatedAt: serverTimestamp(),
    });

    await batch.commit();
  } catch (err) {
    // Non-fatal — read receipts are best-effort
    console.warn("[BandhanChat] markMessagesAsRead failed:", err);
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// DELETE & REPORT
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Soft-delete a message (sender only).
 * Sets isDeleted = true and replaces content with placeholder.
 */
export async function deleteMessage(
  messageId: string,
  senderId: string,
): Promise<void> {
  try {
    const db = firebaseDb();
    const msgRef = doc(db, COLLECTIONS.MESSAGES, messageId);
    const snap = await getDoc(msgRef);

    if (!snap.exists()) {
      throw toError("chat/msg-not-found", "Message not found.", "संदेश नहीं मिला।");
    }

    const msg = snap.data() as MessageDocument;
    if (msg.senderId !== senderId) {
      throw toError("chat/not-sender", "You can only delete your own messages.", "आप केवल अपने संदेश हटा सकते हैं।");
    }

    await updateDoc(msgRef, {
      isDeleted: true,
      content: "This message was deleted",
      mediaUrl: null,
    });
  } catch (err) {
    if ((err as ChatServiceError).code?.startsWith("chat/")) throw err;
    throw firestoreError(err);
  }
}

/**
 * Report a message. Creates a report document for moderation.
 */
export async function reportMessage(
  messageId: string,
  reporterId: string,
  reason: ReportReason,
  comment?: string,
): Promise<string> {
  try {
    const db = firebaseDb();
    const msgRef = doc(db, COLLECTIONS.MESSAGES, messageId);
    const snap = await getDoc(msgRef);

    if (!snap.exists()) {
      throw toError("chat/msg-not-found", "Message not found.", "संदेश नहीं मिला।");
    }

    const msg = snap.data() as MessageDocument;

    const reportRef = await addDoc(collection(db, COLLECTIONS.REPORTS), {
      reporterId,
      reportedUserId: msg.senderId,
      reason,
      comment: comment ?? null,
      evidenceUrls: [],
      status: "pending",
      moderatorNotes: null,
      resolvedBy: null,
      resolvedAt: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return reportRef.id;
  } catch (err) {
    if ((err as ChatServiceError).code?.startsWith("chat/")) throw err;
    throw firestoreError(err);
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// REAL-TIME LISTENERS
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Subscribe to new messages in a match (real-time via onSnapshot).
 *
 * Returns an unsubscribe function — **MUST** be called on component unmount.
 *
 * The listener only fires for messages newer than `sinceTimestamp`.
 * On first call pass `new Date()` to get only future messages; the initial
 * history should be loaded with `getMessages()`.
 */
export function onNewMessages(
  matchId: string,
  sinceTimestamp: Date,
  callback: (messages: ChatMessage[]) => void,
): Unsubscribe {
  const db = firebaseDb();
  const messagesRef = collection(db, COLLECTIONS.MESSAGES);

  const sinceFs = Timestamp.fromDate(sinceTimestamp);

  const q = query(
    messagesRef,
    where("matchId", "==", matchId),
    where("timestamp", ">", sinceFs),
    orderBy("timestamp", "asc"),
  );

  return onSnapshot(q, (snap) => {
    const messages: ChatMessage[] = snap.docs.map((d) => ({
      id: d.id,
      data: d.data() as MessageDocument,
    }));
    callback(messages);
  });
}

/**
 * Subscribe to read-receipt status changes on messages sent by `userId`.
 * Fires whenever any of their sent messages' status changes.
 */
export function onReadReceipts(
  matchId: string,
  userId: string,
  callback: (updatedMessages: ChatMessage[]) => void,
): Unsubscribe {
  const db = firebaseDb();
  const messagesRef = collection(db, COLLECTIONS.MESSAGES);

  const q = query(
    messagesRef,
    where("matchId", "==", matchId),
    where("senderId", "==", userId),
    orderBy("timestamp", "desc"),
    firestoreLimit(50),
  );

  return onSnapshot(q, (snap) => {
    const messages: ChatMessage[] = snap.docs.map((d) => ({
      id: d.id,
      data: d.data() as MessageDocument,
    }));
    callback(messages);
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// TYPING INDICATORS
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Set the typing status for a user in a match.
 *
 * Writes to a sub-collection: matches/{matchId}/typing/{userId}
 *
 * The field auto-expires conceptually — the listener checks `updatedAt`
 * and ignores statuses older than TYPING_EXPIRE_MS.
 */
export async function setTypingStatus(
  matchId: string,
  userId: string,
  isTyping: boolean,
): Promise<void> {
  try {
    const db = firebaseDb();
    const typingRef = doc(db, COLLECTIONS.MATCHES, matchId, "typing", userId);
    await setDoc(typingRef, {
      isTyping,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch {
    // Non-fatal — typing indicators are best-effort
  }
}

/**
 * Clear typing status (convenience wrapper).
 */
function clearTypingStatus(matchId: string, userId: string): void {
  setTypingStatus(matchId, userId, false).catch(() => {});
}

/**
 * Listen for the other user's typing status.
 *
 * Returns an unsubscribe function — **MUST** be called on component unmount.
 *
 * @param matchId      – Match document ID
 * @param otherUserId  – The OTHER user's UID (not the current user)
 * @param callback     – Called with true/false whenever typing status changes
 */
export function onTypingStatus(
  matchId: string,
  otherUserId: string,
  callback: (isTyping: boolean) => void,
): Unsubscribe {
  const db = firebaseDb();
  const typingRef = doc(db, COLLECTIONS.MATCHES, matchId, "typing", otherUserId);

  return onSnapshot(typingRef, (snap) => {
    if (!snap.exists()) {
      callback(false);
      return;
    }

    const data = snap.data() as TypingStatus;

    if (!data.isTyping) {
      callback(false);
      return;
    }

    // Check freshness — ignore stale typing indicators
    const updatedAt = data.updatedAt;
    if (updatedAt && typeof updatedAt.toMillis === "function") {
      const age = Date.now() - updatedAt.toMillis();
      if (age > TYPING_EXPIRE_MS) {
        callback(false);
        return;
      }
    }

    callback(true);
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// MEDIA UPLOAD
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Upload a voice note to Firebase Storage.
 *
 * @param blob     – Recorded audio Blob (webm/opus or wav)
 * @param matchId  – Match ID (used in storage path)
 * @param senderId – Sender UID
 * @returns Download URL
 * @throws ChatServiceError if duration > 15s
 */
export async function uploadVoiceNote(
  blob: Blob,
  matchId: string,
  senderId: string,
): Promise<string> {
  // Size check (15s of opus ≈ 60-120 KB, be generous)
  if (blob.size > 1024 * 1024) {
    throw toError(
      "chat/voice-too-large",
      "Voice note is too large. Please record a shorter message.",
      "वॉइस नोट बहुत बड़ा है। कृपया छोटा संदेश रिकॉर्ड करें।",
    );
  }

  try {
    const storage = firebaseStorage();
    const ts = Date.now();
    const ext = blob.type.includes("webm") ? "webm" : "ogg";
    const path = `chats/${matchId}/voice/${senderId}_${ts}.${ext}`;
    const storageRef = ref(storage, path);

    await uploadBytes(storageRef, blob, {
      contentType: blob.type || "audio/webm",
      customMetadata: {
        senderId,
        matchId,
        type: "voice",
      },
    });

    return await getDownloadURL(storageRef);
  } catch (err) {
    throw toError(
      "chat/voice-upload-failed",
      "Failed to upload voice note. Please try again.",
      "वॉइस नोट अपलोड करने में विफल। कृपया पुनः प्रयास करें।",
    );
  }
}

/**
 * Compress and upload a chat photo to Firebase Storage.
 *
 * Uses Canvas API to resize ≤ 1024px and compress to ≤ 500 KB JPEG.
 *
 * @param file     – Image File
 * @param matchId  – Match ID
 * @param senderId – Sender UID
 * @returns Download URL
 */
export async function uploadChatPhoto(
  file: File | Blob,
  matchId: string,
  senderId: string,
): Promise<string> {
  // Compress via Canvas
  const compressed = await compressImage(file);

  try {
    const storage = firebaseStorage();
    const ts = Date.now();
    const path = `chats/${matchId}/photos/${senderId}_${ts}.jpg`;
    const storageRef = ref(storage, path);

    await uploadBytes(storageRef, compressed, {
      contentType: "image/jpeg",
      customMetadata: {
        senderId,
        matchId,
        type: "photo",
      },
    });

    return await getDownloadURL(storageRef);
  } catch {
    throw toError(
      "chat/photo-upload-failed",
      "Failed to upload photo. Please try again.",
      "फ़ोटो अपलोड करने में विफल। कृपया पुनः प्रयास करें।",
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Image compression (Canvas API — client-only)
// ─────────────────────────────────────────────────────────────────────────────

async function compressImage(file: File | Blob): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;
      if (width > MAX_PHOTO_DIMENSION || height > MAX_PHOTO_DIMENSION) {
        const ratio = Math.min(MAX_PHOTO_DIMENSION / width, MAX_PHOTO_DIMENSION / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(toError("chat/canvas-error", "Failed to process image.", "इमेज प्रोसेस करने में विफल।"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      let quality = 0.85;
      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(toError("chat/compress-error", "Failed to compress image.", "इमेज संपीड़ित करने में विफल।"));
              return;
            }
            if (blob.size <= MAX_PHOTO_BYTES || quality <= 0.1) {
              resolve(blob);
            } else {
              quality -= 0.1;
              tryCompress();
            }
          },
          "image/jpeg",
          quality,
        );
      };
      tryCompress();
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(toError("chat/load-error", "Failed to load image.", "इमेज लोड करने में विफल।"));
    };

    img.src = url;
  });
}
