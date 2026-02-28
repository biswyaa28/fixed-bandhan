/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Firestore Database Schema (TypeScript Interfaces)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Single source of truth for every Firestore document shape.
 * Import these types in all read/write operations — NEVER use `any`.
 *
 * COLLECTIONS
 * ───────────
 *   users            /users/{uid}
 *   matches          /matches/{matchId}
 *   messages         /messages/{messageId}
 *   interests        /interests/{interestId}
 *   profileVisits    /profileVisits/{visitId}
 *   notifications    /notifications/{notificationId}
 *   successStories   /successStories/{storyId}
 *   reports          /reports/{reportId}
 *   referrals        /referrals/{referralCode}
 *
 * CONVENTIONS
 * ───────────
 *   • Document IDs are auto-generated unless noted (users → uid).
 *   • Timestamps stored as Firestore `Timestamp` server-side,
 *     but typed as `FirestoreTimestamp | string` for flexibility
 *     when reading serialised JSON in demo mode.
 *   • All optional fields default to `null` (not `undefined`)
 *     so Firestore doesn't silently drop them.
 *
 * DEPLOYMENT
 * ──────────
 *   firebase deploy --only firestore:rules,firestore:indexes
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { type Timestamp, type FieldValue } from "firebase/firestore";

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Firestore Timestamp that can also be a server-sentinel or plain string */
export type FirestoreTimestamp = Timestamp | FieldValue | string;

/** Verification tier — earned via progressive identity checks */
export type VerificationLevel = "bronze" | "silver" | "gold";

/** Marriage intent / relationship goal */
export type Intent = "marriage-soon" | "serious-relationship" | "friendship" | "healing";

/** Gender */
export type Gender = "male" | "female" | "non-binary" | "prefer-not-to-say";

/** Diet preference */
export type Diet =
  | "vegetarian"
  | "eggetarian"
  | "non-vegetarian"
  | "jain"
  | "halal"
  | "vegan";

/** Frequency labels */
export type Frequency = "never" | "occasionally" | "regularly";

/** Family structure */
export type FamilyType = "joint" | "nuclear";

// ═════════════════════════════════════════════════════════════════════════════
// 1. USERS  —  /users/{uid}
// ═════════════════════════════════════════════════════════════════════════════

/** Photo entry inside a user document */
export interface UserPhoto {
  url: string;
  isPrimary: boolean;
  /** Storage path for deletion — e.g. "users/{uid}/photos/{fileId}" */
  storagePath?: string;
}

/** Preferences sub-object */
export interface UserPreferences {
  ageRange: { min: number; max: number };
  /** Preferred cities (empty = any) */
  locations: string[];
  /** Acceptable diet values */
  diets: Diet[];
  /** Acceptable intents */
  intents: Intent[];
}

/** Dealbreaker settings (from onboarding) */
export interface UserDealbreakers {
  smoking: "non-negotiable" | "okay-occasionally" | "dont-care";
  drinking: "non-negotiable" | "okay-occasionally" | "dont-care";
  diet: "strict-veg" | "eggetarian" | "non-veg" | "dont-care";
  familyValues: "traditional" | "modern" | "flexible";
  relocation: "not-willing" | "open-discuss" | "definitely";
}

/** Privacy toggles */
export interface UserPrivacy {
  showOnlineStatus: boolean;
  showProfileVisits: boolean;
  showReadReceipts: boolean;
  showLastSeen: boolean;
  showDistance: boolean;
}

/**
 * Full user document.
 *
 * The document ID is the Firebase Auth UID.
 * Created on first sign-in by `ensureUserProfile()` in auth.ts.
 */
export interface UserDocument {
  // ── Identity ──
  uid: string;
  name: string;
  email: string | null;
  phone: string;
  gender: Gender | null;
  dateOfBirth: string | null; // ISO 8601 date "1998-03-15"
  age: number | null; // denormalised for query filtering

  // ── Profile ──
  bio: string | null;
  city: string | null;
  state: string | null;
  height: string | null; // e.g. "5'10\""
  weight: string | null;
  education: string | null;
  occupation: string | null;
  annualIncome: number | null; // INR
  religion: string | null;
  caste: string | null;
  gotra: string | null;
  manglik: boolean | null;
  motherTongue: string | null;

  // ── Family ──
  familyType: FamilyType | null;
  fatherOccupation: string | null;
  motherOccupation: string | null;
  siblings: string | null;

  // ── Lifestyle ──
  diet: Diet | null;
  smoking: Frequency | null;
  drinking: Frequency | null;
  intent: Intent | null;

  // ── Media ──
  avatarUrl: string | null;
  photos: UserPhoto[];

  // ── Preferences / Settings ──
  preferences: UserPreferences | null;
  dealbreakers: UserDealbreakers | null;
  privacy: UserPrivacy | null;

  // ── Verification ──
  isVerified: boolean;
  verificationLevel: VerificationLevel;
  verifiedAt: FirestoreTimestamp | null;

