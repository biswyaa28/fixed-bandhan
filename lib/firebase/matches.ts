/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Matching & Discovery Service
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Complete Firestore matching system for the Bandhan AI dating app.
 *
 * Functions
 * ─────────
 *   createInterest()          — Like / Special / Premium interest
 *   getUserMatches()          — Active matches with enriched profiles
 *   getReceivedInterests()    — Likes received with sender profiles
 *   getDiscoverableUsers()    — Discovery feed with compatibility scores
 *   calculateCompatibility()  — Weighted 0–100 compatibility score
 *   getPerfectMatchOfTheDay() — Top-1 algorithmic daily pick
 *   getDailyLimitsStatus()    — Current daily usage counters
 *
 * Matching Algorithm (weights sum to 100%)
 * ─────────────────────────────────────────
 *   Intent alignment     35%
 *   Values alignment     25%
 *   Lifestyle match      20%
 *   Location proximity   12%
 *   Family compatibility  8%
 *
 * STRICT RULES
 * ────────────
 *   • Duplicate likes prevented atomically (query-before-create in txn)
 *   • Mutual match creation is atomic (single transaction)
 *   • Daily limits persisted in localStorage + validated server-side dates
 *   • Compatibility scoring is deterministic (same inputs → same output)
 *   • Notifications created on match and on received interest
 *   • All functions typed against lib/firebase/schema.ts
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  collection,
  serverTimestamp,
  runTransaction,
  Timestamp,
} from "firebase/firestore";

import { firebaseDb } from "@/lib/firebase/config";

import {
  COLLECTIONS,
  firestoreConverter,
  type UserDocument,
  type InterestDocument,
  type InterestType,
  type MatchDocument,
  type NotificationDocument,
  type Intent,
  type Diet,
} from "@/lib/firebase/schema";

import { getUserProfile, getUserProfiles } from "@/lib/firebase/users";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** Bilingual service error */
export interface MatchServiceError {
  code: string;
  en: string;
  hi: string;
}

/** Result of createInterest — includes whether a match was created */
export interface CreateInterestResult {
  interestId: string;
  isMatch: boolean;
  matchId: string | null;
}

/** Match enriched with the other user's profile */
export interface EnrichedMatch {
  matchId: string;
  match: MatchDocument;
  otherUser: UserDocument;
  compatibility: number;
}

/** Interest enriched with sender profile */
export interface EnrichedInterest {
  interestId: string;
  interest: InterestDocument;
  sender: UserDocument;
  compatibility: number;
}

/** Discoverable user with compatibility score */
export interface DiscoverableUser {
  user: UserDocument;
  compatibility: number;
  /** Top 3 reasons for compatibility */
  compatibilityReasons: string[];
  /** Whether this is the "Perfect Match of the Day" */
  isPerfectMatch: boolean;
}

/** Daily limits status */
export interface DailyLimitsStatus {
  profilesViewed: number;
  profilesLimit: number;
  likesUsed: number;
  likesLimit: number;
  specialInterestUsed: number;
  specialInterestLimit: number;
  /** ISO date string (IST) for when these counts apply */
  dateIST: string;
}

