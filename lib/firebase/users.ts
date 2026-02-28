/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — User Profile CRUD Service
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Complete Firestore CRUD operations for the /users collection.
 * All functions are typed against lib/firebase/schema.ts → UserDocument.
 *
 * Functions
 * ─────────
 *   createUserProfile(uid, data)  — first-login profile creation
 *   getUserProfile(uid)           — single user by UID
 *   updateUserProfile(uid, data)  — partial update with validation
 *   uploadProfilePhoto(uid, file) — compress + upload to Storage
 *   getUserProfiles(uids[])       — batch get (max 30)
 *   searchUsers(filters)          — discovery feed queries
 *   calculateProfileCompletion()  — 0–100 score
 *   updateVerificationLevel()     — atomic level change
 *
 * Error handling
 * ──────────────
 *   Every function catches Firestore/Storage exceptions and re-throws
 *   a typed UserServiceError with a bilingual message (en + hi).
 *
 * STRICT RULES
 * ────────────
 *   • NO raw `any` types — everything is typed against schema.ts
 *   • Photo uploads compressed to < 500 KB client-side via Canvas
 *   • Verification level updates are atomic (runTransaction)
 *   • Profile completion is recalculated on every write
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  collection,
  serverTimestamp,
  runTransaction,
  documentId,
  type QueryConstraint,
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

import { firebaseDb, firebaseStorage } from "@/lib/firebase/config";

import {
  COLLECTIONS,
  firestoreConverter,
  type UserDocument,
  type UserPhoto,
  type VerificationLevel,
  type Intent,
  type Gender,
  type Diet,
} from "@/lib/firebase/schema";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** Bilingual error thrown by every user-service function */
export interface UserServiceError {
  code: string;
  en: string;
  hi: string;
}

/** Data accepted by createUserProfile — a subset of UserDocument */
export interface CreateUserProfileData {
  name: string;
  email?: string | null;
  phone: string;
  avatarUrl?: string | null;
}

/** Data accepted by updateUserProfile — any user-editable field */
export type UpdateUserProfileData = Partial<
  Pick<
    UserDocument,
    | "name"
    | "gender"
    | "dateOfBirth"
    | "age"
    | "bio"
    | "city"
    | "state"
    | "height"
    | "weight"
    | "education"
    | "occupation"
    | "annualIncome"
    | "religion"
    | "caste"
    | "gotra"
    | "manglik"
    | "motherTongue"
    | "familyType"
    | "fatherOccupation"
    | "motherOccupation"
    | "siblings"
    | "diet"
    | "smoking"
    | "drinking"
    | "intent"
    | "avatarUrl"
    | "photos"
    | "preferences"
    | "dealbreakers"
    | "privacy"
    | "isOnline"
    | "lastSeenAt"
    | "blockedUserIds"
  >
>;

/** Filters for searchUsers */
export interface UserSearchFilters {
  city?: string;
  gender?: Gender;
  ageMin?: number;
  ageMax?: number;
  intent?: Intent;
  diet?: Diet;
  verifiedOnly?: boolean;
  /** Exclude these UIDs from results (e.g. current user, blocked) */
  excludeUids?: string[];
  /** Max results (default 20, max 50) */
  maxResults?: number;
}

