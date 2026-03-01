/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Referral Program (Growth Layer)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * This module sits on top of lib/referral.ts (which handles Firestore CRUD)
 * and adds the *growth* logic:
 *
 *   • Smart share timing — prompt users at high-engagement moments
 *   • Channel-specific share formatting (WhatsApp, SMS, Instagram, Twitter)
 *   • A/B test share message variants
 *   • Referral attribution from URL params (?ref=CODE)
 *   • Gamification: progress bar, milestones, leaderboard
 *   • Anti-spam: rate limiting, device fingerprint, cooldown
 *
 * Architecture:
 *   growth/referral-program.ts  ← YOU ARE HERE (strategy + triggers)
 *   lib/referral.ts              ← Firestore operations + code generation
 *   components/ReferralSystem.tsx ← UI component
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  REWARD_TIERS,
  getReferralLink,
  getWhatsAppShareUrl,
  getShareText,
  getInstagramStoryText,
  getTwitterShareUrl,
  canShare,
  recordShare,
  hasDeviceUsedReferral,
  markDeviceReferred,
  type ReferralStats,
} from "@/lib/referral";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ShareChannel = "whatsapp" | "sms" | "instagram" | "twitter" | "copy" | "native";

export type ReferralTrigger =
  | "first_match"          // Just got their first match → high emotion
  | "profile_complete"     // Profile 100% complete → momentum
  | "day_7"                // Using app for 7 days → established habit
  | "premium_trial_end"    // Trial ending → "share to get more days"
  | "success_story_viewed" // Just read a success story → inspired
  | "settings_page"        // Opened referral in settings → intentional
  | "post_video_call"      // Just had a video call → excited
  | "match_5"              // Got 5th match → milestone
  | "manual";              // User navigated to share screen themselves

export interface ShareAction {
  channel: ShareChannel;
  url: string;
  text: string;
  /** Whether native Web Share API was used */
  usedNativeShare: boolean;
}

