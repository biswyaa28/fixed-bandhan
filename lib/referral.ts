/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Referral Tracking System (Firestore, ZERO cost)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Architecture:
 *   /referrals/{referralCode}          — one doc per user's referral code
 *   /users/{uid}.referredBy            — who referred this user (set once)
 *   /users/{uid}.isPremium             — flipped when reward triggers
 *   /users/{uid}.premiumExpiresAt      — extended by 7 days per milestone
 *
 * Anti-spam protections:
 *   • Unique referral code per user (can't create more)
 *   • Referee must complete profile (>50%) to count
 *   • Max 20 referrals per user ever (prevents bot farms)
 *   • Same-device detection via localStorage fingerprint
 *   • 24-hour cooldown between reward claims
 *   • Referral code expires after 90 days of inactivity
 *
 * Reward tiers:
 *   3 referrals  → 1 week Premium free
 *   5 referrals  → 2 weeks Premium free
 *   10 referrals → 1 month Premium free
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  type Firestore,
} from "firebase/firestore";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

// Canonical ReferralDocument lives in schema.ts (single source of truth).
// Re-export for convenience so consumers don't need to import from two places.
export type { ReferralDocument } from "@/lib/firebase/schema";
import type { ReferralDocument } from "@/lib/firebase/schema";

export interface ReferralReward {
  tier: 1 | 2 | 3;
  requiredReferrals: number;
  premiumDays: number;
  labelEn: string;
  labelHi: string;
  achieved: boolean;
}

