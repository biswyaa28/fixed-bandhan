/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Automated Data Retention Policy Engine
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Enforces data retention schedules from data-retention-policy.md.
 *
 * RETENTION SCHEDULE:
 *   ┌─────────────────────────────┬────────────────────────────────────────────┐
 *   │ Data Category               │ Retention Period                           │
 *   ├─────────────────────────────┼────────────────────────────────────────────┤
 *   │ Chat messages               │ 90 days from send date                    │
 *   │ Voice notes                 │ 90 days from send date                    │
 *   │ Analytics data              │ 90 days (auto-deleted by cron)            │
 *   │ Location data (Share Date)  │ 24 hours after session ends               │
 *   │ Profile data                │ Account lifetime + 1 year after deletion  │
 *   │ Profile photos              │ Account lifetime + 30 days after deletion │
 *   │ Match history               │ Account lifetime + 1 year after deletion  │
 *   │ Reports (by/about user)     │ 2 years from submission                   │
 *   │ Payment records             │ 8 years (Income Tax Act)                  │
 *   │ Consent log                 │ Account lifetime + 1 year                 │
 *   │ Moderation logs             │ 2 years                                   │
 *   │ Inactive accounts           │ 1 year → warning → 30 days → deletion    │
 *   └─────────────────────────────┴────────────────────────────────────────────┘
 *
 * IMPLEMENTATION:
 *   Client-side: Cleans up localStorage analytics/events
 *   Server-side: Scheduled Cloud Function runs daily to purge expired data
 *                (see DEPLOYMENT note at bottom)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface RetentionRule {
  /** Which data category */
  category: string;
  /** Human-readable label */
  label: string;
  /** Hindi label */
  labelHi: string;
  /** Retention period in days (Infinity for legal minimums) */
  retentionDays: number;
  /** Why this period was chosen */
  justification: string;
  /** Legal basis (if applicable) */
  legalBasis: string | null;
  /** Firestore collection to purge (null for client-only data) */
  firestoreCollection: string | null;
  /** Whether the user can request early deletion */
  userCanRequestEarlyDeletion: boolean;
}

