/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Firebase Storage Service
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Centralised upload / download / delete service for all file types:
 *   • Profile photos  (JPEG ≤ 500 KB, max 1200px, up to 5 per user)
 *   • Chat photos     (JPEG ≤ 500 KB, max 1200px)
 *   • Voice notes     (WebM/Opus ≤ 15 s, 24 kbps target)
 *
 * Every upload:
 *   1. Validates file type + size
 *   2. Compresses client-side (Canvas for images, MediaRecorder for audio)
 *   3. Uploads with `uploadBytesResumable` for progress tracking
 *   4. Returns download URL + storage path
 *
 * STRICT RULES
 * ────────────
 *   • All uploads show progress via onProgress callback
 *   • Compression happens BEFORE upload — never raw files
 *   • Bilingual errors (en + hi)
 *   • Storage paths: users/{uid}/photos/{ts}.jpg
 *                    chats/{matchId}/photos/{uid}_{ts}.jpg
 *                    chats/{matchId}/voice/{uid}_{ts}.webm
 *   • File type validation — only images for photo slots
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  ref,
  uploadBytesResumable,
  getDownloadURL as fbGetDownloadURL,
  deleteObject,
  type UploadTask,
  type StorageReference,
} from "firebase/storage";

import { firebaseStorage } from "@/lib/firebase/config";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** Bilingual error */
export interface StorageServiceError {
  code: string;
  en: string;
  hi: string;
}

/** Upload progress callback payload */
export interface UploadProgress {
  /** 0–100 */
  percent: number;
  /** Bytes transferred so far */
  bytesTransferred: number;
  /** Total bytes to upload */
  totalBytes: number;
}

/** Successful upload result */
export interface UploadResult {
  /** Public download URL */
  downloadUrl: string;
  /** Storage path for later deletion */
  storagePath: string;
  /** Final compressed size in bytes */
  sizeBytes: number;
}

/** Options passed to every upload function */
export interface UploadOptions {
  /** Called repeatedly as bytes are uploaded (0–100%) */
  onProgress?: (progress: UploadProgress) => void;
}

