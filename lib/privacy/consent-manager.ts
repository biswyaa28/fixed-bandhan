/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Consent Manager (DPDP Act 2023 §6)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Enterprise-grade consent management that extends the basic consent in
 * lib/analytics.ts with Firestore persistence, audit logging, and
 * server-side enforcement.
 *
 * LOCAL (localStorage) — for instant UI gating, offline support
 * REMOTE (Firestore)   — for server-side enforcement, audit trail
 *
 * DPDP Act 2023 requirements addressed:
 *   §6(1)  — Consent is free, specific, informed, unconditional, unambiguous
 *   §6(3)  — Consent given for each specified purpose separately
 *   §6(5)  — Consent clearly distinguishes from other matters
 *   §6(6)  — Consent can be withdrawn at any time
 *   §6(7)  — Withdrawal as easy as giving consent
 *   §8(7)  — Notice in clear language with itemised description
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Consent purposes — each maps to a specific data processing activity.
 * "essential" is always-on under legitimate interest (DPDP Act §7(a)).
 */
export type ConsentPurpose =
  | "essential"   // Core app functionality, authentication, error reporting
  | "matching"    // Profile display, AI matching, discovery feed
  | "safety"      // Content moderation, report handling, verification
  | "marketing";  // Product improvement, premium upsells, feature analytics

/**
 * Complete consent record — persisted both locally and in Firestore.
 */
export interface ConsentRecord {
  /** Has the user interacted with the consent prompt at all? */
  hasResponded: boolean;
  /** Per-purpose opt-in (essential is always true) */
  purposes: Record<ConsentPurpose, boolean>;
  /** ISO timestamp of last consent update */
  updatedAt: string;
  /** Privacy policy version at the time of consent */
  policyVersion: string;
  /** Method used to provide consent (banner, settings, api) */
  method: "banner" | "settings" | "api";
}

/**
 * Consent audit log entry — stored in Firestore for compliance.
 * Path: users/{uid}/consentLog/{logId}
 */