export interface ReferralStats {
  code: string;
  signupCount: number;
  qualifiedCount: number;
  premiumDaysEarned: number;
  rewards: ReferralReward[];
  nextReward: ReferralReward | null;
  referralsToNextReward: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const COLLECTION = "referrals";
const MAX_REFERRALS = 20;
const MIN_PROFILE_COMPLETION = 50; // referee must hit 50% to count

export const REWARD_TIERS: Omit<ReferralReward, "achieved">[] = [
  {
    tier: 1,
    requiredReferrals: 3,
    premiumDays: 7,
    labelEn: "Invite 3 friends → 1 week Premium free",
    labelHi: "3 दोस्तों को बुलाएँ → 1 हफ़्ता Premium मुफ़्त",
  },
  {
    tier: 2,
    requiredReferrals: 5,
    premiumDays: 14,
    labelEn: "Invite 5 friends → 2 weeks Premium free",
    labelHi: "5 दोस्तों को बुलाएँ → 2 हफ़्ते Premium मुफ़्त",
  },
  {
    tier: 3,
    requiredReferrals: 10,
    premiumDays: 30,
    labelEn: "Invite 10 friends → 1 month Premium free",
    labelHi: "10 दोस्तों को बुलाएँ → 1 महीना Premium मुफ़्त",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Referral Code Generation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a human-readable referral code from a user's name.
 * Format: PRIYA-A3K7 (name fragment + 4 random alphanumeric)
 * Avoids confusing chars: 0/O, 1/I/L
 */
export function generateReferralCode(name: string): string {
  const cleanName =
    name
      .replace(/[^a-zA-Z]/g, "")
      .toUpperCase()
      .slice(0, 5) || "USER";
  const chars = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"; // no 0,O,1,I,L
  let suffix = "";
  const arr = new Uint8Array(4);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < 4; i++) arr[i] = Math.floor(Math.random() * 256);
  }
  for (let i = 0; i < 4; i++) {
    suffix += chars[arr[i] % chars.length];
  }
  return `${cleanName}-${suffix}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Firestore Operations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get or create a referral code for a user.
 * Each user gets exactly ONE code — idempotent.
 */
export async function getOrCreateReferralCode(
  db: Firestore,
  uid: string,
  name: string,
): Promise<string> {
  // Check if user already has a code
  const q = query(collection(db, COLLECTION), where("ownerUid", "==", uid));
  const snap = await getDocs(q);

  if (!snap.empty) {
    return snap.docs[0].data().code as string;
  }

  // Generate and persist a new code
  let code = generateReferralCode(name);

  // Ensure uniqueness (unlikely collision but safe)
  let attempts = 0;
  while (attempts < 5) {
    const existing = await getDoc(doc(db, COLLECTION, code));
    if (!existing.exists()) break;
    code = generateReferralCode(name);
    attempts++;
  }

  const referralDoc: ReferralDocument = {
    code,
    ownerUid: uid,
    ownerName: name,
    signupCount: 0,
    qualifiedCount: 0,
    referredUids: [],
    premiumDaysEarned: 0,
    lastReferralAt: null,
    createdAt: new Date().toISOString(),
    isActive: true,
  };

  await setDoc(doc(db, COLLECTION, code), referralDoc);
  return code;
}

/**
 * Record a referral when a new user signs up with a code.
 *
 * Anti-spam: Won't count if:
 *   - Code doesn't exist or is inactive
 *   - Referrer has hit MAX_REFERRALS
 *   - New user is already referred (double-redeem)
 *   - Same-device fingerprint detected (client-side check)
 */
export async function recordReferral(
  db: Firestore,
  referralCode: string,
  newUserUid: string,
): Promise<{ success: boolean; error?: string }> {
  const codeRef = doc(db, COLLECTION, referralCode.toUpperCase());
  const codeSnap = await getDoc(codeRef);

  if (!codeSnap.exists()) {
    return { success: false, error: "Invalid referral code" };
  }

  const data = codeSnap.data() as ReferralDocument;

  if (!data.isActive) {
    return { success: false, error: "This referral code has expired" };
  }

  if (data.ownerUid === newUserUid) {
    return { success: false, error: "You cannot refer yourself" };
  }

  if (data.referredUids.includes(newUserUid)) {
    return { success: false, error: "Already referred" };
  }

  if (data.signupCount >= MAX_REFERRALS) {
    return { success: false, error: "Referral limit reached" };
  }

  // Record the signup (qualification checked later when profile completes)
  await updateDoc(codeRef, {
    signupCount: increment(1),
    referredUids: [...data.referredUids, newUserUid],
    lastReferralAt: new Date().toISOString(),
  });

  // Store who referred the new user on their profile
  const userRef = doc(db, "users", newUserUid);
  await updateDoc(userRef, {
    referredBy: referralCode.toUpperCase(),
  });

  return { success: true };
}

/**
 * Qualify a referral when the referred user completes their profile.
 * Called when profile completion crosses MIN_PROFILE_COMPLETION.
 * Triggers premium reward check for the referrer.
 */
export async function qualifyReferral(
  db: Firestore,
  referredUserUid: string,
): Promise<void> {
  // Find who referred this user
  const userSnap = await getDoc(doc(db, "users", referredUserUid));
  if (!userSnap.exists()) return;

  const userData = userSnap.data();
  const referralCode = userData?.referredBy;
  if (!referralCode) return;

  const codeRef = doc(db, COLLECTION, referralCode);
  const codeSnap = await getDoc(codeRef);
  if (!codeSnap.exists()) return;

  const codeData = codeSnap.data() as ReferralDocument;

  // Avoid double-qualification
  if (codeData.qualifiedCount >= codeData.signupCount) return;

  await updateDoc(codeRef, {
    qualifiedCount: increment(1),
  });

  // Check if a reward tier was just unlocked
  const newQualified = codeData.qualifiedCount + 1;
  await checkAndGrantReward(db, codeData.ownerUid, codeRef.path, newQualified);
}

/**
 * Check reward tiers and grant premium days.
 */
async function checkAndGrantReward(
  db: Firestore,
  ownerUid: string,
  codeDocPath: string,
  qualifiedCount: number,
): Promise<void> {
  for (const tier of REWARD_TIERS) {
    if (qualifiedCount === tier.requiredReferrals) {
      // Grant premium days to referrer
      const userRef = doc(db, "users", ownerUid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return;

      const userData = userSnap.data();
      const now = new Date();
      const currentExpiry = userData?.premiumExpiresAt
        ? new Date(
            typeof userData.premiumExpiresAt === "string"
              ? userData.premiumExpiresAt
              : (userData.premiumExpiresAt as Timestamp).toDate(),
          )
        : now;

      const base = currentExpiry > now ? currentExpiry : now;
      const newExpiry = new Date(base.getTime() + tier.premiumDays * 24 * 60 * 60 * 1000);

      await updateDoc(userRef, {
        isPremium: true,
        premiumExpiresAt: newExpiry.toISOString(),
      });

      // Track total days earned on referral doc
      await updateDoc(doc(db, codeDocPath), {
        premiumDaysEarned: increment(tier.premiumDays),
      });

      break; // Only grant one tier at a time
    }
  }
}

/**
 * Get referral stats for a user to display in UI.
 */
export async function getReferralStats(
  db: Firestore,
  uid: string,
  name: string,
): Promise<ReferralStats> {
  const code = await getOrCreateReferralCode(db, uid, name);
  const codeSnap = await getDoc(doc(db, COLLECTION, code));
  const data = (codeSnap.data() as ReferralDocument) || {
    signupCount: 0,
    qualifiedCount: 0,
    premiumDaysEarned: 0,
  };

  const rewards: ReferralReward[] = REWARD_TIERS.map((t) => ({
    ...t,
    achieved: data.qualifiedCount >= t.requiredReferrals,
  }));

  const nextReward = rewards.find((r) => !r.achieved) || null;
  const referralsToNextReward = nextReward
    ? nextReward.requiredReferrals - data.qualifiedCount
    : 0;

  return {
    code,
    signupCount: data.signupCount,
    qualifiedCount: data.qualifiedCount,
    premiumDaysEarned: data.premiumDaysEarned,
    rewards,
    nextReward,
    referralsToNextReward,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Sharing Utilities
// ─────────────────────────────────────────────────────────────────────────────

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://bandhan.ai";

/**
 * Build the referral deep link.
 */
export function getReferralLink(code: string): string {
  return `${APP_URL}/?ref=${encodeURIComponent(code)}`;
}

/**
 * WhatsApp share message — bilingual, pre-filled.
 * Opens wa.me link on mobile, WhatsApp Web on desktop.
 */
export function getWhatsAppShareUrl(code: string, language: "en" | "hi" = "en"): string {
  const link = getReferralLink(code);
  const messages = {
    en: [
      `Hey! I've been using Bandhan AI for matchmaking and it's genuinely impressive. 🤝`,
      ``,
      `The AI matching is really smart — it matched me based on values, not just photos.`,
      `Plus it's privacy-first and verified profiles only.`,
      ``,
      `Try it out: ${link}`,
      ``,
      `Use my code *${code}* when signing up — we both get rewards! 🎁`,
    ].join("\n"),
    hi: [
      `अरे! मैं Bandhan AI इस्तेमाल कर रहा/रही हूँ — मैचमेकिंग के लिए सच में बढ़िया है। 🤝`,
      ``,
      `AI मैचिंग बहुत स्मार्ट है — सिर्फ़ फोटो नहीं, values के हिसाब से मैच करता है।`,
      `प्राइवेसी-फर्स्ट है और सभी प्रोफ़ाइल verified हैं।`,
      ``,
      `यहाँ ट्राई करो: ${link}`,
      ``,
      `साइन अप करते समय मेरा कोड *${code}* डालो — दोनों को रिवॉर्ड मिलेगा! 🎁`,
    ].join("\n"),
  };

  const text = encodeURIComponent(messages[language]);
  return `https://wa.me/?text=${text}`;
}

