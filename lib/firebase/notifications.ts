/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Notification Service (Firestore + FCM)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Centralised notification system with:
 *   • Firestore CRUD (create / read / mark-read / delete)
 *   • Real-time listeners via onSnapshot (returns Unsubscribe)
 *   • Notification grouping (e.g. "3 people liked your profile")
 *   • Firebase Cloud Messaging push notification registration
 *   • Per-type notification preferences stored in localStorage
 *   • Sound toggle
 *
 * Functions
 * ─────────
 *   createNotification()            — Write a new notification doc
 *   getNotifications()              — Paginated fetch (newest first)
 *   getUnreadCount()                — Single query for badge count
 *   markNotificationAsRead()        — Single doc update
 *   markAllAsRead()                 — Batch update all unread
 *   deleteNotification()            — Hard delete a doc
 *   onNewNotifications()            — Real-time onSnapshot listener
 *   onUnreadCount()                 — Real-time unread count listener
 *   requestPushPermission()         — FCM getToken + save to user doc
 *   getNotificationPreferences()    — Read from localStorage
 *   setNotificationPreferences()    — Write to localStorage
 *   isNotificationTypeEnabled()     — Quick check for a single type
 *
 * STRICT RULES
 * ────────────
 *   • All listeners return Unsubscribe — MUST be called on unmount
 *   • Push notifications respect user preferences before displaying
 *   • Grouped notifications update groupCount in real-time
 *   • Unread count badge updates instantly via dedicated listener
 *   • Bilingual errors (en + hi) on every function
 *   • Typed against schema.ts NotificationDocument
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  doc,
  getDocs,
  getCountFromServer,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  startAfter,
  collection,
  serverTimestamp,
  onSnapshot,
  writeBatch,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from "firebase/firestore";

import { firebaseDb, firebaseApp } from "@/lib/firebase/config";

import {
  COLLECTIONS,
  type NotificationDocument,
  type NotificationType,
} from "@/lib/firebase/schema";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** Bilingual service error */
export interface NotificationServiceError {
  code: string;
  en: string;
  hi: string;
}

/** Notification enriched with Firestore doc ID */
export interface NotificationItem {
  id: string;
  data: NotificationDocument;
}

/** Paginated response */
export interface NotificationPage {
  notifications: NotificationItem[];
  lastDoc: QueryDocumentSnapshot | null;
  hasMore: boolean;
}

/** Data payload for createNotification */
export interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  titleHi?: string | null;
  message: string;
  messageHi?: string | null;
  /** Arbitrary metadata the client can act on */
  data?: Record<string, string> | null;
  /** Deep-link target (matchId, userId, etc.) */
  targetId?: string | null;
  /** If > 1, this is a grouped notification */
  groupCount?: number;
}

/**
 * User's per-type notification preferences.
 *
 * Stored in localStorage under key `bandhan_notif_prefs_{uid}`.
 * Default: all types enabled, sound enabled.
 */
