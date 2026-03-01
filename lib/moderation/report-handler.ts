/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Report Handler & Strike System
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Processes user reports, manages the 3-strikes warning system,
 * and maintains a full audit trail in Firestore.
 *
 * STRIKE SYSTEM:
 *   Strike 1 → Warning notification (can continue using the app)
 *   Strike 2 → 48-hour temporary restriction (limited features)
 *   Strike 3 → Permanent ban (account suspended, can appeal once)
 *
 *   Strikes expire after 90 days of clean behavior.
 *   Some violations are instant-ban (no strikes) — see INSTANT_BAN_REASONS.
 *
 * AUDIT TRAIL:
 *   Every moderation action is logged in the `moderationLog` Firestore
 *   sub-collection under the user's document, including:
 *     - What happened (report, auto-detection, manual review)
 *     - Who did it (reporter UID or "system")
 *     - What action was taken
 *     - Timestamp
 *
 * APPEAL PROCESS:
 *   - Users can submit one appeal per ban
 *   - Appeals are queued for senior moderator review
 *   - Resolution within 7 business days
 *   - Final decision cannot be re-appealed
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { ReportReason, ReportStatus, ReportDocument } from "@/lib/firebase/schema";
import type { ModerationAction } from "@/lib/moderation/text-moderation";
import type { BadWordCategory } from "@/data/bad-words";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type StrikeLevel = 0 | 1 | 2 | 3;

export type EnforcementAction =
  | "none"
  | "warn"
  | "content_removed"
  | "restrict_48h"
  | "suspend_7d"
  | "suspend_30d"
  | "permanent_ban";

export type AppealStatus = "pending" | "approved" | "denied";

export interface Strike {
  /** Unique ID */
  id: string;
  /** What caused the strike */
  reason: ReportReason | BadWordCategory;
  /** Description for the user */
  description: string;
  /** Hindi description */
  descriptionHi: string;
  /** When the strike was issued */
  issuedAt: string;
  /** When the strike expires (90 days later) */
  expiresAt: string;
  /** Enforcement action taken */
  action: EnforcementAction;
  /** Whether this strike was from an auto-detection or user report */
  source: "auto" | "report" | "manual";
  /** Report ID if from a user report */
  reportId?: string;
}

export interface UserModerationState {
  /** Current active strikes (not expired) */
  strikes: Strike[];
  /** Current active strike count */
  strikeCount: StrikeLevel;
  /** Whether the user is currently restricted */
  isRestricted: boolean;
  /** When the restriction ends (null if not restricted) */
  restrictedUntil: string | null;
  /** Whether the user is permanently banned */
  isBanned: boolean;
  /** Whether an appeal is pending */
  hasActiveAppeal: boolean;
  /** Total reports received (lifetime) */
  totalReportsReceived: number;
  /** Total reports that were upheld (legitimate) */
  upheldReportCount: number;
}

export interface ModerationLogEntry {
  /** Unique log ID */
  id: string;
  /** Target user ID */
  userId: string;
  /** Action taken */
  action: EnforcementAction;
  /** Reason */
  reason: string;
  /** Who initiated (reporter UID, "system", or moderator UID) */
  initiatedBy: string;
  /** Timestamp */
  timestamp: string;
  /** Additional context */
  metadata: Record<string, unknown>;
}

export interface Appeal {
  /** Appeal ID */
  id: string;
  /** User who is appealing */
  userId: string;
  /** The strike or ban being appealed */
  strikeId: string;
  /** User's appeal message */
  message: string;
  /** Status */
  status: AppealStatus;
  /** Moderator response */
  moderatorResponse: string | null;
  /** When the appeal was submitted */
  submittedAt: string;
  /** When the appeal was resolved */
  resolvedAt: string | null;
  /** Moderator who resolved */
  resolvedBy: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/** Violations that result in instant permanent ban (no strikes) */
const INSTANT_BAN_REASONS: Set<string> = new Set([
  "csam",
  "human_trafficking",
  "murder_threat",
  "revenge_sharing",
  "identity_fraud_criminal",
  "prostitution_solicitation",
  "drug_trafficking",
]);

/** Strike expiry period in days */
const STRIKE_EXPIRY_DAYS = 90;

/** Maximum appeal message length */
const MAX_APPEAL_LENGTH = 1000;

/** Restriction duration per strike level */
const RESTRICTION_HOURS: Record<StrikeLevel, number> = {
  0: 0,
  1: 0, // Warning only
  2: 48, // 48-hour restriction
  3: Infinity, // Permanent ban
};

// ─────────────────────────────────────────────────────────────────────────────
// Strike Management
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a unique ID for moderation entities.
 */
function generateId(prefix: string): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 7);
  return `${prefix}_${ts}_${rand}`;
}