  // ── Premium ──
  isPremium: boolean;
  premiumExpiresAt: FirestoreTimestamp | null;

  // ── Activity ──
  isOnline: boolean;
  lastSeenAt: FirestoreTimestamp | null;

  // ── Internal ──
  /** Profile completion 0–100 (denormalised for sorting) */
  profileCompletion: number;
  /** Number of reports received (hidden, admin use) */
  reportCount: number;
  /** Blocked UIDs (max ~500 — if more, use sub-collection) */
  blockedUserIds: string[];
  /** Soft-deleted */
  isDeactivated: boolean;

  // ── Referral ──
  /** Referral code used when signing up (set once, never changes) */
  referredBy: string | null;

  // ── Timestamps ──
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

// ═════════════════════════════════════════════════════════════════════════════
// 2. MATCHES  —  /matches/{matchId}
// ═════════════════════════════════════════════════════════════════════════════

export type MatchStatus =
  | "active" // Both users accepted
  | "expired" // 48h window expired (respectful initiation mode)
  | "unmatched" // One user unmatched
  | "blocked"; // One user blocked the other

export interface MatchDocument {
  /** Sorted pair [smaller_uid, larger_uid] for uniqueness */
  userIds: [string, string];
  /** Redundant flat fields for where() queries */
  user1Id: string;
  user2Id: string;
  status: MatchStatus;
  /** When mutual interest was detected */
  matchedAt: FirestoreTimestamp;
  /** Last message timestamp (denormalised for sorting) */
  lastMessageAt: FirestoreTimestamp | null;
  /** Preview of last message (for match list) */
  lastMessagePreview: string | null;
  /** Who sent the last message */
  lastMessageSenderId: string | null;
  /** Unread count per user: { [uid]: number } */
  unreadCount: Record<string, number>;
  /** Respectful initiation — who must message first (null = either) */
  initiatorId: string | null;
  /** Deadline for first message (48h from matchedAt) */
  initiationDeadline: FirestoreTimestamp | null;

  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

// ═════════════════════════════════════════════════════════════════════════════
// 3. MESSAGES  —  /messages/{messageId}
// ═════════════════════════════════════════════════════════════════════════════

export type MessageType =
  | "text"
  | "voice" // 15s max voice note
  | "image"
  | "icebreaker" // auto-suggested conversation starter
  | "system"; // "You matched!" / "Video call ended"

export type MessageDeliveryStatus = "sending" | "sent" | "delivered" | "read" | "failed";

export interface MessageDocument {
  matchId: string;
  senderId: string;
  content: string; // text content or caption
  type: MessageType;
  /** For voice/image — URL to Firebase Storage asset */
  mediaUrl: string | null;
  /** Voice note duration in seconds */
  mediaDurationSec: number | null;
  /** Delivery status per recipient */
  status: MessageDeliveryStatus;
  /** When the recipient read it */
  readAt: FirestoreTimestamp | null;
  /** If this is a reply, the original message ID */
  replyToId: string | null;
  /** Soft-deleted by sender */
  isDeleted: boolean;

  timestamp: FirestoreTimestamp;
}

// ═════════════════════════════════════════════════════════════════════════════
// 4. INTERESTS  —  /interests/{interestId}
// ═════════════════════════════════════════════════════════════════════════════

export type InterestType =
  | "like" // Standard like
  | "special" // "Special Interest" — 1/day free
  | "premium"; // "Premium Interest" — 1/week free, unlimited for premium

export interface InterestDocument {
  fromUserId: string;
  toUserId: string;
  type: InterestType;
  /** Optional comment when using "Appreciate This" feature */
  comment: string | null;
  /** Which profile element was appreciated (photo index, prompt id, etc.) */
  appreciatedElement: string | null;
  /** True once the other user also liked back → Match created */
  isMutual: boolean;
  /** Whether this interest has been seen by the recipient */
  isSeen: boolean;
  /** If user skipped/passed instead of liking */
  isSkipped: boolean;

  timestamp: FirestoreTimestamp;
}

// ═════════════════════════════════════════════════════════════════════════════
// 5. PROFILE VISITS  —  /profileVisits/{visitId}
// ═════════════════════════════════════════════════════════════════════════════

export interface ProfileVisitDocument {
  visitorId: string;
  visitedUserId: string;
  /** Visitor chose to hide their visit (privacy setting) */
  isHidden: boolean;
  /** Duration in seconds the visitor spent on the profile */
  durationSec: number | null;

  timestamp: FirestoreTimestamp;
}

// ═════════════════════════════════════════════════════════════════════════════
// 6. NOTIFICATIONS  —  /notifications/{notificationId}
// ═════════════════════════════════════════════════════════════════════════════

export type NotificationType =
  | "match" // New match
  | "message" // New message
  | "like" // Someone liked you
  | "special" // Someone sent special interest
  | "premium" // Someone sent premium interest
  | "visit" // Profile visit
  | "verification" // Verification level changed
  | "reminder" // "Complete your profile" / "You have unread messages"
  | "system"; // App updates, maintenance

export interface NotificationDocument {
  userId: string;
  type: NotificationType;
  title: string;
  titleHi: string | null;
  message: string;
  messageHi: string | null;
  /** Arbitrary payload for the client to act on */
  data: Record<string, string> | null;
  /** E.g. match ID, user ID, etc. for deep-linking */
  targetId: string | null;
  isRead: boolean;
  /** Grouped notification count ("3 people liked you") */
  groupCount: number;