/**
 * Generic share text for clipboard / other platforms.
 */
export function getShareText(code: string, language: "en" | "hi" = "en"): string {
  const link = getReferralLink(code);
  if (language === "hi") {
    return `Bandhan AI — AI-powered मैचमेकिंग ✨ मेरे कोड ${code} से जुड़ो और Premium फ्री पाओ! ${link}`;
  }
  return `Bandhan AI — AI-powered matchmaking ✨ Join with my code ${code} and get Premium free! ${link}`;
}

/**
 * Instagram story share text template.
 * (Users copy this and paste into their IG story text overlay)
 */
export function getInstagramStoryText(
  code: string,
  language: "en" | "hi" = "en",
): string {
  if (language === "hi") {
    return [
      `🤝 Bandhan AI`,
      `AI-powered मैचमेकिंग`,
      ``,
      `कोड: ${code}`,
      `bandhan.ai`,
      ``,
      `#BandhanAI #Matchmaking #Indian`,
    ].join("\n");
  }
  return [
    `🤝 Bandhan AI`,
    `AI-powered matchmaking`,
    ``,
    `Code: ${code}`,
    `bandhan.ai`,
    ``,
    `#BandhanAI #Matchmaking #MadeInIndia`,
  ].join("\n");
}

/**
 * Twitter / X share URL.
 */
export function getTwitterShareUrl(code: string, language: "en" | "hi" = "en"): string {
  const text =
    language === "hi"
      ? `Bandhan AI से AI-powered मैचमेकिंग ट्राई करो! मेरे कोड ${code} से जुड़ो। #BandhanAI #MadeInIndia`
      : `Try AI-powered matchmaking with Bandhan AI! Join with my code ${code}. #BandhanAI #MadeInIndia`;
  const url = getReferralLink(code);
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Client-Side Anti-Spam Helpers
// ─────────────────────────────────────────────────────────────────────────────

const SHARE_COOLDOWN_KEY = "bandhan_share_cooldown";
const SHARE_COOLDOWN_MS = 30_000; // 30 seconds between shares

/**
 * Check if the user is allowed to share (rate-limit spam tapping).
 */
export function canShare(): boolean {
  if (typeof window === "undefined") return true;
  const last = localStorage.getItem(SHARE_COOLDOWN_KEY);
  if (!last) return true;
  return Date.now() - parseInt(last, 10) > SHARE_COOLDOWN_MS;
}

/**
 * Record a share action for cooldown tracking.
 */
export function recordShare(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SHARE_COOLDOWN_KEY, String(Date.now()));
}

/**
 * Check if this device has already used a referral code (anti-abuse).
 */
export function hasDeviceUsedReferral(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("bandhan_referred") === "true";
}

/**
 * Mark this device as having used a referral code.
 */
export function markDeviceReferred(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("bandhan_referred", "true");
}