export interface ReferralPromptDecision {
  shouldShow: boolean;
  trigger: ReferralTrigger | null;
  /** Delay in ms before showing the prompt (to not interrupt) */
  delayMs: number;
  /** Which message variant to show */
  messageVariant: "value" | "social" | "reward";
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/** Maximum referral prompts per week (don't be annoying) */
const MAX_PROMPTS_PER_WEEK = 2;

/** Minimum days between same trigger type */
const TRIGGER_COOLDOWN_DAYS = 14;

/** localStorage keys */
const PROMPT_LOG_KEY = "bandhan_referral_prompts";
const LAST_TRIGGER_KEY = "bandhan_referral_triggers";

// ─────────────────────────────────────────────────────────────────────────────
// Smart Prompt Timing
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Decide whether to show a referral prompt right now.
 *
 * Rules:
 *   1. Max 2 prompts per week (respects user attention)
 *   2. Same trigger can't fire within 14 days
 *   3. Never show if user already shared today
 *   4. Delay varies by trigger (don't interrupt flow)
 *   5. Message variant rotates: value → social → reward
 */
export function shouldShowReferralPrompt(
  trigger: ReferralTrigger,
  stats: ReferralStats,
): ReferralPromptDecision {
  const NO: ReferralPromptDecision = {
    shouldShow: false,
    trigger: null,
    delayMs: 0,
    messageVariant: "value",
  };

  if (typeof window === "undefined") return NO;

  // Manual always shows
  if (trigger === "manual") {
    return { shouldShow: true, trigger, delayMs: 0, messageVariant: "reward" };
  }

  // Check weekly prompt limit
  const promptLog = getPromptLog();
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentPrompts = promptLog.filter((ts) => ts > oneWeekAgo);
  if (recentPrompts.length >= MAX_PROMPTS_PER_WEEK) return NO;

  // Check trigger cooldown
  const lastTriggers = getTriggerLog();
  const lastSameTrigger = lastTriggers[trigger];
  if (lastSameTrigger) {
    const daysSince = (Date.now() - lastSameTrigger) / (1000 * 60 * 60 * 24);
    if (daysSince < TRIGGER_COOLDOWN_DAYS) return NO;
  }

  // Check if already shared today
  if (!canShare()) return NO;

  // Determine delay and variant based on trigger
  const config = TRIGGER_CONFIG[trigger];

  return {
    shouldShow: true,
    trigger,
    delayMs: config.delayMs,
    messageVariant: config.variant,
  };
}

const TRIGGER_CONFIG: Record<
  ReferralTrigger,
  { delayMs: number; variant: "value" | "social" | "reward" }
> = {
  first_match:          { delayMs: 3000,  variant: "social" },
  profile_complete:     { delayMs: 2000,  variant: "value" },
  day_7:                { delayMs: 5000,  variant: "reward" },
  premium_trial_end:    { delayMs: 1000,  variant: "reward" },
  success_story_viewed: { delayMs: 4000,  variant: "social" },
  settings_page:        { delayMs: 0,     variant: "reward" },
  post_video_call:      { delayMs: 5000,  variant: "social" },
  match_5:              { delayMs: 3000,  variant: "value" },
  manual:               { delayMs: 0,     variant: "reward" },
};

/**
 * Record that a referral prompt was shown.
 */
export function recordPromptShown(trigger: ReferralTrigger): void {
  if (typeof window === "undefined") return;

  // Update prompt log
  const log = getPromptLog();
  log.push(Date.now());
  localStorage.setItem(PROMPT_LOG_KEY, JSON.stringify(log.slice(-20)));

  // Update trigger log
  const triggers = getTriggerLog();
  triggers[trigger] = Date.now();
  localStorage.setItem(LAST_TRIGGER_KEY, JSON.stringify(triggers));
}

function getPromptLog(): number[] {
  try {
    return JSON.parse(localStorage.getItem(PROMPT_LOG_KEY) || "[]");
  } catch {
    return [];
  }
}

function getTriggerLog(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(LAST_TRIGGER_KEY) || "{}");
  } catch {
    return {};
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Share Actions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Execute a share action for a given channel.
 * Handles URL generation, native share API, and tracking.
 */
export async function executeShare(
  code: string,
  channel: ShareChannel,
  language: "en" | "hi" = "en",
): Promise<ShareAction> {
  // Rate limit
  if (!canShare()) {
    throw new Error("Please wait before sharing again");
  }

  let url = "";
  let text = "";
  let usedNativeShare = false;

  switch (channel) {
    case "whatsapp":
      url = getWhatsAppShareUrl(code, language);
      text = getShareText(code, language);
      openUrl(url);
      break;

    case "sms":
      text = getShareText(code, language);
      url = `sms:?body=${encodeURIComponent(text)}`;
      openUrl(url);
      break;

    case "twitter":
      url = getTwitterShareUrl(code, language);
      text = getShareText(code, language);
      openUrl(url);
      break;

    case "instagram":
      text = getInstagramStoryText(code, language);
      await copyToClipboard(text);
      break;

    case "copy":
      text = getShareText(code, language);
      await copyToClipboard(text);
      break;

    case "native":
      text = getShareText(code, language);
      url = getReferralLink(code);
      if (typeof navigator !== "undefined" && navigator.share) {
        try {
          await navigator.share({ title: "Bandhan AI", text, url });
          usedNativeShare = true;
        } catch {
          // User cancelled — still count as attempt
        }
      } else {
        // Fallback to copy
        await copyToClipboard(text);
      }
      break;
  }

  recordShare();

  return { channel, url, text, usedNativeShare };
}

function openUrl(url: string): void {
  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

async function copyToClipboard(text: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// URL Attribution
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extract referral code from URL search params.
 * Called on app load to attribute signups.
 *
 * URL format: https://bandhan.ai/?ref=PRIYA-A3K7
 */
export function extractReferralFromURL(): string | null {
  if (typeof window === "undefined") return null;

  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");

  if (ref && /^[A-Z0-9]+-[A-Z0-9]+$/i.test(ref)) {
    return ref.toUpperCase();
  }

  return null;
}

/**
 * Store extracted referral code for use during signup.
 * Called on landing page load if ?ref= is present.
 */
export function storeReferralCode(code: string): void {
  if (typeof window === "undefined") return;
  if (hasDeviceUsedReferral()) return; // Already used a referral
  sessionStorage.setItem("bandhan_pending_referral", code);
}

/**
 * Retrieve stored referral code during signup flow.
 */
export function getPendingReferralCode(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("bandhan_pending_referral");
}

/**
 * Mark referral as consumed after successful signup.
 */
export function consumeReferralCode(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("bandhan_pending_referral");
  markDeviceReferred();
}

// ─────────────────────────────────────────────────────────────────────────────
// Gamification Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get progress toward next reward (for progress bar UI).
 */
export function getReferralProgress(stats: ReferralStats): {
  current: number;
  target: number;
  percentage: number;
  label: string;
  labelHi: string;
} {
  if (stats.nextReward) {
    return {
      current: stats.qualifiedCount,
      target: stats.nextReward.requiredReferrals,
      percentage: Math.min(
        100,
        Math.round((stats.qualifiedCount / stats.nextReward.requiredReferrals) * 100),
      ),
      label: stats.nextReward.labelEn,
      labelHi: stats.nextReward.labelHi,
    };
  }

  // All rewards achieved
  const lastTier = REWARD_TIERS[REWARD_TIERS.length - 1];
  return {
    current: stats.qualifiedCount,
    target: lastTier.requiredReferrals,
    percentage: 100,
    label: "All rewards earned! Thank you! 🎉",
    labelHi: "सभी पुरस्कार अर्जित! धन्यवाद! 🎉",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// A/B Message Variants
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get the referral prompt message based on variant.
 */
export function getPromptMessage(
  variant: "value" | "social" | "reward",
  language: "en" | "hi" = "en",
): { title: string; body: string; cta: string } {
  const messages = {
    value: {
      en: {
        title: "Know someone looking for a life partner?",
        body: "Share Bandhan AI with them. AI-powered matching that actually works.",
        cta: "Share Now",
      },
      hi: {
        title: "कोई जानते हैं जो जीवन साथी खोज रहे हैं?",
        body: "उनके साथ बंधन AI शेयर करें। AI-संचालित मैचिंग जो वास्तव में काम करती है।",
        cta: "अभी शेयर करें",
      },
    },
    social: {
      en: {
        title: "Enjoying Bandhan?",
        body: "Share your experience with friends. Help them find their match too!",
        cta: "Invite Friends",
      },
      hi: {
        title: "बंधन पसंद आ रहा है?",
        body: "दोस्तों के साथ अपना अनुभव साझा करें। उन्हें भी अपना मैच खोजने में मदद करें!",
        cta: "दोस्तों को बुलाएं",
      },
    },
    reward: {
      en: {
        title: "Get Premium free!",
        body: "Invite 3 friends → 1 week Premium free. Invite 10 → 1 month free!",
        cta: "Start Inviting",
      },
      hi: {
        title: "Premium मुफ़्त पाएं!",
        body: "3 दोस्तों को बुलाएं → 1 हफ़्ता Premium मुफ़्त। 10 बुलाएं → 1 महीना मुफ़्त!",
        cta: "बुलाना शुरू करें",
      },
    },
  };

  return messages[variant][language];
}