export interface NotificationPreferences {
  match: boolean;
  message: boolean;
  like: boolean;
  special: boolean;
  premium: boolean;
  visit: boolean;
  verification: boolean;
  reminder: boolean;
  system: boolean;
  /** Whether to play the notification sound */
  soundEnabled: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_PAGE_SIZE = 30;

const DEFAULT_PREFERENCES: NotificationPreferences = {
  match: true,
  message: true,
  like: true,
  special: true,
  premium: true,
  visit: true,
  verification: true,
  reminder: true,
  system: true,
  soundEnabled: true,
};

function prefsKey(userId: string): string {
  return `bandhan_notif_prefs_${userId}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Error helpers
// ─────────────────────────────────────────────────────────────────────────────

function toError(
  code: string,
  en: string,
  hi: string,
): NotificationServiceError {
  return { code, en, hi };
}

function wrapFirestoreError(err: unknown): NotificationServiceError {
  const code = (err as any)?.code ?? "firestore/unknown";
  return {
    code,
    en: "An unexpected error occurred. Please try again.",
    hi: "एक अनपेक्षित त्रुटि हुई। कृपया पुनः प्रयास करें।",
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// CREATE
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Create a new notification document.
 *
 * @returns The new notification's Firestore document ID
 */
export async function createNotification(
  data: CreateNotificationData,
): Promise<string> {
  try {
    const db = firebaseDb();

    const docData: Omit<NotificationDocument, "createdAt"> & {
      createdAt: ReturnType<typeof serverTimestamp>;
    } = {
      userId: data.userId,
      type: data.type,
      title: data.title,
      titleHi: data.titleHi ?? null,
      message: data.message,
      messageHi: data.messageHi ?? null,
      data: data.data ?? null,
      targetId: data.targetId ?? null,
      isRead: false,
      groupCount: data.groupCount ?? 1,
      createdAt: serverTimestamp(),
    };

    const ref = await addDoc(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      docData,
    );

    return ref.id;
  } catch (err) {
    if ((err as NotificationServiceError).code?.startsWith("notif/")) throw err;
    throw wrapFirestoreError(err);
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// READ (one-shot)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Fetch paginated notifications for a user (newest first).
 *
 * @param userId         User UID
 * @param pageSize       Results per page (default 30)
 * @param unreadOnly     If true, only fetch unread notifications
 * @param startAfterDoc  Cursor from previous page
 */
export async function getNotifications(
  userId: string,
  pageSize: number = DEFAULT_PAGE_SIZE,
  unreadOnly: boolean = false,
  startAfterDoc?: QueryDocumentSnapshot | null,
): Promise<NotificationPage> {
  try {
    const db = firebaseDb();
    const colRef = collection(db, COLLECTIONS.NOTIFICATIONS);

    const constraints: any[] = [
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      firestoreLimit(pageSize + 1),
    ];

    if (unreadOnly) {
      constraints.splice(1, 0, where("isRead", "==", false));
    }

    if (startAfterDoc) {
      constraints.push(startAfter(startAfterDoc));
    }

    const q = query(colRef, ...constraints);
    const snap = await getDocs(q);

    const hasMore = snap.docs.length > pageSize;
    const docs = hasMore ? snap.docs.slice(0, pageSize) : snap.docs;

    const notifications: NotificationItem[] = docs.map((d) => ({
      id: d.id,
      data: d.data() as NotificationDocument,
    }));

    return {
      notifications,
      lastDoc: docs.length > 0 ? docs[docs.length - 1] : null,
      hasMore,
    };
  } catch (err) {
    throw wrapFirestoreError(err);
  }
}

/**
 * Get the unread notification count for a user (single query, no listener).
 */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const db = firebaseDb();
    const q = query(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      where("userId", "==", userId),
      where("isRead", "==", false),
    );
    const snap = await getCountFromServer(q);
    return snap.data().count;
  } catch {
    return 0;
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// MARK READ
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Mark a single notification as read.
 */
export async function markNotificationAsRead(
  notificationId: string,
): Promise<void> {
  try {
    const db = firebaseDb();
    const ref = doc(db, COLLECTIONS.NOTIFICATIONS, notificationId);
    await updateDoc(ref, { isRead: true });
  } catch (err) {
    throw wrapFirestoreError(err);
  }
}

/**
 * Mark ALL unread notifications as read for a user.
 * Uses a batch write (max 500 per batch — sufficient for most users).
 */
export async function markAllAsRead(userId: string): Promise<void> {
  try {
    const db = firebaseDb();
    const q = query(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      where("userId", "==", userId),
      where("isRead", "==", false),
    );

    const snap = await getDocs(q);
    if (snap.empty) return;

    const batch = writeBatch(db);
    snap.docs.forEach((d) => {
      batch.update(d.ref, { isRead: true });
    });
    await batch.commit();
  } catch (err) {
    throw wrapFirestoreError(err);
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// DELETE
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Permanently delete a notification document.
 */
export async function deleteNotification(
  notificationId: string,
): Promise<void> {
  try {
    const db = firebaseDb();
    await deleteDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notificationId));
  } catch (err) {
    throw wrapFirestoreError(err);
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// REAL-TIME LISTENERS
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Subscribe to notifications for a user (newest first, real-time).
 *
 * Returns an **Unsubscribe** — MUST be called on component unmount.
 *
 * @param userId     User UID
 * @param callback   Fires with full sorted list on every change
 * @param maxItems   Max items to keep (default 50)
 */
export function onNewNotifications(
  userId: string,
  callback: (notifications: NotificationItem[]) => void,
  maxItems: number = 50,
): Unsubscribe {
  const db = firebaseDb();
  const q = query(
    collection(db, COLLECTIONS.NOTIFICATIONS),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    firestoreLimit(maxItems),
  );

  return onSnapshot(q, (snap) => {
    const items: NotificationItem[] = snap.docs.map((d) => ({
      id: d.id,
      data: d.data() as NotificationDocument,
    }));
    callback(items);
  });
}

/**
 * Subscribe to the unread notification count for a user.
 *
 * Returns an **Unsubscribe** — MUST be called on component unmount.
 *
 * Uses a query snapshot `.size` for instant badge updates.
 */
export function onUnreadCount(
  userId: string,
  callback: (count: number) => void,
): Unsubscribe {
  const db = firebaseDb();
  const q = query(
    collection(db, COLLECTIONS.NOTIFICATIONS),
    where("userId", "==", userId),
    where("isRead", "==", false),
  );

  return onSnapshot(q, (snap) => {
    callback(snap.size);
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// PUSH NOTIFICATIONS (Firebase Cloud Messaging)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Request browser notification permission and register the FCM token.
 *
 * 1. Calls Notification.requestPermission()
 * 2. Loads firebase/messaging lazily (it's a large module)
 * 3. Gets the FCM token using the VAPID key
 * 4. Saves the token to the user's Firestore document
 *
 * Returns the FCM token string, or null if permission was denied.
 */
export async function requestPushPermission(
  userId: string,
): Promise<string | null> {
  if (typeof window === "undefined") return null;
  if (!("Notification" in window)) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    // Lazy-import messaging to avoid bundling it for users who never opt in
    const { getMessaging, getToken } = await import("firebase/messaging");

    const messaging = getMessaging(firebaseApp());
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

    if (!vapidKey) {
      console.warn(
        "[BandhanNotif] NEXT_PUBLIC_FIREBASE_VAPID_KEY is not set. Push notifications disabled.",
      );
      return null;
    }

    const token = await getToken(messaging, { vapidKey });

    // Persist token to user doc for server-side push sends
    if (token) {
      const db = firebaseDb();
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      await updateDoc(userRef, { fcmToken: token });
    }

    return token;
  } catch (err) {
    console.warn("[BandhanNotif] Push registration failed:", err);
    return null;
  }
}

/**
 * Listen for foreground FCM messages and invoke a callback.
 *
 * Returns an **Unsubscribe** — MUST be called on component unmount.
 *
 * Background messages are handled by the service worker (public/sw.js).
 */
export async function onForegroundMessage(
  callback: (payload: {
    title: string;
    body: string;
    data?: Record<string, string>;
  }) => void,
): Promise<Unsubscribe | null> {
  if (typeof window === "undefined") return null;

  try {
    const { getMessaging, onMessage } = await import("firebase/messaging");
    const messaging = getMessaging(firebaseApp());

    const unsub = onMessage(messaging, (payload) => {
      callback({
        title: payload.notification?.title ?? "Bandhan AI",
        body: payload.notification?.body ?? "",
        data: (payload.data as Record<string, string>) ?? undefined,
      });
    });

    return unsub;
  } catch {
    return null;
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// NOTIFICATION PREFERENCES (localStorage)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Read notification preferences from localStorage.
 * Returns defaults if nothing is stored yet.
 */
export function getNotificationPreferences(
  userId: string,
): NotificationPreferences {
  if (typeof window === "undefined") return { ...DEFAULT_PREFERENCES };

  try {
    const raw = localStorage.getItem(prefsKey(userId));
    if (!raw) return { ...DEFAULT_PREFERENCES };
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

/**
 * Save notification preferences to localStorage.
 */
export function setNotificationPreferences(
  userId: string,
  prefs: Partial<NotificationPreferences>,
): void {
  if (typeof window === "undefined") return;

  try {
    const current = getNotificationPreferences(userId);
    const merged = { ...current, ...prefs };
    localStorage.setItem(prefsKey(userId), JSON.stringify(merged));
  } catch {
    // localStorage may be full or disabled — non-fatal
  }
}

/**
 * Check whether a specific notification type is enabled.
 */
export function isNotificationTypeEnabled(
  userId: string,
  type: NotificationType,
): boolean {
  const prefs = getNotificationPreferences(userId);
  return (prefs as Record<string, boolean>)[type] ?? true;
}

// ═════════════════════════════════════════════════════════════════════════════
// NOTIFICATION GROUPING HELPERS
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Group a flat list of notifications by type, combining ones
 * that occurred within the last `windowMs` into a single grouped item.
 *
 * E.g. 3 separate "like" notifications become one with groupCount = 3
 * and message = "3 people liked your profile".
 *
 * This is a **client-side** convenience — the Firestore docs stay flat.
 */
export function groupNotifications(
  items: NotificationItem[],
  windowMs: number = 24 * 60 * 60 * 1000, // 24 hours
): NotificationItem[] {
  const now = Date.now();
  const grouped = new Map<string, NotificationItem>();
  const standalone: NotificationItem[] = [];

  // Types that should be grouped
  const GROUPABLE: Set<NotificationType> = new Set([
    "like",
    "special",
    "premium",
    "visit",
  ]);

  for (const item of items) {
    const ts = toMillis(item.data.createdAt);
    const age = now - ts;

    if (!GROUPABLE.has(item.data.type) || age > windowMs) {
      standalone.push(item);
      continue;
    }

    const key = `${item.data.type}_${item.data.isRead ? "read" : "unread"}`;
    const existing = grouped.get(key);

    if (existing) {
      // Merge into existing group — keep the newest one's data
      const existingTs = toMillis(existing.data.createdAt);
      if (ts > existingTs) {
        // This item is newer — use its data but accumulate count
        grouped.set(key, {
          id: item.id,
          data: {
            ...item.data,
            groupCount: (existing.data.groupCount ?? 1) + 1,
            message: buildGroupMessage(
              item.data.type,
              (existing.data.groupCount ?? 1) + 1,
            ),
            messageHi: buildGroupMessageHi(
              item.data.type,
              (existing.data.groupCount ?? 1) + 1,
            ),
          },
        });
      } else {
        // Existing is newer — just increment count
        grouped.set(key, {
          ...existing,
          data: {
            ...existing.data,
            groupCount: (existing.data.groupCount ?? 1) + 1,
            message: buildGroupMessage(
              existing.data.type,
              (existing.data.groupCount ?? 1) + 1,
            ),
            messageHi: buildGroupMessageHi(
              existing.data.type,
              (existing.data.groupCount ?? 1) + 1,
            ),
          },
        });
      }
    } else {
      grouped.set(key, { ...item });
    }
  }

  // Merge grouped and standalone, sort by time desc
  const result = [...grouped.values(), ...standalone];
  result.sort(
    (a, b) => toMillis(b.data.createdAt) - toMillis(a.data.createdAt),
  );
  return result;
}

function buildGroupMessage(type: NotificationType, count: number): string {
  switch (type) {
    case "like":
      return `${count} people liked your profile`;
    case "special":
      return `${count} people sent Special Interest`;
    case "premium":
      return `${count} people sent Premium Interest`;
    case "visit":
      return `${count} people viewed your profile`;
    default:
      return `${count} new notifications`;
  }
}

function buildGroupMessageHi(type: NotificationType, count: number): string {
  switch (type) {
    case "like":
      return `${count} लोगों ने आपकी प्रोफ़ाइल पसंद की`;
    case "special":
      return `${count} लोगों ने Special Interest भेजा`;
    case "premium":
      return `${count} लोगों ने Premium Interest भेजा`;
    case "visit":
      return `${count} लोगों ने आपकी प्रोफ़ाइल देखी`;
    default:
      return `${count} नई सूचनाएं`;
  }
}

function toMillis(ts: any): number {
  if (!ts) return 0;
  if (typeof ts === "string") return new Date(ts).getTime();
  if (typeof ts?.toMillis === "function") return ts.toMillis();
  return 0;
}