/** Voice note metadata */
export interface VoiceNoteMetadata {
  /** Match ID this voice note belongs to */
  matchId: string;
  /** Sender user ID */
  senderId: string;
  /** Duration in seconds (must be ≤ 15) */
  durationSec: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/** Image compression constants */
const IMAGE_MAX_DIMENSION = 1200;
const IMAGE_MAX_BYTES = 500 * 1024; // 500 KB
const IMAGE_INITIAL_QUALITY = 0.8;
const IMAGE_QUALITY_STEP = 0.1;
const IMAGE_MIN_QUALITY = 0.1;

/** Allowed MIME types for image uploads */
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

/** Voice note constants */
const VOICE_MAX_DURATION_SEC = 15;
const VOICE_MAX_BYTES = 1024 * 1024; // 1 MB generous ceiling

/** Profile photo limit */
const MAX_PROFILE_PHOTOS = 5;

// ─────────────────────────────────────────────────────────────────────────────
// Error helpers
// ─────────────────────────────────────────────────────────────────────────────

function toError(code: string, en: string, hi: string): StorageServiceError {
  return { code, en, hi };
}

function wrapFirebaseError(err: unknown): StorageServiceError {
  const code = (err as any)?.code ?? "storage/unknown";
  const MAP: Record<string, { en: string; hi: string }> = {
    "storage/unauthorized": {
      en: "You don't have permission to upload files.",
      hi: "आपको फ़ाइल अपलोड करने की अनुमति नहीं है।",
    },
    "storage/canceled": {
      en: "Upload was cancelled.",
      hi: "अपलोड रद्द कर दिया गया।",
    },
    "storage/quota-exceeded": {
      en: "Storage quota exceeded. Please contact support.",
      hi: "स्टोरेज सीमा पार हो गई। कृपया सहायता से संपर्क करें।",
    },
    "storage/retry-limit-exceeded": {
      en: "Upload failed after multiple retries. Please try again later.",
      hi: "कई प्रयासों के बाद अपलोड विफल। कृपया बाद में पुनः प्रयास करें।",
    },
  };
  const mapped = MAP[code];
  if (mapped) return { code, ...mapped };
  return {
    code,
    en: "Upload failed. Please try again.",
    hi: "अपलोड विफल। कृपया पुनः प्रयास करें।",
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// IMAGE COMPRESSION (Canvas API — client-side)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Validate that a file is an acceptable image type.
 *
 * @throws StorageServiceError if type is invalid
 */
function validateImageType(file: File | Blob): void {
  const type = (file as File).type || "";
  if (!type || !ALLOWED_IMAGE_TYPES.has(type.toLowerCase())) {
    throw toError(
      "storage/invalid-type",
      "Please upload an image file (JPEG, PNG, or WebP).",
      "कृपया एक इमेज फ़ाइल अपलोड करें (JPEG, PNG, या WebP)।",
    );
  }
}

/**
 * Compress an image to JPEG ≤ 500 KB, max 1200px on longest edge.
 *
 * Algorithm:
 *   1. Load into an <img> element
 *   2. Resize if larger than IMAGE_MAX_DIMENSION
 *   3. Draw onto a <canvas>
 *   4. Export as JPEG at 80% quality
 *   5. If still > 500 KB, reduce quality in 10% steps until OK
 *
 * @param file     Raw image file
 * @param maxSizeKB Override max size in KB (default 500)
 * @returns Compressed JPEG Blob
 */
export function compressImage(
  file: File | Blob,
  maxSizeKB: number = 500,
): Promise<Blob> {
  validateImageType(file);
  const maxBytes = maxSizeKB * 1024;

  return new Promise<Blob>((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // ── Resize ──
      let { width, height } = img;
      if (width > IMAGE_MAX_DIMENSION || height > IMAGE_MAX_DIMENSION) {
        const ratio = Math.min(
          IMAGE_MAX_DIMENSION / width,
          IMAGE_MAX_DIMENSION / height,
        );
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(
          toError(
            "storage/canvas-error",
            "Failed to process image. Please try a different photo.",
            "इमेज प्रोसेस करने में विफल। कृपया एक अलग फ़ोटो आज़माएं।",
          ),
        );
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // ── Iterative quality reduction ──
      let quality = IMAGE_INITIAL_QUALITY;
      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(
                toError(
                  "storage/compress-error",
                  "Failed to compress image.",
                  "इमेज संपीड़ित करने में विफल।",
                ),
              );
              return;
            }
            if (blob.size <= maxBytes || quality <= IMAGE_MIN_QUALITY) {
              resolve(blob);
            } else {
              quality -= IMAGE_QUALITY_STEP;
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
      reject(
        toError(
          "storage/load-error",
          "Failed to load image. The file may be corrupted.",
          "इमेज लोड करने में विफल। फ़ाइल दूषित हो सकती है।",
        ),
      );
    };

    img.src = url;
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// AUDIO COMPRESSION / VALIDATION
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Validate and optionally trim an audio Blob.
 *
 * The MediaRecorder API in modern browsers already encodes to Opus in WebM
 * at a low bitrate by default. We enforce:
 *   • Max 15 seconds duration
 *   • Max 1 MB file size
 *
 * @param blob        Raw audio Blob from MediaRecorder
 * @param durationSec Recorded duration
 * @returns The blob (unchanged — already compressed by MediaRecorder)
 * @throws StorageServiceError on validation failure
 */
export function compressAudio(
  blob: Blob,
  durationSec: number,
): Blob {
  if (durationSec > VOICE_MAX_DURATION_SEC) {
    throw toError(
      "storage/voice-too-long",
      `Voice note must be ${VOICE_MAX_DURATION_SEC} seconds or less. Yours is ${Math.ceil(durationSec)}s.`,
      `वॉइस नोट ${VOICE_MAX_DURATION_SEC} सेकंड या उससे कम होना चाहिए। आपका ${Math.ceil(durationSec)} सेकंड है।`,
    );
  }

  if (blob.size > VOICE_MAX_BYTES) {
    throw toError(
      "storage/voice-too-large",
      "Voice note file is too large. Please record a shorter message.",
      "वॉइस नोट फ़ाइल बहुत बड़ी है। कृपया छोटा संदेश रिकॉर्ड करें।",
    );
  }

  return blob;
}

// ═════════════════════════════════════════════════════════════════════════════
// UPLOAD CORE (with progress tracking)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Internal: Upload a Blob to a given storage path with progress tracking.
 *
 * Uses `uploadBytesResumable` so we can report percentage progress.
 *
 * @returns UploadResult with downloadUrl + storagePath
 */
async function uploadWithProgress(
  blob: Blob,
  storagePath: string,
  contentType: string,
  metadata: Record<string, string>,
  options?: UploadOptions,
): Promise<UploadResult> {
  const storage = firebaseStorage();
  const storageRef = ref(storage, storagePath);

  return new Promise<UploadResult>((resolve, reject) => {
    const task: UploadTask = uploadBytesResumable(storageRef, blob, {
      contentType,
      customMetadata: metadata,
    });

    task.on(
      "state_changed",
      // Progress
      (snapshot) => {
        const percent = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
        );
        options?.onProgress?.({
          percent,
          bytesTransferred: snapshot.bytesTransferred,
          totalBytes: snapshot.totalBytes,
        });
      },
      // Error
      (error) => {
        reject(wrapFirebaseError(error));
      },
      // Complete
      async () => {
        try {
          const downloadUrl = await fbGetDownloadURL(storageRef);
          resolve({
            downloadUrl,
            storagePath,
            sizeBytes: blob.size,
          });
        } catch (err) {
          reject(wrapFirebaseError(err));
        }
      },
    );
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// PUBLIC API
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Upload a profile photo.
 *
 * Pipeline:
 *   1. Validate image type
 *   2. Check photo count (max 5)
 *   3. Compress to JPEG ≤ 500 KB, max 1200px
 *   4. Upload to `users/{userId}/photos/{timestamp}.jpg`
 *   5. Return download URL + storage path
 *
 * NOTE: This function does NOT update Firestore — the caller (users.ts or
 * a React component) is responsible for updating the user document's
 * `photos[]` array. This keeps the storage layer decoupled from Firestore.
 *
 * @param userId        Firebase Auth UID
 * @param file          Raw image File from <input>
 * @param index         Optional explicit index (0-4). If omitted, uses timestamp.
 * @param currentCount  Current number of photos the user has (for limit check)
 * @param options       Upload options (onProgress callback)
 */
export async function uploadProfilePhoto(
  userId: string,
  file: File,
  index?: number,
  currentCount: number = 0,
  options?: UploadOptions,
): Promise<UploadResult> {
  // ── Validate ──
  validateImageType(file);

  if (currentCount >= MAX_PROFILE_PHOTOS) {
    throw toError(
      "storage/photo-limit",
      `You can upload a maximum of ${MAX_PROFILE_PHOTOS} photos. Please delete one first.`,
      `आप अधिकतम ${MAX_PROFILE_PHOTOS} फ़ोटो अपलोड कर सकते हैं। कृपया पहले एक हटाएं।`,
    );
  }

  // ── Compress ──
  const compressed = await compressImage(file);

  // ── Path ──
  const ts = Date.now();
  const suffix = index !== undefined ? `photo_${index}` : ts;
  const storagePath = `users/${userId}/photos/${suffix}.jpg`;

  // ── Upload ──
  return uploadWithProgress(
    compressed,
    storagePath,
    "image/jpeg",
    {
      uploadedBy: userId,
      originalName: file.name,
      originalSize: String(file.size),
      compressedSize: String(compressed.size),
      type: "profile-photo",
    },
    options,
  );
}

/**
 * Upload a voice note for a chat conversation.
 *
 * Pipeline:
 *   1. Validate duration ≤ 15s and size ≤ 1 MB
 *   2. Upload to `chats/{matchId}/voice/{senderId}_{timestamp}.webm`
 *   3. Return download URL + storage path
 *
 * @param blob      Audio Blob from MediaRecorder (WebM/Opus)
 * @param metadata  Voice note metadata (matchId, senderId, durationSec)
 * @param options   Upload options (onProgress callback)
 */
export async function uploadVoiceNote(
  blob: Blob,
  metadata: VoiceNoteMetadata,
  options?: UploadOptions,
): Promise<UploadResult> {
  // ── Validate + compress ──
  const validated = compressAudio(blob, metadata.durationSec);

  // ── Path ──
  const ts = Date.now();
  const ext = blob.type.includes("webm") ? "webm" : "ogg";
  const storagePath = `chats/${metadata.matchId}/voice/${metadata.senderId}_${ts}.${ext}`;

  // ── Upload ──
  return uploadWithProgress(
    validated,
    storagePath,
    blob.type || "audio/webm;codecs=opus",
    {
      senderId: metadata.senderId,
      matchId: metadata.matchId,
      durationSec: String(metadata.durationSec),
      type: "voice-note",
    },
    options,
  );
}

/**
 * Upload a photo in a chat conversation.
 *
 * Pipeline:
 *   1. Validate image type
 *   2. Compress to JPEG ≤ 500 KB, max 1200px
 *   3. Upload to `chats/{matchId}/photos/{senderId}_{timestamp}.jpg`
 *   4. Return download URL + storage path
 *
 * @param file      Image File or Blob
 * @param matchId   Match conversation ID
 * @param senderId  Sender user ID
 * @param options   Upload options (onProgress callback)
 */
export async function uploadChatPhoto(
  file: File | Blob,
  matchId: string,
  senderId: string,
  options?: UploadOptions,
): Promise<UploadResult> {
  // ── Validate ──
  validateImageType(file);

  // ── Compress ──
  const compressed = await compressImage(file);

  // ── Path ──
  const ts = Date.now();
  const storagePath = `chats/${matchId}/photos/${senderId}_${ts}.jpg`;

  // ── Upload ──
  return uploadWithProgress(
    compressed,
    storagePath,
    "image/jpeg",
    {
      senderId,
      matchId,
      originalSize: String((file as File).size ?? file.size),
      compressedSize: String(compressed.size),
      type: "chat-photo",
    },
    options,
  );
}

/**
 * Delete a file from Firebase Storage by its storage path.
 *
 * @param storagePath  Path as returned in UploadResult (e.g. "users/abc/photos/123.jpg")
 * @throws StorageServiceError on failure
 */
export async function deleteFile(storagePath: string): Promise<void> {
  if (!storagePath) return;

  try {
    const storage = firebaseStorage();
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
  } catch (err) {
    // Ignore "object-not-found" — idempotent delete
    const code = (err as any)?.code;
    if (code === "storage/object-not-found") return;
    throw wrapFirebaseError(err);
  }
}

/**
 * Delete a file from Firebase Storage by its full download URL.
 *
 * Extracts the storage path from the URL, then calls deleteFile().
 * Safe to call with null/undefined — silently no-ops.
 *
 * @param fileUrl  Firebase Storage download URL
 */
export async function deleteFileByUrl(fileUrl: string | null | undefined): Promise<void> {
  if (!fileUrl) return;

  try {
    const storage = firebaseStorage();
    const storageRef = ref(storage, fileUrl);
    await deleteObject(storageRef);
  } catch (err) {
    const code = (err as any)?.code;
    if (code === "storage/object-not-found") return;
    throw wrapFirebaseError(err);
  }
}

/**
 * Get the download URL for a storage reference path.
 *
 * @param storagePath  Storage path (e.g. "users/abc/photos/123.jpg")
 * @returns Public download URL string
 */
export async function getDownloadUrl(storagePath: string): Promise<string> {
  try {
    const storage = firebaseStorage();
    const storageRef = ref(storage, storagePath);
    return await fbGetDownloadURL(storageRef);
  } catch (err) {
    throw wrapFirebaseError(err);
  }
}