/**
 * Create a new strike for a user.
 *
 * @param reason The violation reason
 * @param description Human-readable description
 * @param source How the violation was detected
 * @param reportId Optional report ID if from a user report
 */
export function createStrike(
  reason: ReportReason | BadWordCategory,
  description: string,
  descriptionHi: string,
  source: "auto" | "report" | "manual",
  reportId?: string,
): Strike {
  const now = new Date();
  const expires = new Date(now);
  expires.setDate(expires.getDate() + STRIKE_EXPIRY_DAYS);

  return {
    id: generateId("STR"),
    reason,
    description,
    descriptionHi,
    issuedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    action: "warn", // Will be upgraded by processNewStrike()
    source,
    reportId,
  };
}

/**
 * Filter out expired strikes and return only active ones.
 */
export function getActiveStrikes(strikes: Strike[]): Strike[] {
  const now = new Date().toISOString();
  return strikes.filter((s) => s.expiresAt > now);
}

/**
 * Process a new strike and determine the enforcement action.
 *
 * Returns the updated moderation state with the new strike applied.
 */
export function processNewStrike(
  currentState: UserModerationState,
  newStrike: Strike,
): {
  updatedState: UserModerationState;
  action: EnforcementAction;
  logEntry: ModerationLogEntry;
} {
  // Filter out expired strikes first
  const activeStrikes = getActiveStrikes(currentState.strikes);
  activeStrikes.push(newStrike);

  const strikeCount = Math.min(activeStrikes.length, 3) as StrikeLevel;

  // Determine action based on strike count
  let action: EnforcementAction;
  let restrictedUntil: string | null = null;
  let isBanned = false;

  switch (strikeCount) {
    case 1:
      action = "warn";
      newStrike.action = "warn";
      break;
    case 2:
      action = "restrict_48h";
      newStrike.action = "restrict_48h";
      {
        const restrictEnd = new Date();
        restrictEnd.setHours(restrictEnd.getHours() + RESTRICTION_HOURS[2]);
        restrictedUntil = restrictEnd.toISOString();
      }
      break;
    case 3:
    default:
      action = "permanent_ban";
      newStrike.action = "permanent_ban";
      isBanned = true;
      break;
  }

  const updatedState: UserModerationState = {
    strikes: activeStrikes,
    strikeCount,
    isRestricted: strikeCount === 2,
    restrictedUntil,
    isBanned,
    hasActiveAppeal: currentState.hasActiveAppeal,
    totalReportsReceived: currentState.totalReportsReceived,
    upheldReportCount: currentState.upheldReportCount + 1,
  };

  const logEntry: ModerationLogEntry = {
    id: generateId("LOG"),
    userId: "", // Filled by caller
    action,
    reason: `Strike ${strikeCount}: ${newStrike.reason} — ${newStrike.description}`,
    initiatedBy: newStrike.source === "auto" ? "system" : "moderator",
    timestamp: new Date().toISOString(),
    metadata: {
      strikeId: newStrike.id,
      strikeCount,
      source: newStrike.source,
      reportId: newStrike.reportId,
    },
  };

  return { updatedState, action, logEntry };
}

/**
 * Process an instant ban (for zero-tolerance violations).
 */
export function processInstantBan(
  currentState: UserModerationState,
  reason: string,
  description: string,
): {
  updatedState: UserModerationState;
  logEntry: ModerationLogEntry;
} {
  const updatedState: UserModerationState = {
    ...currentState,
    isBanned: true,
    isRestricted: false,
    restrictedUntil: null,
  };

  const logEntry: ModerationLogEntry = {
    id: generateId("LOG"),
    userId: "",
    action: "permanent_ban",
    reason: `Instant ban: ${reason} — ${description}`,
    initiatedBy: "system",
    timestamp: new Date().toISOString(),
    metadata: { instantBan: true, reason },
  };

  return { updatedState, logEntry };
}

/**
 * Check if a violation reason should trigger an instant ban.
 */
export function isInstantBanViolation(reason: string): boolean {
  return INSTANT_BAN_REASONS.has(reason);
}