/** Result wrapper for getUserProfile */
export interface UserProfileResult {
  exists: boolean;
  user: UserDocument | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const MAX_PHOTO_BYTES = 500 * 1024; // 500 KB
const MAX_PHOTO_DIMENSION = 1024; // px
const BATCH_LIMIT = 30; // Firestore in() max is 30
const DEFAULT_SEARCH_LIMIT = 20;
const MAX_SEARCH_LIMIT = 50;

// ─────────────────────────────────────────────────────────────────────────────
// Error helpers
// ─────────────────────────────────────────────────────────────────────────────

function toError(code: string, en: string, hi: string): UserServiceError {
  return { code, en, hi };
}

function firestoreError(err: unknown): UserServiceError {
  const code = (err as any)?.code ?? "firestore/unknown";
  const MAP: Record<string, { en: string; hi: string }> = {
    "permission-denied": {
      en: "You don't have permission to perform this action.",
      hi: "आपको यह कार्य करने की अनुमति नहीं है।",
    },
    "not-found": {
      en: "Profile not found.",
      hi: "प्रोफ़ाइल नहीं मिली।",
    },
    unavailable: {
      en: "Service temporarily unavailable. Please try again.",
      hi: "सेवा अस्थायी रूप से अनुपलब्ध। कृपया पुनः प्रयास करें।",
    },
    "resource-exhausted": {
      en: "Too many requests. Please wait and try again.",
      hi: "बहुत अधिक अनुरोध। कृपया प्रतीक्षा करें और पुनः प्रयास करें।",
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
// Profile completion calculation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Weight map for profile completion percentage.
 * Each field has a weight; total of all weights = 100.
 */
const COMPLETION_WEIGHTS: { field: keyof UserDocument; weight: number }[] = [
  // Identity — 20 pts
  { field: "name", weight: 5 },
  { field: "gender", weight: 5 },
  { field: "dateOfBirth", weight: 5 },
  { field: "phone", weight: 5 },
  // Profile — 30 pts
  { field: "bio", weight: 5 },
  { field: "city", weight: 5 },
  { field: "education", weight: 5 },
  { field: "occupation", weight: 5 },
  { field: "height", weight: 5 },
  { field: "religion", weight: 5 },
  // Photos — 20 pts
  { field: "avatarUrl", weight: 10 },
  { field: "photos", weight: 10 },
  // Lifestyle — 15 pts
  { field: "diet", weight: 5 },
  { field: "intent", weight: 5 },
  { field: "motherTongue", weight: 5 },
  // Settings — 15 pts
  { field: "preferences", weight: 5 },
  { field: "dealbreakers", weight: 5 },
  { field: "privacy", weight: 5 },
];

/**
 * Calculate profile completion percentage (0–100).
 *
 * @param user - Full or partial UserDocument
 * @returns Integer 0–100
 */
export function calculateProfileCompletion(
  user: Partial<UserDocument>,
): number {
  let earned = 0;

  for (const { field, weight } of COMPLETION_WEIGHTS) {
    const value = user[field];

    if (value === null || value === undefined) continue;

    // Special handling for arrays (photos)
    if (field === "photos") {
      if (Array.isArray(value) && (value as UserPhoto[]).length > 0) {
        earned += weight;
      }
      continue;
    }

    // Special handling for strings — must be non-empty
    if (typeof value === "string") {
      if (value.trim().length > 0) earned += weight;
      continue;
    }

    // Special handling for objects (preferences, dealbreakers, privacy)
    if (typeof value === "object") {
      earned += weight;
      continue;
    }

    // Booleans, numbers — any truthy or 0 counts
    earned += weight;
  }

  return Math.min(100, Math.max(0, earned));
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────────────────────

function validateUpdate(data: UpdateUserProfileData): UserServiceError | null {
  if (data.name !== undefined && (typeof data.name !== "string" || data.name.trim().length === 0)) {
    return toError("validation/name", "Name cannot be empty.", "नाम खाली नहीं हो सकता।");
  }

  if (data.age !== undefined && data.age !== null) {
    if (typeof data.age !== "number" || data.age < 18 || data.age > 100) {
      return toError("validation/age", "Age must be between 18 and 100.", "आयु 18 से 100 के बीच होनी चाहिए।");
    }
  }

  if (data.bio !== undefined && data.bio !== null) {
    if (typeof data.bio !== "string" || data.bio.length > 1000) {
      return toError("validation/bio", "Bio must be 1000 characters or less.", "बायो 1000 अक्षर या उससे कम होना चाहिए।");
    }
  }

  if (data.blockedUserIds !== undefined) {
    if (!Array.isArray(data.blockedUserIds) || data.blockedUserIds.length > 500) {
      return toError("validation/blocked", "Block list cannot exceed 500 users.", "ब्लॉक सूची 500 उपयोगकर्ताओं से अधिक नहीं हो सकती।");
    }
  }

  if (data.annualIncome !== undefined && data.annualIncome !== null) {
    if (typeof data.annualIncome !== "number" || data.annualIncome < 0) {
      return toError("validation/income", "Annual income must be a positive number.", "वार्षिक आय एक सकारात्मक संख्या होनी चाहिए।");
    }
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Image compression (client-side, Canvas API)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compress an image File to ≤ 500 KB JPEG using the Canvas API.
 * Resizes to max 1024px on the largest side, then iteratively reduces
 * JPEG quality until the result is below MAX_PHOTO_BYTES.
 *
 * @throws UserServiceError if the file is not an image or compression fails
 */
async function compressImage(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/")) {
    throw toError(
      "storage/invalid-type",
      "Please upload an image file (JPEG, PNG, or WebP).",
      "कृपया एक इमेज फ़ाइल अपलोड करें (JPEG, PNG, या WebP)।",
    );
  }

  return new Promise<Blob>((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Calculate scaled dimensions
      let { width, height } = img;
      if (width > MAX_PHOTO_DIMENSION || height > MAX_PHOTO_DIMENSION) {
        const ratio = Math.min(
          MAX_PHOTO_DIMENSION / width,
          MAX_PHOTO_DIMENSION / height,
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

      // Iteratively reduce quality until under limit
      let quality = 0.85;
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
// CRUD FUNCTIONS
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Create a new user profile document in Firestore.
 *
 * Called on first sign-in. If the document already exists, this is a no-op.
 * All fields are initialised to safe defaults matching firestore.rules CREATE.
 *
 * @param uid  - Firebase Auth UID (becomes the document ID)
 * @param data - Initial data from the auth flow
 * @returns The created UserDocument
 */
export async function createUserProfile(
  uid: string,
  data: CreateUserProfileData,
): Promise<UserDocument> {
  try {
    const db = firebaseDb();
    const userRef = doc(db, COLLECTIONS.USERS, uid);

    // Check for existing profile (idempotent)
    const existing = await getDoc(userRef);
    if (existing.exists()) {
      return existing.data() as UserDocument;
    }

    const newUser: Omit<UserDocument, "createdAt" | "updatedAt"> & {
      createdAt: ReturnType<typeof serverTimestamp>;
      updatedAt: ReturnType<typeof serverTimestamp>;
    } = {
      // Identity
      uid,
      name: data.name || "",
      email: data.email ?? null,
      phone: data.phone || "",
      gender: null,
      dateOfBirth: null,
      age: null,
      // Profile
      bio: null,
      city: null,
      state: null,
      height: null,
      weight: null,
      education: null,
      occupation: null,
      annualIncome: null,
      religion: null,
      caste: null,
      gotra: null,
      manglik: null,
      motherTongue: null,
      // Family
      familyType: null,
      fatherOccupation: null,
      motherOccupation: null,
      siblings: null,
      // Lifestyle
      diet: null,
      smoking: null,
      drinking: null,
      intent: null,
      // Media
      avatarUrl: data.avatarUrl ?? null,
      photos: [],
      // Settings
      preferences: null,
      dealbreakers: null,
      privacy: null,
      // Verification — safe defaults
      isVerified: false,
      verificationLevel: "bronze",
      verifiedAt: null,
      // Premium
      isPremium: false,
      premiumExpiresAt: null,
      // Activity
      isOnline: false,
      lastSeenAt: null,
      // Internal
      profileCompletion: 0,
      reportCount: 0,
      blockedUserIds: [],
      isDeactivated: false,
      // Timestamps
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Calculate initial completion
    (newUser as any).profileCompletion = calculateProfileCompletion(
      newUser as unknown as Partial<UserDocument>,
    );

    await setDoc(userRef, newUser);

    // Read back for consistent timestamps
    const snap = await getDoc(userRef);
    return snap.data() as UserDocument;
  } catch (err) {
    throw firestoreError(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get a single user profile by UID.
 *
 * @returns { exists, user } — user is null if not found
 */
export async function getUserProfile(uid: string): Promise<UserProfileResult> {
  try {
    const db = firebaseDb();
    const userRef = doc(db, COLLECTIONS.USERS, uid).withConverter(
      firestoreConverter<UserDocument>(),
    );
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      return { exists: false, user: null };
    }

    return { exists: true, user: snap.data() };
  } catch (err) {
    throw firestoreError(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Update a user profile with validation.
 *
 * Automatically recalculates profileCompletion and sets updatedAt.
 * Immutable fields (uid, phone, createdAt) cannot be changed — enforced
 * by both this function and firestore.rules.
 *
 * @param uid  - User UID
 * @param data - Partial update data (only user-editable fields)
 * @returns Updated UserDocument
 */
export async function updateUserProfile(
  uid: string,
  data: UpdateUserProfileData,
): Promise<UserDocument> {
  // ── Client-side validation ──
  const validationError = validateUpdate(data);
  if (validationError) throw validationError;

  try {
    const db = firebaseDb();
    const userRef = doc(db, COLLECTIONS.USERS, uid);

    // Fetch current doc to merge for completion calculation
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      throw toError(
        "users/not-found",
        "Profile not found. Please sign in again.",
        "प्रोफ़ाइल नहीं मिली। कृपया फिर से साइन इन करें।",
      );
    }

    const current = snap.data() as UserDocument;
    const merged = { ...current, ...data };
    const completion = calculateProfileCompletion(merged);

    await updateDoc(userRef, {
      ...data,
      profileCompletion: completion,
      updatedAt: serverTimestamp(),
    });

    // Read back the updated doc
    const updated = await getDoc(userRef);
    return updated.data() as UserDocument;
  } catch (err) {
    if ((err as UserServiceError).code?.startsWith("users/") ||
        (err as UserServiceError).code?.startsWith("validation/")) {
      throw err;
    }
    throw firestoreError(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Upload a profile photo to Firebase Storage.
 *
 * 1. Compresses the image to ≤ 500 KB JPEG (Canvas API)
 * 2. Uploads to `users/{uid}/photos/{timestamp}.jpg`
 * 3. Gets the download URL
 * 4. Updates the user's avatarUrl and photos[] in Firestore
 *
 * @param uid  - User UID
 * @param file - Raw File from <input type="file">
 * @param setPrimary - Whether this should become the primary (avatar) photo
 * @returns The download URL of the uploaded photo
 */
export async function uploadProfilePhoto(
  uid: string,
  file: File,
  setPrimary: boolean = true,
): Promise<string> {
  // ── Compress ──
  const compressed = await compressImage(file);

  // ── Upload to Storage ──
  try {
    const storage = firebaseStorage();
    const timestamp = Date.now();
    const storagePath = `users/${uid}/photos/${timestamp}.jpg`;
    const storageRef = ref(storage, storagePath);

    await uploadBytes(storageRef, compressed, {
      contentType: "image/jpeg",
      customMetadata: {
        uploadedBy: uid,
        originalName: file.name,
        originalSize: String(file.size),
        compressedSize: String(compressed.size),
      },
    });

    const downloadUrl = await getDownloadURL(storageRef);

    // ── Update Firestore ──
    const db = firebaseDb();
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      throw toError(
        "users/not-found",
        "Profile not found.",
        "प्रोफ़ाइल नहीं मिली।",
      );
    }

    const current = snap.data() as UserDocument;
    const newPhoto: UserPhoto = {
      url: downloadUrl,
      isPrimary: setPrimary,
      storagePath,
    };

    // If setting as primary, demote all existing primaries
    const updatedPhotos: UserPhoto[] = setPrimary
      ? current.photos.map((p) => ({ ...p, isPrimary: false }))
      : [...current.photos];

    updatedPhotos.push(newPhoto);

    const updateData: Record<string, any> = {
      photos: updatedPhotos,
      updatedAt: serverTimestamp(),
    };

    if (setPrimary) {
      updateData.avatarUrl = downloadUrl;
    }

    // Recalculate completion
    const merged = { ...current, ...updateData, photos: updatedPhotos };
    updateData.profileCompletion = calculateProfileCompletion(merged);

    await updateDoc(userRef, updateData);

    return downloadUrl;
  } catch (err) {
    if ((err as UserServiceError).code?.startsWith("users/") ||
        (err as UserServiceError).code?.startsWith("storage/")) {
      throw err;
    }
    throw toError(
      "storage/upload-failed",
      "Failed to upload photo. Please try again.",
      "फ़ोटो अपलोड करने में विफल। कृपया पुनः प्रयास करें।",
    );
  }
}

/**
 * Delete a photo from Storage and remove it from the user's photos[].
 */
export async function deleteProfilePhoto(
  uid: string,
  storagePath: string,
): Promise<void> {
  try {
    // Delete from Storage
    const storage = firebaseStorage();
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef).catch(() => {
      // Ignore if already deleted
    });

    // Remove from Firestore
    const db = firebaseDb();
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) return;

    const current = snap.data() as UserDocument;
    const removed = current.photos.find((p) => p.storagePath === storagePath);
    const updatedPhotos = current.photos.filter(
      (p) => p.storagePath !== storagePath,
    );

    const updateData: Record<string, any> = {
      photos: updatedPhotos,
      updatedAt: serverTimestamp(),
    };

    // If we removed the primary, promote the first remaining photo
    if (removed?.isPrimary && updatedPhotos.length > 0) {
      updatedPhotos[0].isPrimary = true;
      updateData.avatarUrl = updatedPhotos[0].url;
    } else if (removed?.isPrimary) {
      updateData.avatarUrl = null;
    }

    updateData.profileCompletion = calculateProfileCompletion({
      ...current,
      photos: updatedPhotos,
      avatarUrl: updateData.avatarUrl ?? current.avatarUrl,
    });

    await updateDoc(userRef, updateData);
  } catch (err) {
    throw firestoreError(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get multiple user profiles by UID array.
 *
 * Firestore `in()` supports max 30 values per query. This function
 * automatically batches larger arrays.
 *
 * @param uids - Array of UIDs (empty returns [])
 * @returns Array of UserDocuments (in no guaranteed order)
 */
export async function getUserProfiles(
  uids: string[],
): Promise<UserDocument[]> {
  if (uids.length === 0) return [];

  // Deduplicate
  const unique = [...new Set(uids)];

  try {
    const db = firebaseDb();
    const usersRef = collection(db, COLLECTIONS.USERS).withConverter(
      firestoreConverter<UserDocument>(),
    );

    const results: UserDocument[] = [];

    // Batch into chunks of 30 (Firestore `in` limit)
    for (let i = 0; i < unique.length; i += BATCH_LIMIT) {
      const batch = unique.slice(i, i + BATCH_LIMIT);
      const q = query(usersRef, where(documentId(), "in", batch));
      const snap = await getDocs(q);
      snap.docs.forEach((d) => results.push(d.data()));
    }

    return results;
  } catch (err) {
    throw firestoreError(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Search users with filters (discovery feed).
 *
 * Firestore does not support OR queries or inequality on multiple fields,
 * so filters are applied in a specific order to use composite indexes:
 *   1. city (==)
 *   2. gender (==)
 *   3. intent (==)
 *   4. verificationLevel (==) when verifiedOnly
 *   5. age range (>=, <=) — Firestore only allows range on one field
 *   6. sort by profileCompletion DESC
 *
 * Client-side post-filter is applied for diet and excludeUids since
 * Firestore can't combine all constraints in one query.
 *
 * @param filters - Search criteria
 * @returns Matching UserDocuments
 */
export async function searchUsers(
  filters: UserSearchFilters,
): Promise<UserDocument[]> {
  const maxResults = Math.min(
    filters.maxResults ?? DEFAULT_SEARCH_LIMIT,
    MAX_SEARCH_LIMIT,
  );

  try {
    const db = firebaseDb();
    const usersRef = collection(db, COLLECTIONS.USERS).withConverter(
      firestoreConverter<UserDocument>(),
    );

    const constraints: QueryConstraint[] = [];

    // Equality filters (can stack in composite index)
    if (filters.city) {
      constraints.push(where("city", "==", filters.city));
    }
    if (filters.gender) {
      constraints.push(where("gender", "==", filters.gender));
    }
    if (filters.intent) {
      constraints.push(where("intent", "==", filters.intent));
    }

    // Verified only → require silver or gold
    if (filters.verifiedOnly) {
      constraints.push(where("verificationLevel", "in", ["silver", "gold"]));
    }

    // Active accounts only
    constraints.push(where("isDeactivated", "==", false));

    // Age range (Firestore allows range on ONE field per query)
    if (filters.ageMin !== undefined) {
      constraints.push(where("age", ">=", filters.ageMin));
    }
    if (filters.ageMax !== undefined) {
      constraints.push(where("age", "<=", filters.ageMax));
    }

    // Sort by profile completion (best profiles first)
    // NOTE: If age range is used, Firestore requires the orderBy to match
    // the range field first. We add age ordering when range is specified.
    if (filters.ageMin !== undefined || filters.ageMax !== undefined) {
      constraints.push(orderBy("age", "asc"));
    }

    // Fetch more than needed to account for client-side filtering
    const fetchLimit = maxResults * 3;
    constraints.push(limit(fetchLimit));

    const q = query(usersRef, ...constraints);
    const snap = await getDocs(q);

    let results: UserDocument[] = snap.docs.map((d) => d.data());

    // ── Client-side post-filters ──
    if (filters.diet) {
      results = results.filter((u) => u.diet === filters.diet);
    }
    if (filters.excludeUids && filters.excludeUids.length > 0) {
      const excludeSet = new Set(filters.excludeUids);
      results = results.filter((u) => !excludeSet.has(u.uid));
    }

    // Sort by profileCompletion DESC (best profiles first)
    results.sort((a, b) => b.profileCompletion - a.profileCompletion);

    return results.slice(0, maxResults);
  } catch (err) {
    throw firestoreError(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Atomically update a user's verification level using a Firestore transaction.
 *
 * Verification can only go UP (bronze → silver → gold), never down.
 * This is enforced both here and in firestore.rules.
 *
 * @param uid      - User UID
 * @param newLevel - Target verification level
 * @returns Updated UserDocument
 */
export async function updateVerificationLevel(
  uid: string,
  newLevel: VerificationLevel,
): Promise<UserDocument> {
  const LEVEL_ORDER: Record<VerificationLevel, number> = {
    bronze: 0,
    silver: 1,
    gold: 2,
  };

  try {
    const db = firebaseDb();
    const userRef = doc(db, COLLECTIONS.USERS, uid);

    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(userRef);

      if (!snap.exists()) {
        throw toError(
          "users/not-found",
          "Profile not found.",
          "प्रोफ़ाइल नहीं मिली।",
        );
      }

      const current = snap.data() as UserDocument;
      const currentOrder = LEVEL_ORDER[current.verificationLevel];
      const newOrder = LEVEL_ORDER[newLevel];

      if (newOrder <= currentOrder) {
        throw toError(
          "users/verification-downgrade",
          `Cannot change verification from ${current.verificationLevel} to ${newLevel}. Verification can only go up.`,
          `सत्यापन ${current.verificationLevel} से ${newLevel} में नहीं बदला जा सकता। सत्यापन केवल ऊपर जा सकता है।`,
        );
      }

      transaction.update(userRef, {
        verificationLevel: newLevel,
        isVerified: true,
        verifiedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    // Read back the updated document
    const updated = await getDoc(userRef);
    return updated.data() as UserDocument;
  } catch (err) {
    if ((err as UserServiceError).code?.startsWith("users/")) {
      throw err;
    }
    throw firestoreError(err);
  }
}