export interface ConsentLogEntry {
  /** What changed */
  action: "granted" | "withdrawn" | "updated";
  /** Which purposes were affected */
  purposes: Partial<Record<ConsentPurpose, boolean>>;
  /** Full state after the change */
  stateAfter: ConsentRecord;
  /** ISO timestamp */
  timestamp: string;
  /** Policy version at time of action */
  policyVersion: string;
  /** How the change was made */
  method: "banner" | "settings" | "api";
  /** IP country (if available, for data localisation audit) */
  ipCountry?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "bandhan_consent_v2";
export const CURRENT_POLICY_VERSION = "2026-02-28-v1";

const ALL_PURPOSES: ConsentPurpose[] = [
  "essential",
  "matching",
  "safety",
  "marketing",
];

/** Human-readable labels for each purpose (bilingual) */
export const PURPOSE_LABELS: Record<
  ConsentPurpose,
  { en: string; hi: string; descEn: string; descHi: string }
> = {
  essential: {
    en: "Essential",
    hi: "आवश्यक",
    descEn:
      "Core app functionality: authentication, error reporting, safety features. Cannot be disabled.",
    descHi:
      "मुख्य ऐप कार्यक्षमता: प्रमाणीकरण, त्रुटि रिपोर्टिंग, सुरक्षा सुविधाएं। अक्षम नहीं किया जा सकता।",
  },
  matching: {
    en: "Matching & Discovery",
    hi: "मैचिंग और खोज",
    descEn:
      "Display your profile to others, run the AI matching algorithm, and track match quality metrics.",
    descHi:
      "अपनी प्रोफ़ाइल दूसरों को दिखाएं, AI मैचिंग एल्गोरिदम चलाएं, और मैच गुणवत्ता मेट्रिक्स ट्रैक करें।",
  },
  safety: {
    en: "Safety & Moderation",
    hi: "सुरक्षा और मॉडरेशन",
    descEn:
      "Content moderation, fake profile detection, report handling, and verification analytics.",
    descHi:
      "सामग्री मॉडरेशन, नकली प्रोफ़ाइल पहचान, रिपोर्ट प्रबंधन, और सत्यापन एनालिटिक्स।",
  },
  marketing: {
    en: "Product Improvement",
    hi: "उत्पाद सुधार",
    descEn:
      "Anonymised usage patterns to improve features. Never sold to third parties. Auto-deleted after 90 days.",
    descHi:
      "सुविधाओं को बेहतर बनाने के लिए अज्ञात उपयोग पैटर्न। कभी तीसरे पक्ष को नहीं बेचा जाता। 90 दिनों के बाद स्वतः हटाया जाता है।",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Default State
// ─────────────────────────────────────────────────────────────────────────────

function createDefaultConsent(): ConsentRecord {
  return {
    hasResponded: false,
    purposes: {
      essential: true,  // Always on (legitimate interest)
      matching: false,   // Off by default (no pre-checked boxes — DPDP §6)
      safety: false,
      marketing: false,
    },
    updatedAt: "",
    policyVersion: CURRENT_POLICY_VERSION,
    method: "banner",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Local Storage Operations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Read consent state from localStorage.
 * Returns default (no consent) if not found or if policy version changed.
 */
export function getLocalConsent(): ConsentRecord {
  if (typeof localStorage === "undefined") return createDefaultConsent();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultConsent();
    const parsed = JSON.parse(raw) as ConsentRecord;
    // If policy version changed, require re-consent
    if (parsed.policyVersion !== CURRENT_POLICY_VERSION) {
      return createDefaultConsent();
    }
    return parsed;
  } catch {
    return createDefaultConsent();
  }
}

/**
 * Save consent state to localStorage.
 */
export function setLocalConsent(record: ConsentRecord): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Private browsing or storage full — degrade gracefully
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Consent Operations (used by UI components)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Update consent for specific purposes.
 * Persists locally and returns a log entry for Firestore persistence.
 *
 * @param changes  Which purposes to update
 * @param method   How the consent was given (banner, settings, api)
 * @returns The updated record + a log entry for audit
 */
export function updateConsent(
  changes: Partial<Record<ConsentPurpose, boolean>>,
  method: ConsentRecord["method"] = "settings",
): { record: ConsentRecord; log: ConsentLogEntry } {
  const current = getLocalConsent();

  const record: ConsentRecord = {
    hasResponded: true,
    purposes: {
      ...current.purposes,
      ...changes,
      essential: true, // Essential can never be disabled
    },
    updatedAt: new Date().toISOString(),
    policyVersion: CURRENT_POLICY_VERSION,
    method,
  };

  setLocalConsent(record);

  const log: ConsentLogEntry = {
    action: "updated",
    purposes: changes,
    stateAfter: record,
    timestamp: record.updatedAt,
    policyVersion: CURRENT_POLICY_VERSION,
    method,
  };

  return { record, log };
}

/**
 * Accept all consent purposes.
 */
export function acceptAll(
  method: ConsentRecord["method"] = "banner",
): { record: ConsentRecord; log: ConsentLogEntry } {
  return updateConsent(
    { essential: true, matching: true, safety: true, marketing: true },
    method,
  );
}

/**
 * Reject all optional consent (essential stays on).
 */
export function rejectOptional(
  method: ConsentRecord["method"] = "banner",
): { record: ConsentRecord; log: ConsentLogEntry } {
  return updateConsent(
    { matching: false, safety: false, marketing: false },
    method,
  );
}

/**
 * Withdraw all consent (resets to default + marks as responded).
 * Used when user deletes their account or revokes all permissions.
 */
export function withdrawAll(): { record: ConsentRecord; log: ConsentLogEntry } {
  const record: ConsentRecord = {
    hasResponded: true,
    purposes: {
      essential: true,
      matching: false,
      safety: false,
      marketing: false,
    },
    updatedAt: new Date().toISOString(),
    policyVersion: CURRENT_POLICY_VERSION,
    method: "settings",
  };

  setLocalConsent(record);

  const log: ConsentLogEntry = {
    action: "withdrawn",
    purposes: { matching: false, safety: false, marketing: false },
    stateAfter: record,
    timestamp: record.updatedAt,
    policyVersion: CURRENT_POLICY_VERSION,
    method: "settings",
  };

  return { record, log };
}

// ─────────────────────────────────────────────────────────────────────────────
// Query Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Check if a specific purpose is currently consented. */
export function hasConsentFor(purpose: ConsentPurpose): boolean {
  if (purpose === "essential") return true;
  return getLocalConsent().purposes[purpose] === true;
}

/** Check if the user has responded to the consent prompt. */
export function hasResponded(): boolean {
  return getLocalConsent().hasResponded;
}

/** Get all active consent purposes. */
export function getActivePurposes(): ConsentPurpose[] {
  const consent = getLocalConsent();
  return ALL_PURPOSES.filter((p) => consent.purposes[p]);
}

/** Get consent record for display in settings. */
export function getConsentSummary(): {
  purposes: { id: ConsentPurpose; label: string; enabled: boolean; locked: boolean }[];
  lastUpdated: string;
  policyVersion: string;
} {
  const consent = getLocalConsent();
  return {
    purposes: ALL_PURPOSES.map((p) => ({
      id: p,
      label: PURPOSE_LABELS[p].en,
      enabled: consent.purposes[p],
      locked: p === "essential",
    })),
    lastUpdated: consent.updatedAt,
    policyVersion: consent.policyVersion,
  };
}