// ─────────────────────────────────────────────────────────────────────────────
// Report Processing
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a new report document from user input.
 */
export function createReport(
  reporterId: string,
  reportedUserId: string,
  reason: ReportReason,
  comment: string | null,
  evidenceUrls: string[] = [],
): Omit<ReportDocument, "createdAt" | "updatedAt"> {
  return {
    reporterId,
    reportedUserId,
    reason,
    comment: comment ? comment.slice(0, 500) : null,
    evidenceUrls: evidenceUrls.slice(0, 5),
    status: "pending" as ReportStatus,
    moderatorNotes: null,
    resolvedBy: null,
    resolvedAt: null,
  };
}

/**
 * Determine priority of a report for the moderation queue.
 * Higher number = higher priority (reviewed first).
 */
export function calculateReportPriority(
  reason: ReportReason,
  reportedUserReportCount: number,
): number {
  const basePriority: Record<ReportReason, number> = {
    underage: 100, // Highest priority — child safety
    harassment: 80,
    "fake-profile": 60,
    "inappropriate-content": 50,
    scam: 70,
    spam: 30,
    other: 20,
  };

  let priority = basePriority[reason] || 20;

  // Boost priority for repeat offenders
  if (reportedUserReportCount >= 5) priority += 30;
  else if (reportedUserReportCount >= 3) priority += 20;
  else if (reportedUserReportCount >= 1) priority += 10;

  return Math.min(priority, 150); // Cap at 150
}

/**
 * Get the human-readable label for a report reason.
 */
export function getReportReasonLabel(
  reason: ReportReason,
  language: "en" | "hi" = "en",
): string {
  const labels: Record<ReportReason, { en: string; hi: string }> = {
    "fake-profile": { en: "Fake Profile", hi: "नकली प्रोफ़ाइल" },
    harassment: { en: "Harassment", hi: "उत्पीड़न" },
    spam: { en: "Spam / Scam", hi: "स्पैम / घोटाला" },
    "inappropriate-content": { en: "Inappropriate Content", hi: "अनुचित सामग्री" },
    underage: { en: "Underage User", hi: "कम उम्र का उपयोगकर्ता" },
    scam: { en: "Financial Scam", hi: "वित्तीय धोखाधड़ी" },
    other: { en: "Other", hi: "अन्य" },
  };
  return labels[reason]?.[language] || reason;
}

// ─────────────────────────────────────────────────────────────────────────────
// Appeal System
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create an appeal for a strike or ban.
 */
export function createAppeal(
  userId: string,
  strikeId: string,
  message: string,
): Appeal | { error: string } {
  if (!message || message.trim().length < 20) {
    return { error: "Appeal must be at least 20 characters long." };
  }
  if (message.length > MAX_APPEAL_LENGTH) {
    return { error: `Appeal must be under ${MAX_APPEAL_LENGTH} characters.` };
  }

  return {
    id: generateId("APL"),
    userId,
    strikeId,
    message: message.trim(),
    status: "pending",
    moderatorResponse: null,
    submittedAt: new Date().toISOString(),
    resolvedAt: null,
    resolvedBy: null,
  };
}

/**
 * Resolve an appeal.
 */
