/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — User Data Deletion (DPDP Act 2023 §12 — Right to Erasure)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Complete account + data deletion workflow:
 *
 *   1. USER REQUESTS DELETION
 *      → Settings → Account → Delete Account
 *      → Confirm with password/OTP
 *
 *   2. COOLING-OFF PERIOD (30 days)
 *      → Account deactivated immediately (hidden from others)
 *      → Data retained for 30 days (reversible)
 *      → User can reactivate by logging in
 *      → Email/SMS reminder sent at Day 7 and Day 25
 *
 *   3. PERMANENT DELETION (after 30 days)
 *      → Profile data deleted
 *      → Photos deleted from Storage
 *      → Messages deleted (their copy; other user's copy retained per retention policy)
 *      → Matches unlinked
 *      → Analytics purged
 *      → Consent log retained for 1 year (legal compliance)
 *      → Payment records retained for 8 years (Income Tax Act)
 *      → Firebase Auth account deleted
 *
 *   4. CONFIRMATION
 *      → Email sent confirming permanent deletion
 *      → No further data retained except legal minimums
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type DeletionStatus =
  | "none"          // No deletion requested
  | "requested"     // User requested, cooling-off started
  | "cooling_off"   // In 30-day cooling-off period
  | "processing"    // Past cooling-off, deletion in progress
  | "completed"     // Fully deleted
  | "cancelled";    // User reactivated during cooling-off

export type DeletionReason =
  | "found_partner"
  | "privacy_concerns"
  | "not_useful"
  | "bad_experience"
  | "taking_break"
  | "other";

export interface DeletionRequest {
  /** User's UID */
  userId: string;
  /** Current status */
  status: DeletionStatus;
  /** Why the user is leaving (optional, anonymous analytics only) */
  reason: DeletionReason | null;
  /** Optional feedback (max 500 chars) */
  feedback: string | null;
  /** When deletion was requested */
  requestedAt: string;
  /** When cooling-off period ends (requestedAt + 30 days) */
  coolingOffEndsAt: string;
  /** When data was actually deleted (null until completed) */
  deletedAt: string | null;
  /** Whether reminders have been sent */
  remindersSent: {
    day7: boolean;
    day25: boolean;
  };
}

export interface DeletionStep {
  id: string;
  label: string;
  labelHi: string;
  description: string;
  descriptionHi: string;
  status: "pending" | "in_progress" | "completed" | "retained";
  /** If "retained", explain why */
  retentionReason?: string;
  retentionReasonHi?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/** Cooling-off period in days */
export const COOLING_OFF_DAYS = 30;

/** Deletion reasons with labels */
export const DELETION_REASONS: {
  id: DeletionReason;
  label: string;
  labelHi: string;
}[] = [
  { id: "found_partner", label: "Found a partner", labelHi: "साथी मिल गया" },
  { id: "privacy_concerns", label: "Privacy concerns", labelHi: "गोपनीयता की चिंता" },
  { id: "not_useful", label: "Not finding it useful", labelHi: "उपयोगी नहीं लग रहा" },
  { id: "bad_experience", label: "Bad experience", labelHi: "खराब अनुभव" },
  { id: "taking_break", label: "Taking a break", labelHi: "कुछ समय के लिए रुकना" },
  { id: "other", label: "Other", labelHi: "अन्य" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Deletion Workflow
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a new deletion request.
 * This starts the 30-day cooling-off period.
 */
export function createDeletionRequest(
  userId: string,
  reason: DeletionReason | null,
  feedback: string | null,
): DeletionRequest {
  const now = new Date();
  const coolingOffEnd = new Date(now);
  coolingOffEnd.setDate(coolingOffEnd.getDate() + COOLING_OFF_DAYS);

  return {
    userId,
    status: "requested",
    reason,
    feedback: feedback ? feedback.slice(0, 500) : null,
    requestedAt: now.toISOString(),
    coolingOffEndsAt: coolingOffEnd.toISOString(),
    deletedAt: null,
    remindersSent: { day7: false, day25: false },
  };
}

/**
 * Cancel a deletion request (user reactivated).
 */
export function cancelDeletionRequest(
  request: DeletionRequest,
): DeletionRequest {
  return {
    ...request,
    status: "cancelled",
  };
}

/**
 * Check if the cooling-off period has expired.
 */
export function isCoolingOffExpired(request: DeletionRequest): boolean {
  if (request.status !== "requested" && request.status !== "cooling_off") {
    return false;
  }
  return new Date() >= new Date(request.coolingOffEndsAt);
}

/**
 * Get the number of days remaining in the cooling-off period.
 */
export function getCoolingOffDaysRemaining(request: DeletionRequest): number {
  const end = new Date(request.coolingOffEndsAt).getTime();
  const now = Date.now();
  const remaining = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  return Math.max(0, remaining);
}

/**
 * Get the full deletion plan — shows what will be deleted and what will
 * be retained (and why).
 */
export function getDeletionPlan(): DeletionStep[] {
  return [
    {
      id: "profile",
      label: "Profile Data",
      labelHi: "प्रोफ़ाइल डेटा",
      description: "Name, bio, age, education, preferences, dealbreakers",
      descriptionHi: "नाम, बायो, आयु, शिक्षा, प्राथमिकताएं, डीलब्रेकर",
      status: "pending",
    },
    {
      id: "photos",
      label: "Profile Photos",
      labelHi: "प्रोफ़ाइल फ़ोटो",
      description: "All uploaded photos removed from cloud storage",
      descriptionHi: "क्लाउड स्टोरेज से सभी अपलोड की गई फ़ोटो हटाई जाएंगी",
      status: "pending",
    },
    {
      id: "messages",
      label: "Chat Messages",
      labelHi: "चैट संदेश",
      description: "Your sent messages deleted. Other user's copy follows 90-day retention.",
      descriptionHi: "आपके भेजे गए संदेश हटाए जाएंगे। दूसरे उपयोगकर्ता की प्रति 90-दिन प्रतिधारण का पालन करती है।",
      status: "pending",
    },
    {
      id: "voice_notes",
      label: "Voice Notes",
      labelHi: "वॉइस नोट",
      description: "All voice note audio files permanently deleted",
      descriptionHi: "सभी वॉइस नोट ऑडियो फ़ाइलें स्थायी रूप से हटाई जाएंगी",
      status: "pending",
    },
    {
      id: "matches",
      label: "Match History",
      labelHi: "मैच इतिहास",
      description: "All matches unlinked, compatibility data erased",
      descriptionHi: "सभी मैच अनलिंक किए जाएंगे, अनुकूलता डेटा मिटाया जाएगा",
      status: "pending",
    },
    {
      id: "interests",
      label: "Interests (Likes)",
      labelHi: "रुचियाँ (लाइक)",
      description: "All sent and received likes permanently deleted",
      descriptionHi: "सभी भेजे और प्राप्त लाइक स्थायी रूप से हटाए जाएंगे",
      status: "pending",
    },
    {
      id: "analytics",
      label: "Analytics Data",
      labelHi: "एनालिटिक्स डेटा",
      description: "Local and server-side analytics purged immediately",
      descriptionHi: "स्थानीय और सर्वर-साइड एनालिटिक्स तुरंत हटाए जाएंगे",
      status: "pending",
    },
    {
      id: "notifications",
      label: "Notifications",
      labelHi: "सूचनाएं",
      description: "All notification history deleted",
      descriptionHi: "सभी सूचना इतिहास हटाया जाएगा",
      status: "pending",
    },
    {
      id: "auth",
      label: "Authentication",
      labelHi: "प्रमाणीकरण",
      description: "Firebase Auth account permanently deleted",
      descriptionHi: "Firebase Auth खाता स्थायी रूप से हटाया जाएगा",
      status: "pending",
    },
    // Retained items (legal compliance)
    {
      id: "consent_log",
      label: "Consent History",
      labelHi: "सहमति इतिहास",
      description: "Retained for 1 year for legal compliance",
      descriptionHi: "कानूनी अनुपालन के लिए 1 वर्ष के लिए बनाए रखा जाएगा",
      status: "retained",
      retentionReason: "DPDP Act 2023 — required for demonstrating lawful processing",
      retentionReasonHi: "DPDP अधिनियम 2023 — वैध प्रसंस्करण प्रदर्शित करने के लिए आवश्यक",
    },
    {
      id: "payment_records",
      label: "Payment Records",
      labelHi: "भुगतान रिकॉर्ड",
      description: "Retained for 8 years (Income Tax Act requirement)",
      descriptionHi: "8 वर्ष के लिए बनाए रखा जाएगा (आयकर अधिनियम आवश्यकता)",
      status: "retained",
      retentionReason: "Income Tax Act, 1961 — financial records must be retained for 8 years",
      retentionReasonHi: "आयकर अधिनियम, 1961 — वित्तीय रिकॉर्ड 8 वर्ष तक रखे जाने चाहिए",
    },
    {
      id: "moderation_log",
      label: "Moderation Actions",
      labelHi: "मॉडरेशन कार्रवाई",
      description: "Retained for 2 years for repeat offender detection",
      descriptionHi: "बार-बार उल्लंघनकर्ता पहचान के लिए 2 वर्ष तक बनाए रखा जाएगा",
      status: "retained",
      retentionReason: "IT Rules 2021 — intermediary compliance records",
      retentionReasonHi: "IT नियम 2021 — मध्यस्थ अनुपालन रिकॉर्ड",
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// Local Data Cleanup
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Clear all local data from the browser.
 * Called after deletion is confirmed or when user logs out.
 */
export function clearAllLocalData(): void {
  if (typeof localStorage === "undefined") return;

  const keysToRemove = [
    "bandhan_consent_v2",
    "bandhan_consent",
    "bandhan_analytics_events",
    "bandhan_safety_consent",
    "bandhan_filters",
    "bandhan_daily_limit",
    "bandhan_language",
    "bandhan_theme",
  ];

  for (const key of keysToRemove) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore
    }
  }

  // Also clear any bandhan-prefixed items we might have missed
  try {
    const allKeys = Object.keys(localStorage);
    for (const key of allKeys) {
      if (key.startsWith("bandhan_") || key.startsWith("bandhan-")) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // Ignore
  }

  // Clear sessionStorage too
  if (typeof sessionStorage !== "undefined") {
    try {
      sessionStorage.clear();
    } catch {
      // Ignore
    }
  }
}
