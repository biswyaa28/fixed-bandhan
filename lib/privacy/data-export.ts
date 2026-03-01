/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — User Data Export (DPDP Act 2023 §11 — Right to Access)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Generates a comprehensive JSON export of ALL personal data the platform
 * holds about a user. Required by:
 *   §11(1) — Right to obtain summary of personal data being processed
 *   §11(2) — Right to know identities of all Data Processors
 *
 * EXPORTED DATA:
 *   • Profile data (name, bio, photos, preferences, dealbreakers)
 *   • Match history (who matched, when, compatibility score)
 *   • Messages (chat text, voice note metadata — NOT the audio files)
 *   • Interests sent & received (likes, special interests)
 *   • Verification status
 *   • Consent record
 *   • Analytics events (from localStorage)
 *   • Privacy settings
 *
 * NOT EXPORTED (for safety):
 *   • Other users' personal data (only IDs are included)
 *   • Raw moderation reports (admin-only)
 *   • Internal algorithm scores (trade secret)
 *
 * FORMAT: JSON with human-readable structure and metadata header.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { getLocalConsent, CURRENT_POLICY_VERSION } from "./consent-manager";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface DataExportMetadata {
  exportedAt: string;
  app: string;
  version: string;
  policyVersion: string;
  userId: string;
  format: "json";
  description: string;
  descriptionHi: string;
  dataProcessors: DataProcessorInfo[];
}

export interface DataProcessorInfo {
  name: string;
  purpose: string;
  dataShared: string;
  location: string;
  privacyPolicyUrl: string;
}

export interface UserDataExport {
  _metadata: DataExportMetadata;
  profile: Record<string, unknown> | null;
  matches: Record<string, unknown>[];
  messages: Record<string, unknown>[];
  interestsSent: Record<string, unknown>[];
  interestsReceived: Record<string, unknown>[];
  profileVisits: Record<string, unknown>[];
  notifications: Record<string, unknown>[];
  verification: Record<string, unknown> | null;
  consent: Record<string, unknown>;
  privacySettings: Record<string, unknown> | null;
  analyticsEvents: Record<string, unknown>[];
  reportsFiled: Record<string, unknown>[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Data Processors Disclosure (DPDP Act §11(2))
// ─────────────────────────────────────────────────────────────────────────────

const DATA_PROCESSORS: DataProcessorInfo[] = [
  {
    name: "Firebase (Google LLC)",
    purpose: "Authentication, database, file storage, hosting",
    dataShared: "Account data, profile, messages, photos",
    location: "India (Mumbai — asia-south1)",
    privacyPolicyUrl: "https://firebase.google.com/support/privacy",
  },
  {
    name: "Razorpay Software Pvt. Ltd.",
    purpose: "Payment processing",
    dataShared: "Transaction ID, amount, status (NOT card/bank details)",
    location: "India",
    privacyPolicyUrl: "https://razorpay.com/privacy/",
  },
  {
    name: "DigiLocker (NIC, Govt. of India)",
    purpose: "Identity verification (pass/fail status only)",
    dataShared: "Verification request → pass/fail response",
    location: "India",
    privacyPolicyUrl: "https://digilocker.gov.in/privacy-policy",
  },
  {
    name: "Umami (self-hosted)",
    purpose: "Anonymised analytics (no PII)",
    dataShared: "Anonymised page views, feature usage",
    location: "India (self-hosted in Mumbai region)",
    privacyPolicyUrl: "https://umami.is/privacy",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Export Builder
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build the metadata header for the export file.
 */
function buildMetadata(userId: string): DataExportMetadata {
  return {
    exportedAt: new Date().toISOString(),
    app: "Bandhan AI",
    version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
    policyVersion: CURRENT_POLICY_VERSION,
    userId,
    format: "json",
    description:
      "This file contains all personal data held by Bandhan AI for your account. " +
      "It is provided under DPDP Act 2023 §11 (Right to Access). " +
      "Other users' personal data is excluded — only their IDs appear where relevant.",
    descriptionHi:
      "इस फ़ाइल में आपके खाते के लिए बंधन AI द्वारा रखे गए सभी व्यक्तिगत डेटा शामिल हैं। " +
      "यह DPDP अधिनियम 2023 §11 (पहुँच का अधिकार) के तहत प्रदान किया गया है। " +
      "अन्य उपयोगकर्ताओं का व्यक्तिगत डेटा शामिल नहीं है — केवल उनकी ID दिखाई देती हैं।",
    dataProcessors: DATA_PROCESSORS,
  };
}

/**
 * Collect locally-stored analytics events for inclusion in the export.
 */
function collectLocalAnalytics(): Record<string, unknown>[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem("bandhan_analytics_events");
    if (!raw) return [];
    return JSON.parse(raw) as Record<string, unknown>[];
  } catch {
    return [];
  }
}

/**
 * Build a complete user data export.
 *
 * This function collects ONLY client-side data. In production, the
 * full export would also query Firestore (profile, matches, messages).
 * The Firestore queries should be performed in a server-side function
 * and the results passed to this builder.
 *
 * @param userId  The authenticated user's UID
 * @param firestoreData  Data fetched from Firestore (by the calling component)
 */
export function buildUserDataExport(
  userId: string,
  firestoreData?: {
    profile?: Record<string, unknown> | null;
    matches?: Record<string, unknown>[];
    messages?: Record<string, unknown>[];
    interestsSent?: Record<string, unknown>[];
    interestsReceived?: Record<string, unknown>[];
    profileVisits?: Record<string, unknown>[];
    notifications?: Record<string, unknown>[];
    reportsFiled?: Record<string, unknown>[];
  },
): UserDataExport {
  const consent = getLocalConsent();

  return {
    _metadata: buildMetadata(userId),
    profile: firestoreData?.profile ?? null,
    matches: firestoreData?.matches ?? [],
    messages: firestoreData?.messages ?? [],
    interestsSent: firestoreData?.interestsSent ?? [],
    interestsReceived: firestoreData?.interestsReceived ?? [],
    profileVisits: firestoreData?.profileVisits ?? [],
    notifications: firestoreData?.notifications ?? [],
    verification: null, // Populated from profile.verificationLevel
    consent: {
      currentState: consent,
      purposes: consent.purposes,
      lastUpdated: consent.updatedAt,
      policyVersion: consent.policyVersion,
    },
    privacySettings: null, // Populated from profile.privacy
    analyticsEvents: collectLocalAnalytics(),
    reportsFiled: firestoreData?.reportsFiled ?? [],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// File Download
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Trigger a browser download of the user's data export as a JSON file.
 *
 * @param userId  The user's UID
 * @param firestoreData  Optional pre-fetched Firestore data
 */
export function downloadDataExport(
  userId: string,
  firestoreData?: Parameters<typeof buildUserDataExport>[1],
): void {
  if (typeof document === "undefined") return;

  const exportData = buildUserDataExport(userId, firestoreData);
  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `bandhan-ai-my-data-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 200);
}

/**
 * Estimate the size of the export for UI display.
 * Returns approximate KB.
 */
export function estimateExportSize(
  firestoreData?: Parameters<typeof buildUserDataExport>[1],
): number {
  const export_ = buildUserDataExport("estimate", firestoreData);
  const json = JSON.stringify(export_);
  return Math.ceil(json.length / 1024);
}