  createdAt: FirestoreTimestamp;
}

// ═════════════════════════════════════════════════════════════════════════════
// 7. SUCCESS STORIES  —  /successStories/{storyId}
// ═════════════════════════════════════════════════════════════════════════════

export interface SuccessStoryDocument {
  userId1: string;
  userId2: string;
  /** First names only — privacy */
  nameA: string;
  nameB: string;
  cityA: string;
  cityB: string;
  /** English testimonial */
  quoteEn: string;
  /** Hindi testimonial */
  quoteHi: string;
  /** How they matched (shown in UI) */
  matchedVia: string;
  /** Months from match to engagement/marriage */
  durationMonths: number;
  verificationLevel: VerificationLevel;
  /** Admin-approved for public display */
  isApproved: boolean;
  /** Featured on home page */
  isFeatured: boolean;

  submittedAt: FirestoreTimestamp;
  approvedAt: FirestoreTimestamp | null;
}

// ═════════════════════════════════════════════════════════════════════════════
// 8. REPORTS  —  /reports/{reportId}
// ═════════════════════════════════════════════════════════════════════════════

export type ReportReason =
  | "fake-profile"
  | "harassment"
  | "spam"
  | "inappropriate-content"
  | "underage"
  | "scam"
  | "other";

export type ReportStatus =
  | "pending" // Awaiting moderator review
  | "reviewing" // Under investigation
  | "resolved" // Action taken
  | "dismissed"; // No action needed

export interface ReportDocument {
  reporterId: string;
  reportedUserId: string;
  reason: ReportReason;
  /** Free-text details from the reporter */
  comment: string | null;
  /** Optional screenshot evidence URLs */
  evidenceUrls: string[];
  status: ReportStatus;
  /** Admin notes (internal) */
  moderatorNotes: string | null;
  /** Admin who handled the report */
  resolvedBy: string | null;
  resolvedAt: FirestoreTimestamp | null;

  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

// ═════════════════════════════════════════════════════════════════════════════
// 9. REFERRALS  —  /referrals/{referralCode}
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Referral code document. The document ID is the code itself (e.g. "PRIYA-A3K7").
 * One per user, created lazily when they first open the referral screen.
 */
export interface ReferralDocument {
  code: string;
  ownerUid: string;
  ownerName: string;
  /** Number of people who signed up with this code */
  signupCount: number;
  /** Number of those who completed profile (>50%) */
  qualifiedCount: number;
  /** UIDs of referred users */
  referredUids: string[];
  /** Total premium days earned */
  premiumDaysEarned: number;
  lastReferralAt: string | null;
  createdAt: string;
  isActive: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Collection path constants (avoids magic strings)
// ─────────────────────────────────────────────────────────────────────────────

export const COLLECTIONS = {
  USERS: "users",
  MATCHES: "matches",
  MESSAGES: "messages",
  INTERESTS: "interests",
  PROFILE_VISITS: "profileVisits",
  NOTIFICATIONS: "notifications",
  SUCCESS_STORIES: "successStories",
  REPORTS: "reports",
  REFERRALS: "referrals",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Firestore converter helpers
// ─────────────────────────────────────────────────────────────────────────────
// Usage:
//   const ref = doc(db, "users", uid).withConverter(firestoreConverter<UserDocument>());
//   const snap = await getDoc(ref);
//   const user: UserDocument = snap.data()!;  // ← fully typed

import {
  type DocumentData,
  type QueryDocumentSnapshot,
  type SnapshotOptions,
  type FirestoreDataConverter,
} from "firebase/firestore";

/**
 * Generic Firestore converter that preserves TypeScript types
 * on reads and writes. Works with any document interface above.
 *
 * @example
 * ```ts
 * import { collection, query, where, getDocs } from "firebase/firestore";
 * import { firestoreConverter, type UserDocument, COLLECTIONS } from "@/lib/firebase/schema";
 *
 * const ref = collection(db, COLLECTIONS.USERS).withConverter(firestoreConverter<UserDocument>());
 * const snap = await getDocs(query(ref, where("city", "==", "Mumbai")));
 * snap.docs.forEach(d => {
 *   const user: UserDocument = d.data(); // fully typed!
 * });
 * ```
 */
export function firestoreConverter<T extends DocumentData>(): FirestoreDataConverter<T> {
  return {
    toFirestore(data: T): DocumentData {
      return data as DocumentData;
    },
    fromFirestore(
      snapshot: QueryDocumentSnapshot<DocumentData>,
      options?: SnapshotOptions,
    ): T {
      return snapshot.data(options) as T;
    },
  };
}