export interface RetentionStats {
  /** Number of items checked */
  itemsChecked: number;
  /** Number of items deleted in this run */
  itemsDeleted: number;
  /** Number of items retained (not yet expired) */
  itemsRetained: number;
  /** When the cleanup ran */
  timestamp: string;
  /** Category-level breakdown */
  categories: { category: string; checked: number; deleted: number }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Retention Rules
// ─────────────────────────────────────────────────────────────────────────────

export const RETENTION_RULES: RetentionRule[] = [
  {
    category: "messages",
    label: "Chat Messages",
    labelHi: "चैट संदेश",
    retentionDays: 90,
    justification: "90 days is sufficient for active conversations and safety investigations",
    legalBasis: null,
    firestoreCollection: "messages",
    userCanRequestEarlyDeletion: true,
  },
  {
    category: "voice_notes",
    label: "Voice Notes",
    labelHi: "वॉइस नोट",
    retentionDays: 90,
    justification: "Same as chat messages — voice notes are a message subtype",
    legalBasis: null,
    firestoreCollection: "messages", // type === "voice"
    userCanRequestEarlyDeletion: true,
  },
  {
    category: "analytics",
    label: "Analytics Events",
    labelHi: "एनालिटिक्स इवेंट",
    retentionDays: 90,
    justification: "90 days provides sufficient data for product improvement",
    legalBasis: null,
    firestoreCollection: null, // Client-side only (Umami handles server-side)
    userCanRequestEarlyDeletion: true,
  },
  {
    category: "location",
    label: "Location Data (Share My Date)",
    labelHi: "स्थान डेटा (शेयर माई डेट)",
    retentionDays: 1, // 24 hours
    justification: "Location data is extremely sensitive — delete as soon as safety session ends",
    legalBasis: null,
    firestoreCollection: null, // Handled by location-tracking.ts
    userCanRequestEarlyDeletion: true,
  },
  {
    category: "profile",
    label: "Profile Data",
    labelHi: "प्रोफ़ाइल डेटा",
    retentionDays: 365, // 1 year after account deletion
    justification: "Required for dispute resolution and legal compliance post-deletion",
    legalBasis: "DPDP Act 2023 §8(8) — retention for specified purpose",
    firestoreCollection: "users",
    userCanRequestEarlyDeletion: false, // Legal minimum
  },
  {
    category: "photos",
    label: "Profile Photos",
    labelHi: "प्रोफ़ाइल फ़ोटो",
    retentionDays: 30, // 30 days after account deletion (cooling-off)
    justification: "30-day cooling-off period for accidental deletion recovery",
    legalBasis: null,
    firestoreCollection: null, // Firebase Storage
    userCanRequestEarlyDeletion: true,
  },
  {
    category: "matches",
    label: "Match History",
    labelHi: "मैच इतिहास",
    retentionDays: 365,
    justification: "Required for legal compliance and dispute resolution",
    legalBasis: "DPDP Act 2023 §8(8)",
    firestoreCollection: "matches",
    userCanRequestEarlyDeletion: false,
  },
  {
    category: "reports",
    label: "Reports (Filed & Received)",
    labelHi: "रिपोर्ट (दायर और प्राप्त)",
    retentionDays: 730, // 2 years
    justification: "Required for repeat offender detection and legal proceedings",
    legalBasis: "IT Rules 2021 Rule 3(1)(a) — intermediary due diligence",
    firestoreCollection: "reports",
    userCanRequestEarlyDeletion: false,
  },
  {
    category: "payments",
    label: "Payment Records",
    labelHi: "भुगतान रिकॉर्ड",
    retentionDays: 2920, // 8 years
    justification: "Indian tax law requires financial records for 8 years",
    legalBasis: "Income Tax Act, 1961 §44AA — books of account",
    firestoreCollection: null, // Handled by Razorpay
    userCanRequestEarlyDeletion: false,
  },
  {
    category: "consent_log",
    label: "Consent History",
    labelHi: "सहमति इतिहास",
    retentionDays: 365,
    justification: "Demonstrates lawful basis for processing — required if audited",
    legalBasis: "DPDP Act 2023 §6 — consent record-keeping",
    firestoreCollection: null, // Sub-collection under user
    userCanRequestEarlyDeletion: false,
  },
  {
    category: "moderation_log",
    label: "Moderation Actions",
    labelHi: "मॉडरेशन कार्रवाई",
    retentionDays: 730, // 2 years
    justification: "Required for compliance reporting and repeat offender detection",
    legalBasis: "IT Rules 2021 Rule 4(1)(d) — monthly compliance reports",
    firestoreCollection: null, // Sub-collection under user
    userCanRequestEarlyDeletion: false,
  },
  {
    category: "inactive_account",
    label: "Inactive Accounts",
    labelHi: "निष्क्रिय खाते",
    retentionDays: 365,
    justification: "1 year of inactivity triggers deletion warning; 30 days later, full deletion",
    legalBasis: "DPDP Act 2023 §8(7) — data minimisation",
    firestoreCollection: "users",
    userCanRequestEarlyDeletion: true,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Client-Side Retention Enforcement
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Clean up expired analytics events from localStorage.
 * Should be called on app startup (in layout.tsx or a global effect).
 */
export function cleanupLocalAnalytics(): { deleted: number; retained: number } {
  if (typeof localStorage === "undefined") return { deleted: 0, retained: 0 };

  const ANALYTICS_KEY = "bandhan_analytics_events";
  const MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000; // 90 days in ms
  const cutoff = Date.now() - MAX_AGE_MS;

  try {
    const raw = localStorage.getItem(ANALYTICS_KEY);
    if (!raw) return { deleted: 0, retained: 0 };

    const events = JSON.parse(raw) as { event_timestamp?: string }[];
    const before = events.length;

    const retained = events.filter((e) => {
      if (!e.event_timestamp) return false;
      return new Date(e.event_timestamp).getTime() > cutoff;
    });

    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(retained));
    return { deleted: before - retained.length, retained: retained.length };
  } catch {
    return { deleted: 0, retained: 0 };
  }
}

/**
 * Check if an account should be flagged as inactive.
 * An account is inactive if lastSeenAt is older than INACTIVE_THRESHOLD.
 *
 * @param lastSeenAt  ISO timestamp of last user activity
 * @returns Days since last activity, and whether account is inactive
 */
export function checkAccountInactivity(lastSeenAt: string | null): {
  daysSinceActive: number;
  isInactive: boolean;
  shouldWarn: boolean;
  shouldDelete: boolean;
} {
  if (!lastSeenAt) {
    return { daysSinceActive: Infinity, isInactive: true, shouldWarn: true, shouldDelete: false };
  }

  const ms = Date.now() - new Date(lastSeenAt).getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  return {
    daysSinceActive: days,
    isInactive: days >= 365,
    shouldWarn: days >= 335 && days < 365, // Warn 30 days before deletion
    shouldDelete: days >= 395, // 365 + 30-day grace period
  };
}

/**
 * Get a human-readable summary of the retention policy.
 * Used in the Settings → Privacy → Data Retention section.
 */
export function getRetentionSummary(language: "en" | "hi" = "en"): {
  rules: {
    label: string;
    period: string;
    canDelete: boolean;
    legalBasis: string | null;
  }[];
} {
  return {
    rules: RETENTION_RULES.map((r) => ({
      label: language === "hi" ? r.labelHi : r.label,
      period: formatRetentionPeriod(r.retentionDays, language),
      canDelete: r.userCanRequestEarlyDeletion,
      legalBasis: r.legalBasis,
    })),
  };
}

function formatRetentionPeriod(days: number, language: "en" | "hi"): string {
  if (days <= 1) return language === "hi" ? "24 घंटे" : "24 hours";
  if (days <= 90) return language === "hi" ? `${days} दिन` : `${days} days`;
  if (days <= 365) return language === "hi" ? "1 वर्ष" : "1 year";
  if (days <= 730) return language === "hi" ? "2 वर्ष" : "2 years";
  return language === "hi" ? "8 वर्ष" : "8 years";
}

// ─────────────────────────────────────────────────────────────────────────────
// Server-Side Retention (Cloud Function stub)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * DEPLOYMENT NOTE:
 *
 * In production, create a scheduled Cloud Function that runs daily:
 *
 * ```ts
 * // api/src/scheduled/retentionCleanup.ts
 * import * as functions from "firebase-functions/v2";
 * import { getFirestore } from "firebase-admin/firestore";
 *
 * export const dailyRetentionCleanup = functions.scheduler
 *   .onSchedule("every day 03:00", async () => {
 *     const db = getFirestore();
 *     const cutoff90 = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
 *
 *     // Delete messages older than 90 days
 *     const oldMessages = await db
 *       .collection("messages")
 *       .where("timestamp", "<", cutoff90)
 *       .limit(500)
 *       .get();
 *
 *     const batch = db.batch();
 *     oldMessages.docs.forEach(doc => batch.delete(doc.ref));
 *     await batch.commit();
 *
 *     // Similarly for voice notes, location data, etc.
 *
 *     // Flag inactive accounts (365 days)
 *     const cutoff365 = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
 *     const inactive = await db
 *       .collection("users")
 *       .where("lastSeenAt", "<", cutoff365)
 *       .where("isDeactivated", "==", false)
 *       .limit(100)
 *       .get();
 *
 *     // Send inactivity warnings, etc.
 *   });
 * ```
 */
export const __DEPLOYMENT_STUB__ = true;