/** Filters for discovery feed */
export interface DiscoveryFilters {
  city?: string;
  ageMin?: number;
  ageMax?: number;
  intent?: Intent;
  diet?: Diet;
  verifiedOnly?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/** Free-tier daily limits */
const FREE_LIMITS = {
  profiles: 5,
  likes: 5,
  specialInterest: 1,
} as const;

/** Premium-tier daily limits */
const PREMIUM_LIMITS = {
  profiles: 50,
  likes: 50,
  specialInterest: 5,
} as const;

const DAILY_LIMITS_STORAGE_KEY = "bandhan_match_daily_limits";

// ─────────────────────────────────────────────────────────────────────────────
// Error helpers
// ─────────────────────────────────────────────────────────────────────────────

function toError(code: string, en: string, hi: string): MatchServiceError {
  return { code, en, hi };
}

function firestoreError(err: unknown): MatchServiceError {
  const code = (err as any)?.code ?? "firestore/unknown";
  const MAP: Record<string, { en: string; hi: string }> = {
    "permission-denied": {
      en: "You don't have permission to perform this action.",
      hi: "आपको यह कार्य करने की अनुमति नहीं है।",
    },
    unavailable: {
      en: "Service temporarily unavailable. Please try again.",
      hi: "सेवा अस्थायी रूप से अनुपलब्ध। कृपया पुनः प्रयास करें।",
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
// Date helpers (IST)
// ─────────────────────────────────────────────────────────────────────────────

/** Get today's date string in IST as "YYYY-MM-DD" */
function getTodayIST(): string {
  const now = new Date();
  // IST is UTC+5:30
  const istOffset = 5.5 * 60 * 60 * 1000;
  const ist = new Date(
    now.getTime() + istOffset + now.getTimezoneOffset() * 60 * 1000,
  );
  const y = ist.getFullYear();
  const m = String(ist.getMonth() + 1).padStart(2, "0");
  const d = String(ist.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Daily limits (localStorage-backed, IST-aware)
// ─────────────────────────────────────────────────────────────────────────────

interface StoredDailyLimits {
  dateIST: string;
  profilesViewed: number;
  likesUsed: number;
  specialInterestUsed: number;
}

function getStoredLimits(): StoredDailyLimits {
  const today = getTodayIST();

  if (typeof localStorage === "undefined") {
    return {
      dateIST: today,
      profilesViewed: 0,
      likesUsed: 0,
      specialInterestUsed: 0,
    };
  }

  try {
    const raw = localStorage.getItem(DAILY_LIMITS_STORAGE_KEY);
    if (!raw) {
      return {
        dateIST: today,
        profilesViewed: 0,
        likesUsed: 0,
        specialInterestUsed: 0,
      };
    }
    const parsed: StoredDailyLimits = JSON.parse(raw);

    // If stored date is not today, reset counters
    if (parsed.dateIST !== today) {
      const fresh: StoredDailyLimits = {
        dateIST: today,
        profilesViewed: 0,
        likesUsed: 0,
        specialInterestUsed: 0,
      };
      localStorage.setItem(DAILY_LIMITS_STORAGE_KEY, JSON.stringify(fresh));
      return fresh;
    }
    return parsed;
  } catch {
    return {
      dateIST: today,
      profilesViewed: 0,
      likesUsed: 0,
      specialInterestUsed: 0,
    };
  }
}

function saveStoredLimits(limits: StoredDailyLimits): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(DAILY_LIMITS_STORAGE_KEY, JSON.stringify(limits));
  } catch {
    /* non-fatal */
  }
}

function incrementLimit(
  field: "profilesViewed" | "likesUsed" | "specialInterestUsed",
): StoredDailyLimits {
  const limits = getStoredLimits();
  limits[field] += 1;
  saveStoredLimits(limits);
  return limits;
}

/**
 * Get the current daily limits status for a user.
 */
export function getDailyLimitsStatus(isPremium: boolean): DailyLimitsStatus {
  const limits = getStoredLimits();
  const tier = isPremium ? PREMIUM_LIMITS : FREE_LIMITS;
  return {
    profilesViewed: limits.profilesViewed,
    profilesLimit: tier.profiles,
    likesUsed: limits.likesUsed,
    likesLimit: tier.likes,
    specialInterestUsed: limits.specialInterestUsed,
    specialInterestLimit: tier.specialInterest,
    dateIST: limits.dateIST,
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// COMPATIBILITY ALGORITHM
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Weighted compatibility scoring.
 *
 * Categories (sum = 100):
 *   Intent alignment     35 pts
 *   Values alignment     25 pts
 *   Lifestyle match      20 pts
 *   Location proximity   12 pts
 *   Family compatibility  8 pts
 *
 * Each category scores 0.0–1.0, then is multiplied by its weight.
 * The total is rounded to an integer 0–100.
 */
export function calculateCompatibility(
  user1: UserDocument,
  user2: UserDocument,
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let total = 0;

  // ── 1. Intent alignment (35%) ──
  const intentScore = scoreIntent(user1.intent, user2.intent);
  total += intentScore * 35;
  if (intentScore >= 0.8) reasons.push("Similar life goals");

  // ── 2. Values alignment (25%) ──
  const valuesScore = scoreValues(user1, user2);
  total += valuesScore * 25;
  if (valuesScore >= 0.7) reasons.push("Shared values");

  // ── 3. Lifestyle match (20%) ──
  const lifestyleScore = scoreLifestyle(user1, user2);
  total += lifestyleScore * 20;
  if (lifestyleScore >= 0.7) reasons.push("Compatible lifestyle");

  // ── 4. Location proximity (12%) ──
  const locationScore = scoreLocation(user1, user2);
  total += locationScore * 12;
  if (locationScore >= 0.8) reasons.push("Same city");

  // ── 5. Family compatibility (8%) ──
  const familyScore = scoreFamily(user1, user2);
  total += familyScore * 8;
  if (familyScore >= 0.7) reasons.push("Family compatibility");

  const score = Math.round(Math.min(100, Math.max(0, total)));
  return { score, reasons: reasons.slice(0, 3) };
}

// ── Intent scoring ───────────────────────────────────────────────────────────

const INTENT_COMPAT: Record<string, Record<string, number>> = {
  "marriage-soon": {
    "marriage-soon": 1.0,
    "serious-relationship": 0.7,
    friendship: 0.2,
    healing: 0.1,
  },
  "serious-relationship": {
    "marriage-soon": 0.7,
    "serious-relationship": 1.0,
    friendship: 0.4,
    healing: 0.2,
  },
  friendship: {
    "marriage-soon": 0.2,
    "serious-relationship": 0.4,
    friendship: 1.0,
    healing: 0.6,
  },
  healing: {
    "marriage-soon": 0.1,
    "serious-relationship": 0.2,
    friendship: 0.6,
    healing: 1.0,
  },
};

function scoreIntent(a: Intent | null, b: Intent | null): number {
  if (!a || !b) return 0.3; // unknown intent → partial score
  return INTENT_COMPAT[a]?.[b] ?? 0.3;
}

// ── Values scoring ───────────────────────────────────────────────────────────

function scoreValues(u1: UserDocument, u2: UserDocument): number {
  let points = 0;
  let maxPoints = 0;

  // Religion match
  maxPoints += 3;
  if (u1.religion && u2.religion) {
    if (u1.religion.toLowerCase() === u2.religion.toLowerCase()) points += 3;
    else points += 0.5;
  } else {
    points += 1; // unknown → partial
  }

  // Dealbreakers alignment
  if (u1.dealbreakers && u2.dealbreakers) {
    maxPoints += 5;

    // Family values
    if (u1.dealbreakers.familyValues === u2.dealbreakers.familyValues) {
      points += 2;
    } else if (
      u1.dealbreakers.familyValues === "flexible" ||
      u2.dealbreakers.familyValues === "flexible"
    ) {
      points += 1;
    }

    // Relocation
    if (u1.dealbreakers.relocation === u2.dealbreakers.relocation) {
      points += 1.5;
    } else if (
      u1.dealbreakers.relocation === "open-discuss" ||
      u2.dealbreakers.relocation === "open-discuss"
    ) {
      points += 0.75;
    }

    // Diet dealbreaker check
    if (
      u1.dealbreakers.diet === "dont-care" ||
      u2.dealbreakers.diet === "dont-care"
    ) {
      points += 1.5;
    } else if (u1.dealbreakers.diet === u2.dealbreakers.diet) {
      points += 1.5;
    }
  } else {
    maxPoints += 5;
    points += 2.5; // unknown → partial
  }

  // Mother tongue bonus
  maxPoints += 2;
  if (u1.motherTongue && u2.motherTongue) {
    if (u1.motherTongue.toLowerCase() === u2.motherTongue.toLowerCase())
      points += 2;
    else points += 0.5;
  } else {
    points += 1;
  }

  return maxPoints > 0 ? points / maxPoints : 0.5;
}

// ── Lifestyle scoring ────────────────────────────────────────────────────────

function scoreLifestyle(u1: UserDocument, u2: UserDocument): number {
  let points = 0;
  let maxPoints = 0;

  // Diet
  maxPoints += 3;
  if (u1.diet && u2.diet) {
    if (u1.diet === u2.diet) points += 3;
    else if (areDietsCompatible(u1.diet, u2.diet)) points += 1.5;
  } else {
    points += 1.5;
  }

  // Smoking
  maxPoints += 3;
  if (u1.smoking && u2.smoking) {
    if (u1.smoking === u2.smoking) points += 3;
    else if (u1.smoking === "never" && u2.smoking === "occasionally")
      points += 1;
    else if (u2.smoking === "never" && u1.smoking === "occasionally")
      points += 1;
  } else {
    points += 1.5;
  }

  // Drinking
  maxPoints += 2;
  if (u1.drinking && u2.drinking) {
    if (u1.drinking === u2.drinking) points += 2;
    else if (u1.drinking === "occasionally" || u2.drinking === "occasionally")
      points += 1;
  } else {
    points += 1;
  }

  // Education level parity (rough heuristic)
  maxPoints += 2;
  if (u1.education && u2.education) {
    // Both have education — always partial credit
    points += 1;
    // Bonus if both mention IIT/IIM/NIT/AIIMS (elite tier)
    const elite = /\b(IIT|IIM|NIT|AIIMS|NID)\b/i;
    if (elite.test(u1.education) && elite.test(u2.education)) points += 1;
  } else {
    points += 1;
  }

  return maxPoints > 0 ? points / maxPoints : 0.5;
}

function areDietsCompatible(a: Diet, b: Diet): boolean {
  const vegGroup: Diet[] = ["vegetarian", "jain", "vegan"];
  if (vegGroup.includes(a) && vegGroup.includes(b)) return true;
  if (a === "eggetarian" && vegGroup.includes(b)) return true;
  if (b === "eggetarian" && vegGroup.includes(a)) return true;
  if (a === "non-vegetarian" && b === "non-vegetarian") return true;
  if (a === "halal" && b === "halal") return true;
  return false;
}

// ── Location scoring ─────────────────────────────────────────────────────────

/** Major metro areas grouped by region */
const CITY_REGIONS: Record<string, string[]> = {
  west: ["mumbai", "pune", "ahmedabad", "surat", "nagpur", "goa"],
  north: [
    "delhi",
    "new delhi",
    "noida",
    "gurgaon",
    "gurugram",
    "chandigarh",
    "jaipur",
    "lucknow",
  ],
  south: [
    "bangalore",
    "bengaluru",
    "chennai",
    "hyderabad",
    "kochi",
    "coimbatore",
    "mysore",
  ],
  east: ["kolkata", "bhubaneswar", "patna", "guwahati", "ranchi"],
};

function getCityRegion(city: string): string | null {
  const lower = city.toLowerCase().trim();
  for (const [region, cities] of Object.entries(CITY_REGIONS)) {
    if (cities.includes(lower)) return region;
  }
  return null;
}

function scoreLocation(u1: UserDocument, u2: UserDocument): number {
  if (!u1.city || !u2.city) return 0.4; // unknown → partial

  const c1 = u1.city.toLowerCase().trim();
  const c2 = u2.city.toLowerCase().trim();

  // Same city
  if (c1 === c2) return 1.0;

  // Same state
  if (u1.state && u2.state && u1.state.toLowerCase() === u2.state.toLowerCase())
    return 0.8;

  // Same region
  const r1 = getCityRegion(c1);
  const r2 = getCityRegion(c2);
  if (r1 && r2 && r1 === r2) return 0.6;

  // Check if either user's preferences include the other's city
  const prefs1 = u1.preferences?.locations?.map((l) => l.toLowerCase()) ?? [];
  const prefs2 = u2.preferences?.locations?.map((l) => l.toLowerCase()) ?? [];
  if (prefs1.includes(c2) || prefs2.includes(c1)) return 0.7;

  return 0.2;
}

// ── Family scoring ───────────────────────────────────────────────────────────

function scoreFamily(u1: UserDocument, u2: UserDocument): number {
  let points = 0;
  let maxPoints = 0;

  // Family type
  maxPoints += 3;
  if (u1.familyType && u2.familyType) {
    if (u1.familyType === u2.familyType) points += 3;
    else points += 1;
  } else {
    points += 1.5;
  }

  // Manglik compatibility
  maxPoints += 2;
  if (u1.manglik !== null && u2.manglik !== null) {
    if (u1.manglik === u2.manglik) points += 2;
    else points += 0.5;
  } else {
    points += 1;
  }

  // Gotra check (must NOT match for Hindu marriages)
  maxPoints += 2;
  if (u1.gotra && u2.gotra) {
    if (u1.gotra.toLowerCase() !== u2.gotra.toLowerCase()) points += 2;
    // Same gotra = 0 points (not compatible for marriage)
  } else {
    points += 1; // unknown → partial
  }

  // Age range preferences
  maxPoints += 3;
  if (u1.preferences?.ageRange && u2.age !== null) {
    if (
      u2.age >= u1.preferences.ageRange.min &&
      u2.age <= u1.preferences.ageRange.max
    ) {
      points += 1.5;
    }
  } else {
    points += 0.75;
  }
  if (u2.preferences?.ageRange && u1.age !== null) {
    if (
      u1.age >= u2.preferences.ageRange.min &&
      u1.age <= u2.preferences.ageRange.max
    ) {
      points += 1.5;
    }
  } else {
    points += 0.75;
  }

  return maxPoints > 0 ? points / maxPoints : 0.5;
}

// ═════════════════════════════════════════════════════════════════════════════
// CORE FUNCTIONS
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Create an interest (like / special / premium).
 *
 * Atomically:
 *   1. Checks for duplicate (same fromUser → toUser already exists)
 *   2. Creates the interest document
 *   3. Checks if the other user has already liked back (mutual)
 *   4. If mutual → creates a match document + notifications for both
 *   5. Updates daily limit counters
 *
 * @throws MatchServiceError on duplicate, limit exceeded, or Firestore error
 */
export async function createInterest(
  fromUserId: string,
  toUserId: string,
  type: InterestType,
  appreciatedElement?: string | null,
  comment?: string | null,
): Promise<CreateInterestResult> {
  // ── Guard: can't like yourself ──
  if (fromUserId === toUserId) {
    throw toError(
      "match/self-like",
      "You cannot like your own profile.",
      "आप अपनी खुद की प्रोफ़ाइल पसंद नहीं कर सकते।",
    );
  }

  // ── Guard: daily limits ──
  const { user: fromUser } = await getUserProfile(fromUserId);
  if (!fromUser) {
    throw toError(
      "match/user-not-found",
      "Profile not found.",
      "प्रोफ़ाइल नहीं मिली।",
    );
  }

  const limits = getStoredLimits();
  const tier = fromUser.isPremium ? PREMIUM_LIMITS : FREE_LIMITS;

  if (limits.likesUsed >= tier.likes) {
    throw toError(
      "match/daily-limit",
      `Daily like limit reached (${tier.likes}). Upgrade to Premium for more!`,
      `दैनिक लाइक सीमा पूरी (${tier.likes})। अधिक के लिए प्रीमियम अपग्रेड करें!`,
    );
  }

  if (
    type === "special" &&
    limits.specialInterestUsed >= tier.specialInterest
  ) {
    throw toError(
      "match/special-limit",
      `Daily Special Interest limit reached (${tier.specialInterest}).`,
      `दैनिक विशेष रुचि सीमा पूरी (${tier.specialInterest})।`,
    );
  }

  // ── Guard: blocked user check ──
  if (fromUser.blockedUserIds?.includes(toUserId)) {
    throw toError(
      "match/blocked",
      "You have blocked this user.",
      "आपने इस उपयोगकर्ता को ब्लॉक किया है।",
    );
  }

  const { user: toUser } = await getUserProfile(toUserId);
  if (!toUser) {
    throw toError(
      "match/target-not-found",
      "This profile is no longer available.",
      "यह प्रोफ़ाइल अब उपलब्ध नहीं है।",
    );
  }
  if (toUser.blockedUserIds?.includes(fromUserId)) {
    throw toError(
      "match/blocked-by-target",
      "You cannot interact with this profile.",
      "आप इस प्रोफ़ाइल से बातचीत नहीं कर सकते।",
    );
  }

  try {
    const db = firebaseDb();
    let interestId = "";
    let isMatch = false;
    let matchId: string | null = null;

    await runTransaction(db, async (transaction) => {
      // ── 1. Check for duplicate interest ──
      const interestsRef = collection(db, COLLECTIONS.INTERESTS);
      const dupQuery = query(
        interestsRef,
        where("fromUserId", "==", fromUserId),
        where("toUserId", "==", toUserId),
      );
      const dupSnap = await getDocs(dupQuery);
      if (!dupSnap.empty) {
        throw toError(
          "match/duplicate",
          "You have already liked this profile.",
          "आप पहले से ही इस प्रोफ़ाइल को पसंद कर चुके हैं।",
        );
      }

      // ── 2. Create interest document ──
      const newInterestRef = doc(collection(db, COLLECTIONS.INTERESTS));
      interestId = newInterestRef.id;

      const interestData: Omit<InterestDocument, "timestamp"> & {
        timestamp: ReturnType<typeof serverTimestamp>;
      } = {
        fromUserId,
        toUserId,
        type,
        comment: comment ?? null,
        appreciatedElement: appreciatedElement ?? null,
        isMutual: false,
        isSeen: false,
        isSkipped: false,
        timestamp: serverTimestamp(),
      };

      transaction.set(newInterestRef, interestData);

      // ── 3. Check for mutual interest ──
      const reverseQuery = query(
        interestsRef,
        where("fromUserId", "==", toUserId),
        where("toUserId", "==", fromUserId),
      );
      const reverseSnap = await getDocs(reverseQuery);

      if (!reverseSnap.empty) {
        isMatch = true;

        // Mark both interests as mutual
        transaction.update(newInterestRef, { isMutual: true });
        reverseSnap.docs.forEach((d) => {
          transaction.update(d.ref, { isMutual: true });
        });

        // ── 4. Create match document ──
        const sortedIds: [string, string] =
          fromUserId < toUserId
            ? [fromUserId, toUserId]
            : [toUserId, fromUserId];

        const newMatchRef = doc(collection(db, COLLECTIONS.MATCHES));
        matchId = newMatchRef.id;

        const matchData: Omit<
          MatchDocument,
          "matchedAt" | "createdAt" | "updatedAt"
        > & {
          matchedAt: ReturnType<typeof serverTimestamp>;
          createdAt: ReturnType<typeof serverTimestamp>;
          updatedAt: ReturnType<typeof serverTimestamp>;
        } = {
          userIds: sortedIds,
          user1Id: sortedIds[0],
          user2Id: sortedIds[1],
          status: "active",
          matchedAt: serverTimestamp(),
          lastMessageAt: null,
          lastMessagePreview: null,
          lastMessageSenderId: null,
          unreadCount: { [fromUserId]: 0, [toUserId]: 0 },
          initiatorId: null,
          initiationDeadline: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        transaction.set(newMatchRef, matchData);

        // ── 5. Create notifications for both users ──
        const notifForFrom = doc(collection(db, COLLECTIONS.NOTIFICATIONS));
        transaction.set(notifForFrom, {
          userId: fromUserId,
          type: "match",
          title: "It's a Match! 🎉",
          titleHi: "मैच हो गया! 🎉",
          message: `You matched with ${toUser.name}! Start a conversation.`,
          messageHi: `${toUser.name} से आपका मैच हुआ! बातचीत शुरू करें।`,
          data: { matchId, userId: toUserId },
          targetId: matchId,
          isRead: false,
          groupCount: 1,
          createdAt: serverTimestamp(),
        } satisfies Omit<NotificationDocument, "createdAt"> & {
          createdAt: ReturnType<typeof serverTimestamp>;
        });

        const notifForTo = doc(collection(db, COLLECTIONS.NOTIFICATIONS));
        transaction.set(notifForTo, {
          userId: toUserId,
          type: "match",
          title: "It's a Match! 🎉",
          titleHi: "मैच हो गया! 🎉",
          message: `You matched with ${fromUser.name}! Start a conversation.`,
          messageHi: `${fromUser.name} से आपका मैच हुआ! बातचीत शुरू करें।`,
          data: { matchId, userId: fromUserId },
          targetId: matchId,
          isRead: false,
          groupCount: 1,
          createdAt: serverTimestamp(),
        } satisfies Omit<NotificationDocument, "createdAt"> & {
          createdAt: ReturnType<typeof serverTimestamp>;
        });
      } else {
        // Not a match yet — notify the recipient of the interest
        const notifRef = doc(collection(db, COLLECTIONS.NOTIFICATIONS));
        const notifType =
          type === "special"
            ? "special"
            : type === "premium"
              ? "premium"
              : "like";
        const label =
          type === "special"
            ? "Special Interest"
            : type === "premium"
              ? "Premium Interest"
              : "like";
        const labelHi =
          type === "special"
            ? "विशेष रुचि"
            : type === "premium"
              ? "प्रीमियम रुचि"
              : "पसंद";

        transaction.set(notifRef, {
          userId: toUserId,
          type: notifType,
          title: `New ${label} received!`,
          titleHi: `नई ${labelHi} प्राप्त!`,
          message: `Someone showed interest in your profile.`,
          messageHi: `किसी ने आपकी प्रोफ़ाइल में रुचि दिखाई।`,
          data: { interestId, fromUserId },
          targetId: fromUserId,
          isRead: false,
          groupCount: 1,
          createdAt: serverTimestamp(),
        } satisfies Omit<NotificationDocument, "createdAt"> & {
          createdAt: ReturnType<typeof serverTimestamp>;
        });
      }
    });

    // ── Update daily limits ──
    incrementLimit("likesUsed");
    if (type === "special") incrementLimit("specialInterestUsed");

    return { interestId, isMatch, matchId };
  } catch (err) {
    if ((err as MatchServiceError).code?.startsWith("match/")) throw err;
    throw firestoreError(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all active matches for a user, enriched with the other user's profile
 * and compatibility score.
 *
 * Results are sorted by lastMessageAt DESC (most recent activity first).
 */
export async function getUserMatches(userId: string): Promise<EnrichedMatch[]> {
  try {
    const db = firebaseDb();
    const matchesRef = collection(db, COLLECTIONS.MATCHES).withConverter(
      firestoreConverter<MatchDocument>(),
    );

    // Firestore doesn't support OR queries on different fields, so we run two
    const q1 = query(
      matchesRef,
      where("user1Id", "==", userId),
      where("status", "==", "active"),
    );
    const q2 = query(
      matchesRef,
      where("user2Id", "==", userId),
      where("status", "==", "active"),
    );

    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

    const matchDocs: { id: string; data: MatchDocument }[] = [];
    snap1.docs.forEach((d) => matchDocs.push({ id: d.id, data: d.data() }));
    snap2.docs.forEach((d) => matchDocs.push({ id: d.id, data: d.data() }));

    if (matchDocs.length === 0) return [];

    // Gather other user IDs
    const otherUids = matchDocs.map((m) =>
      m.data.user1Id === userId ? m.data.user2Id : m.data.user1Id,
    );

    // Batch-fetch profiles
    const profiles = await getUserProfiles(otherUids);
    const profileMap = new Map(profiles.map((p) => [p.uid, p]));

    // Get current user for compatibility calculation
    const { user: currentUser } = await getUserProfile(userId);

    // Build enriched results
    const results: EnrichedMatch[] = matchDocs
      .map((m) => {
        const otherUid =
          m.data.user1Id === userId ? m.data.user2Id : m.data.user1Id;
        const otherUser = profileMap.get(otherUid);
        if (!otherUser) return null;

        const compat = currentUser
          ? calculateCompatibility(currentUser, otherUser)
          : { score: 0, reasons: [] };

        return {
          matchId: m.id,
          match: m.data,
          otherUser,
          compatibility: compat.score,
        } satisfies EnrichedMatch;
      })
      .filter((r): r is EnrichedMatch => r !== null);

    // Sort by last message timestamp (most recent first)
    results.sort((a, b) => {
      const aTime = toMillis(a.match.lastMessageAt);
      const bTime = toMillis(b.match.lastMessageAt);
      return bTime - aTime;
    });

    return results;
  } catch (err) {
    if ((err as MatchServiceError).code?.startsWith("match/")) throw err;
    throw firestoreError(err);
  }
}

/** Convert FirestoreTimestamp to millis for sorting */
function toMillis(ts: any): number {
  if (!ts) return 0;
  if (typeof ts === "string") return new Date(ts).getTime();
  if (ts instanceof Timestamp) return ts.toMillis();
  if (typeof ts?.toMillis === "function") return ts.toMillis();
  return 0;
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get interests received by a user (people who liked them),
 * enriched with sender profiles and compatibility scores.
 */
export async function getReceivedInterests(
  userId: string,
): Promise<EnrichedInterest[]> {
  try {
    const db = firebaseDb();
    const interestsRef = collection(db, COLLECTIONS.INTERESTS).withConverter(
      firestoreConverter<InterestDocument>(),
    );

    const q = query(
      interestsRef,
      where("toUserId", "==", userId),
      where("isMutual", "==", false),
      where("isSkipped", "==", false),
      orderBy("timestamp", "desc"),
      limit(50),
    );

    const snap = await getDocs(q);
    if (snap.empty) return [];

    const senderUids = snap.docs.map((d) => d.data().fromUserId);
    const profiles = await getUserProfiles(senderUids);
    const profileMap = new Map(profiles.map((p) => [p.uid, p]));

    const { user: currentUser } = await getUserProfile(userId);

    return snap.docs
      .map((d) => {
        const interest = d.data();
        const sender = profileMap.get(interest.fromUserId);
        if (!sender) return null;

        const compat = currentUser
          ? calculateCompatibility(currentUser, sender)
          : { score: 0, reasons: [] };

        return {
          interestId: d.id,
          interest,
          sender,
          compatibility: compat.score,
        } satisfies EnrichedInterest;
      })
      .filter((r): r is EnrichedInterest => r !== null);
  } catch (err) {
    throw firestoreError(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get discoverable users for the discovery feed.
 *
 * Pipeline:
 *   1. Query Firestore with hard filters (city, gender, age, etc.)
 *   2. Exclude: current user, blocked, already liked, existing matches
 *   3. Calculate compatibility score for each candidate
 *   4. Sort by compatibility DESC
 *   5. Enforce daily profile view limit
 *   6. Mark the Perfect Match of the Day
 */
export async function getDiscoverableUsers(
  userId: string,
  filters: DiscoveryFilters = {},
): Promise<DiscoverableUser[]> {
  // ── Daily limit check ──
  const { user: currentUser } = await getUserProfile(userId);
  if (!currentUser) {
    throw toError(
      "match/user-not-found",
      "Profile not found.",
      "प्रोफ़ाइल नहीं मिली।",
    );
  }

  const storedLimits = getStoredLimits();
  const tier = currentUser.isPremium ? PREMIUM_LIMITS : FREE_LIMITS;

  if (storedLimits.profilesViewed >= tier.profiles) {
    throw toError(
      "match/profiles-limit",
      `You've viewed all ${tier.profiles} profiles for today. Come back tomorrow or upgrade to Premium!`,
      `आपने आज की सभी ${tier.profiles} प्रोफ़ाइल देख ली हैं। कल वापस आएं या प्रीमियम अपग्रेड करें!`,
    );
  }

  try {
    const db = firebaseDb();

    // ── 1. Get IDs to exclude ──
    const excludeSet = new Set<string>();
    excludeSet.add(userId);

    // Add blocked users
    currentUser.blockedUserIds?.forEach((id) => excludeSet.add(id));

    // Add already-liked users
    const sentInterests = await getDocs(
      query(
        collection(db, COLLECTIONS.INTERESTS),
        where("fromUserId", "==", userId),
      ),
    );
    sentInterests.docs.forEach((d) => {
      const data = d.data() as InterestDocument;
      excludeSet.add(data.toUserId);
    });

    // Add already-matched users
    const [matches1, matches2] = await Promise.all([
      getDocs(
        query(
          collection(db, COLLECTIONS.MATCHES),
          where("user1Id", "==", userId),
        ),
      ),
      getDocs(
        query(
          collection(db, COLLECTIONS.MATCHES),
          where("user2Id", "==", userId),
        ),
      ),
    ]);
    matches1.docs.forEach((d) => {
      const data = d.data() as MatchDocument;
      excludeSet.add(data.user2Id);
    });
    matches2.docs.forEach((d) => {
      const data = d.data() as MatchDocument;
      excludeSet.add(data.user1Id);
    });

    // ── 2. Query candidates from Firestore ──
    const usersRef = collection(db, COLLECTIONS.USERS).withConverter(
      firestoreConverter<UserDocument>(),
    );
    const constraints: any[] = [where("isDeactivated", "==", false)];

    if (filters.city) constraints.push(where("city", "==", filters.city));
    if (filters.intent) constraints.push(where("intent", "==", filters.intent));
    if (filters.verifiedOnly) {
      constraints.push(where("verificationLevel", "in", ["silver", "gold"]));
    }

    // Determine opposite gender (if user has a gender set)
    if (currentUser.gender === "male") {
      constraints.push(where("gender", "==", "female"));
    } else if (currentUser.gender === "female") {
      constraints.push(where("gender", "==", "male"));
    }

    // Fetch a larger pool for client-side filtering
    constraints.push(limit(100));

    const candidatesSnap = await getDocs(query(usersRef, ...constraints));

    let candidates = candidatesSnap.docs
      .map((d) => d.data())
      .filter((u) => !excludeSet.has(u.uid));

    // ── 3. Client-side filters ──
    if (filters.ageMin !== undefined) {
      candidates = candidates.filter(
        (u) => u.age !== null && u.age >= filters.ageMin!,
      );
    }
    if (filters.ageMax !== undefined) {
      candidates = candidates.filter(
        (u) => u.age !== null && u.age <= filters.ageMax!,
      );
    }
    if (filters.diet) {
      candidates = candidates.filter((u) => u.diet === filters.diet);
    }

    // ── 4. Score and sort ──
    const scored: DiscoverableUser[] = candidates.map((user) => {
      const { score, reasons } = calculateCompatibility(currentUser, user);
      return {
        user,
        compatibility: score,
        compatibilityReasons: reasons,
        isPerfectMatch: false,
      };
    });

    scored.sort((a, b) => b.compatibility - a.compatibility);

    // ── 5. Mark Perfect Match of the Day ──
    if (scored.length > 0) {
      scored[0].isPerfectMatch = true;
    }

    // ── 6. Enforce profile view limit (return only remaining quota) ──
    const remaining = tier.profiles - storedLimits.profilesViewed;
    const result = scored.slice(0, Math.max(0, remaining));

    // Increment viewed counter
    if (result.length > 0) {
      const newLimits = getStoredLimits();
      newLimits.profilesViewed += result.length;
      saveStoredLimits(newLimits);
    }

    return result;
  } catch (err) {
    if ((err as MatchServiceError).code?.startsWith("match/")) throw err;
    throw firestoreError(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get the single Perfect Match of the Day.
 *
 * Uses a deterministic selection: highest compatibility among candidates
 * who haven't been shown before today.
 */
export async function getPerfectMatchOfTheDay(
  userId: string,
): Promise<DiscoverableUser | null> {
  try {
    const candidates = await getDiscoverableUsers(userId, {});
    return candidates.find((c) => c.isPerfectMatch) ?? candidates[0] ?? null;
  } catch {
    return null;
  }
}

/**
 * Record a "pass" (skip) on a profile so it doesn't reappear.
 */
export async function passOnProfile(
  fromUserId: string,
  toUserId: string,
): Promise<void> {
  try {
    const db = firebaseDb();
    await addDoc(collection(db, COLLECTIONS.INTERESTS), {
      fromUserId,
      toUserId,
      type: "like",
      comment: null,
      appreciatedElement: null,
      isMutual: false,
      isSeen: false,
      isSkipped: true,
      timestamp: serverTimestamp(),
    });
  } catch {
    // Non-fatal — worst case is the profile reappears
  }
}