export function resolveAppeal(
  appeal: Appeal,
  status: "approved" | "denied",
  moderatorResponse: string,
  moderatorId: string,
): Appeal {
  return {
    ...appeal,
    status,
    moderatorResponse,
    resolvedAt: new Date().toISOString(),
    resolvedBy: moderatorId,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Auto-Moderation Integration
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Map a text moderation result to a strike (if warranted).
 * Not all moderation flags result in strikes — only blocks do.
 */
export function moderationActionToStrike(
  action: ModerationAction,
  category: BadWordCategory,
): Strike | null {
  if (action !== "block") return null;

  const descriptions: Record<BadWordCategory, { en: string; hi: string }> = {
    profanity: {
      en: "Use of inappropriate language",
      hi: "अनुचित भाषा का प्रयोग",
    },
    harassment: {
      en: "Sending threatening or harassing messages",
      hi: "धमकी भरे या उत्पीड़न करने वाले संदेश भेजना",
    },
    hate_speech: {
      en: "Hate speech targeting a community",
      hi: "किसी समुदाय को लक्षित करने वाला घृणास्पद भाषण",
    },
    scam: {
      en: "Attempted financial fraud or scam",
      hi: "वित्तीय धोखाधड़ी का प्रयास",
    },
    sexual: {
      en: "Sharing explicit sexual content",
      hi: "अश्लील यौन सामग्री साझा करना",
    },
    dowry: {
      en: "Dowry demand (illegal under Dowry Prohibition Act, 1961)",
      hi: "दहेज की माँग (दहेज निषेध अधिनियम 1961 के तहत अवैध)",
    },
    self_harm: {
      en: "Self-harm content",
      hi: "आत्म-हानि सामग्री",
    },
  };

  const desc = descriptions[category] || descriptions.profanity;

  return createStrike(category, desc.en, desc.hi, "auto");
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility: Default empty moderation state
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a fresh moderation state for a new user.
 */
export function createDefaultModerationState(): UserModerationState {
  return {
    strikes: [],
    strikeCount: 0,
    isRestricted: false,
    restrictedUntil: null,
    isBanned: false,
    hasActiveAppeal: false,
    totalReportsReceived: 0,
    upheldReportCount: 0,
  };
}

/**
 * Get user-facing enforcement message.
 */
export function getEnforcementMessage(
  action: EnforcementAction,
  language: "en" | "hi" = "en",
): { title: string; body: string } {
  const messages: Record<
    EnforcementAction,
    { en: { title: string; body: string }; hi: { title: string; body: string } }
  > = {
    none: {
      en: { title: "", body: "" },
      hi: { title: "", body: "" },
    },
    warn: {
      en: {
        title: "Warning",
        body: "Your content violated our Community Guidelines. Please review our rules. Repeated violations may result in account restrictions.",
      },
      hi: {
        title: "चेतावनी",
        body: "आपकी सामग्री ने हमारे सामुदायिक दिशानिर्देशों का उल्लंघन किया है। कृपया हमारे नियमों की समीक्षा करें। बार-बार उल्लंघन करने पर खाता प्रतिबंधित हो सकता है।",
      },
    },
    content_removed: {
      en: {
        title: "Content Removed",
        body: "Your content was removed for violating Community Guidelines.",
      },
      hi: {
        title: "सामग्री हटाई गई",
        body: "सामुदायिक दिशानिर्देशों के उल्लंघन के कारण आपकी सामग्री हटा दी गई।",
      },
    },
    restrict_48h: {
      en: {
        title: "Account Restricted (48 Hours)",
        body: "Due to repeated violations, your account has been temporarily restricted. You cannot send messages or like profiles for 48 hours.",
      },
      hi: {
        title: "खाता प्रतिबंधित (48 घंटे)",
        body: "बार-बार उल्लंघन के कारण, आपका खाता अस्थायी रूप से प्रतिबंधित कर दिया गया है। आप 48 घंटे तक संदेश या लाइक नहीं भेज सकते।",
      },
    },
    suspend_7d: {
      en: {
        title: "Account Suspended (7 Days)",
        body: "Your account has been suspended for 7 days due to serious violations. If you believe this is a mistake, you may submit an appeal.",
      },
      hi: {
        title: "खाता निलंबित (7 दिन)",
        body: "गंभीर उल्लंघनों के कारण आपका खाता 7 दिनों के लिए निलंबित कर दिया गया है। यदि आप मानते हैं कि यह गलती है, तो आप अपील कर सकते हैं।",
      },
    },
    suspend_30d: {
      en: {
        title: "Account Suspended (30 Days)",
        body: "Your account has been suspended for 30 days. You may submit one appeal.",
      },
      hi: {
        title: "खाता निलंबित (30 दिन)",
        body: "आपका खाता 30 दिनों के लिए निलंबित कर दिया गया है। आप एक अपील कर सकते हैं।",
      },
    },
    permanent_ban: {
      en: {
        title: "Account Permanently Banned",
        body: "Your account has been permanently banned due to severe or repeated violations. You may submit one final appeal to appeals@bandhan.ai within 7 days.",
      },
      hi: {
        title: "खाता स्थायी रूप से प्रतिबंधित",
        body: "गंभीर या बार-बार उल्लंघन के कारण आपका खाता स्थायी रूप से प्रतिबंधित कर दिया गया है। आप 7 दिनों के भीतर appeals@bandhan.ai पर एक अंतिम अपील कर सकते हैं।",
      },
    },
  };

  return messages[action]?.[language] || messages.warn[language];
}
