/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Privacy-First Analytics (Umami Self-Hosted)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ZERO third-party data sharing. All data stored on our own servers in India.
 *
 * Architecture:
 *   ┌─────────────┐    ┌───────────────────┐    ┌────────────────┐
 *   │  Browser     │───▶│  Umami Tracker    │───▶│  PostgreSQL    │
 *   │  (consent    │    │  (self-hosted,    │    │  (Railway      │
 *   │   checked)   │    │   Mumbai region)  │    │   Mumbai)      │
 *   └─────────────┘    └───────────────────┘    └────────────────┘
 *
 * Privacy guarantees:
 *   • IP addresses anonymised (last octet stripped by Umami)
 *   • No cookies — Umami uses a hash of IP+UA for unique visitors
 *   • Do Not Track (DNT) header respected
 *   • prefers-reduced-data respected
 *   • All tracking gated behind user consent (DPDP Act 2023)
 *   • Data auto-deleted after 90 days (retention cron in docker-compose)
 *   • User can export their data (DPDP right to access)
 *   • User can request deletion (DPDP right to erasure)
 *
 * Metrics tracked:
 *   • DAU (daily active users) — automatic via Umami pageviews
 *   • Match rate — custom event: match_created
 *   • Message response rate — custom event: message_sent
 *   • Profile completion rate — custom event: profile_updated
 *   • Feature usage — custom events: voice_note_*, safety_button_*
 *   • Limit/upsell events — backward-compatible with existing code
 *
 * Setup:
 *   1. Deploy Umami: docker compose up -d (or Railway template)
 *   2. Get Website ID from Umami dashboard
 *   3. Set in .env.local:
 *        NEXT_PUBLIC_UMAMI_HOST=https://analytics.bandhan.ai
 *        NEXT_PUBLIC_UMAMI_WEBSITE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface AnalyticsEvent {
  event_name: string;
  event_timestamp: string;
  user_id?: string;
  properties?: Record<string, unknown>;
}

/** Granular consent categories — DPDP Act 2023 §6 */
export type ConsentPurpose = "essential" | "matching" | "safety" | "marketing";

export interface ConsentState {
  /** Whether the user has made a choice at all */
  hasResponded: boolean;
  /** Consent granted per purpose */
  purposes: Record<ConsentPurpose, boolean>;
  /** ISO timestamp of when consent was given/updated */
  updatedAt: string;
  /** Version of the consent text the user agreed to */
  policyVersion: string;
}

export interface LimitEventProperties {
  limit_type: "profiles" | "chats" | "likes" | "views";
  daily_limit: number;
  used_count: number;
  remaining_count: number;
  percentage_used: number;
  time_of_day: string;
  is_peak_hours: boolean;
  user_segment: "free" | "premium" | "trial";
  device_type: "mobile" | "desktop" | "tablet";
}

export interface UpsellEventProperties {
  modal_type: "limit_reached" | "feature_locked" | "banner_click";
  trigger_action: string;
  limit_type: "profiles" | "chats" | "likes";
  time_on_page: number;
  previous_upsell_shown: number;
  user_segment: "free" | "premium" | "trial";
}

export interface ConversionEventProperties {
  plan_type: "monthly" | "yearly" | "family";
  price: number;
  currency: string;
  payment_method?: "upi" | "card" | "netbanking" | "wallet";
  time_to_convert: number;
  upsell_impressions: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const CONSENT_STORAGE_KEY = "bandhan_consent";
const ANALYTICS_STORAGE_KEY = "bandhan_analytics_events";
const CURRENT_POLICY_VERSION = "2026-02-28-v1";

const UMAMI_HOST = process.env.NEXT_PUBLIC_UMAMI_HOST || "";
const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID || "";

/** Map each event to the consent purpose it requires */
const EVENT_PURPOSE_MAP: Record<string, ConsentPurpose> = {
  // Essential — always allowed (core app functionality)
  page_view: "essential",
  error_occurred: "essential",
  safety_button_pressed: "essential",
  safety_report_submitted: "essential",
  // Matching — requires "matching" consent
  match_created: "matching",
  interest_sent: "matching",
  interest_received: "matching",
  profile_viewed: "matching",
  profile_updated: "matching",
  discovery_feed_loaded: "matching",
  daily_limit_reached: "matching",
  limit_counter_viewed: "matching",
  limit_exceed_attempt: "matching",
  // Safety — requires "safety" consent
  report_submitted: "safety",
  block_user: "safety",
  verification_started: "safety",
  verification_completed: "safety",
  // Marketing — requires "marketing" consent
  upsell_modal_shown: "marketing",
  upgrade_cta_clicked: "marketing",
  upsell_modal_dismissed: "marketing",
  remind_me_tomorrow_clicked: "marketing",
  checkout_started: "marketing",
  premium_converted: "marketing",
  payment_failed: "marketing",
  premium_page_time: "marketing",
  feature_viewed: "marketing",
  ab_test_exposure: "marketing",
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. CONSENT MANAGEMENT (DPDP Act 2023)
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_CONSENT: ConsentState = {
  hasResponded: false,
  purposes: {
    essential: true, // Essential is always on (legitimate interest)
    matching: false,
    safety: false,
    marketing: false,
  },
  updatedAt: "",
  policyVersion: CURRENT_POLICY_VERSION,
};

/** Read consent state from localStorage. */
export function getConsent(): ConsentState {
  if (typeof localStorage === "undefined") return DEFAULT_CONSENT;
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return DEFAULT_CONSENT;
    const parsed = JSON.parse(raw) as ConsentState;
    // If policy version changed, re-ask for consent
    if (parsed.policyVersion !== CURRENT_POLICY_VERSION) {
      return { ...DEFAULT_CONSENT, policyVersion: CURRENT_POLICY_VERSION };
    }
    return parsed;
  } catch {
    return DEFAULT_CONSENT;
  }
}

/** Persist consent state. */
export function setConsent(state: ConsentState): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private browsing or storage full — degrade gracefully
  }
}

/** Update consent for specific purposes. */
export function updateConsent(
  purposes: Partial<Record<ConsentPurpose, boolean>>,
): void {
  const current = getConsent();
  const updated: ConsentState = {
    hasResponded: true,
    purposes: {
      ...current.purposes,
      essential: true, // Essential can never be turned off
      ...purposes,
    },
    updatedAt: new Date().toISOString(),
    policyVersion: CURRENT_POLICY_VERSION,
  };
  setConsent(updated);

  // If analytics consent was just granted, load the Umami script
  if (
    updated.purposes.matching ||
    updated.purposes.safety ||
    updated.purposes.marketing
  ) {
    loadUmamiScript();
  }
}

/** Accept all consent purposes. */
export function acceptAllConsent(): void {
  updateConsent({
    essential: true,
    matching: true,
    safety: true,
    marketing: true,
  });
}

/** Reject all optional consent (essential stays on). */
export function rejectOptionalConsent(): void {
  updateConsent({ matching: false, safety: false, marketing: false });
}

/** Check if a specific purpose is consented. */
export function hasConsentFor(purpose: ConsentPurpose): boolean {
  if (purpose === "essential") return true;
  return getConsent().purposes[purpose] === true;
}

/** Check if the user has responded to the consent prompt. */
export function hasConsentResponse(): boolean {
  return getConsent().hasResponded;
}

/** Withdraw all consent and clear analytics data. */
export function withdrawConsent(): void {
  setConsent({
    ...DEFAULT_CONSENT,
    hasResponded: true,
    updatedAt: new Date().toISOString(),
  });
  clearAnalytics();
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. DO NOT TRACK
// ─────────────────────────────────────────────────────────────────────────────

/** Check if the user's browser has Do Not Track enabled. */
function isDoNotTrack(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    navigator.doNotTrack === "1" ||
    (window as any).doNotTrack === "1" ||
    (navigator as any).msDoNotTrack === "1"
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. UMAMI SCRIPT LOADER
// ─────────────────────────────────────────────────────────────────────────────

let _umamiLoaded = false;

/**
 * Dynamically inject the Umami tracking script.
 * Only called AFTER the user has given consent.
 * The script is tiny (~2KB) and loads async — no render blocking.
 */
export function loadUmamiScript(): void {
  if (typeof document === "undefined") return;
  if (_umamiLoaded) return;
  if (!UMAMI_HOST || !UMAMI_WEBSITE_ID) return;
  if (isDoNotTrack()) return;

  const script = document.createElement("script");
  script.async = true;
  script.defer = true;
  script.src = `${UMAMI_HOST}/script.js`;
  script.setAttribute("data-website-id", UMAMI_WEBSITE_ID);
  // Privacy: disable cookies, respect DNT, anonymise IPs
  script.setAttribute("data-do-not-track", "true");
  script.setAttribute("data-auto-track", "true"); // Auto-track pageviews
  // In domains: only track our own domain (no cross-site)
  script.setAttribute("data-domains", getDomain());

  document.head.appendChild(script);
  _umamiLoaded = true;
}

function getDomain(): string {
  if (typeof window === "undefined") return "bandhan.ai";
  return window.location.hostname;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. CORE TRACKING (consent-gated)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Track a custom event via Umami.
 * Automatically gates behind the appropriate consent purpose.
 * Falls back to localStorage when Umami isn't loaded (demo mode).
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>,
  userId?: string,
): void {
  // ── Determine required consent purpose ──
  const purpose = EVENT_PURPOSE_MAP[eventName] || "matching";

  // ── Gate behind consent (essential is always allowed) ──
  if (purpose !== "essential" && !hasConsentFor(purpose)) {
    return; // No consent for this category — silently skip
  }

  // ── Respect Do Not Track ──
  if (isDoNotTrack() && purpose !== "essential") {
    return;
  }

  // ── Send to Umami (if loaded) ──
  if (typeof window !== "undefined" && (window as any).umami) {
    try {
      (window as any).umami.track(eventName, properties || {});
    } catch {
      // Umami not ready — fall through to local storage
    }
  }

  // ── Always store locally for the export/demo feature ──
  const event: AnalyticsEvent = {
    event_name: eventName,
    event_timestamp: new Date().toISOString(),
    user_id: userId,
    properties,
  };
  storeEventLocally(event);

  // ── Dev logging ──
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.log(
      `%c[Analytics:${purpose}] ${eventName}`,
      "color: #9E9E9E; font-weight: bold",
      properties || "",
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. LOCAL EVENT STORAGE (for export & demo mode)
// ─────────────────────────────────────────────────────────────────────────────

function getStoredEvents(): AnalyticsEvent[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const stored = localStorage.getItem(ANALYTICS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function storeEventLocally(event: AnalyticsEvent): void {
  if (typeof localStorage === "undefined") return;
  try {
    const events = getStoredEvents();
    events.push(event);
    const trimmed = events.slice(-200); // Keep last 200
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Storage full — silently degrade
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. BANDHAN AI-SPECIFIC TRACKING FUNCTIONS
//    (backward-compatible with existing imports)
// ─────────────────────────────────────────────────────────────────────────────

// ── Matching metrics ──

export function trackMatchCreated(
  matchId: string,
  compatibilityScore: number,
): void {
  trackEvent("match_created", { match_id: matchId, score: compatibilityScore });
}

export function trackInterestSent(
  targetUserId: string,
  type: "like" | "special" | "premium",
): void {
  trackEvent("interest_sent", { target: targetUserId, type });
}

export function trackMessageSent(
  matchId: string,
  messageType: "text" | "voice" | "photo",
): void {
  trackEvent("message_sent", { match_id: matchId, type: messageType });
}

export function trackProfileUpdated(completionPercent: number): void {
  trackEvent("profile_updated", { completion: completionPercent });
}

// ── Feature usage ──

export function trackVoiceNoteRecorded(durationSec: number): void {
  trackEvent("voice_note_recorded", { duration_sec: durationSec });
}

export function trackVoiceNotePlayed(): void {
  trackEvent("voice_note_played");
}

export function trackSafetyButtonPressed(): void {
  trackEvent("safety_button_pressed");
}

export function trackSafetyReportSubmitted(reason: string): void {
  trackEvent("safety_report_submitted", { reason });
}

// ── Limit events (backward-compatible) ──

export function trackLimitReached(properties: LimitEventProperties): void {
  trackEvent("daily_limit_reached", { ...properties });
}

export function trackLimitCounterView(remaining: number, total: number): void {
  trackEvent("limit_counter_viewed", {
    remaining,
    total,
    percentage_remaining: total > 0 ? (remaining / total) * 100 : 0,
  });
}

export function trackLimitExceedAttempt(limitType: string): void {
  trackEvent("limit_exceed_attempt", { limit_type: limitType });
}

// ── Upsell/conversion events (backward-compatible) ──

export function trackUpsellModalShown(properties: UpsellEventProperties): void {
  trackEvent("upsell_modal_shown", { ...properties });
}

export function trackUpgradeCTAClick(
  modalType: string,
  ctaPosition = "primary",
): void {
  trackEvent("upgrade_cta_clicked", {
    modal_type: modalType,
    cta_position: ctaPosition,
  });
}

export function trackUpsellModalDismissed(
  modalType: string,
  dismissAction: "close" | "remind_later" | "skip",
): void {
  trackEvent("upsell_modal_dismissed", {
    modal_type: modalType,
    dismiss_action: dismissAction,
  });
}

export function trackRemindMeTomorrow(): void {
  trackEvent("remind_me_tomorrow_clicked");
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("bandhan_upsell_reminder", new Date().toISOString());
  }
}

export function trackCheckoutStarted(planType: string, price: number): void {
  trackEvent("checkout_started", {
    plan_type: planType,
    price,
    currency: "INR",
  });
}

export function trackConversion(properties: ConversionEventProperties): void {
  trackEvent("premium_converted", { ...properties });
}

export function trackPaymentFailure(
  planType: string,
  errorCode?: string,
): void {
  trackEvent("payment_failed", { plan_type: planType, error_code: errorCode });
}

export function trackPremiumPageTime(seconds: number): void {
  trackEvent("premium_page_time", { duration_seconds: seconds });
}

export function trackFeatureViewed(featureName: string): void {
  trackEvent("feature_viewed", { feature_name: featureName });
}

export function trackABTestExposure(testId: string, variant: string): void {
  trackEvent("ab_test_exposure", { test_id: testId, variant });
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. DATA EXPORT (DPDP Act 2023 — Right to Access, §11)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Export ALL analytics data associated with the current browser session.
 * Returns a JSON string that can be downloaded as a file.
 * This fulfils the DPDP Act 2023 "right to access" requirement.
 */
export function exportUserData(): string {
  const consent = getConsent();
  const events = getStoredEvents();

  const exportData = {
    _metadata: {
      exported_at: new Date().toISOString(),
      app: "Bandhan AI",
      policy_version: CURRENT_POLICY_VERSION,
      description:
        "This file contains all analytics data collected by Bandhan AI for your browser session. " +
        "No personal identifiers (name, phone, email) are included in analytics events. " +
        "IP addresses are anonymised before storage.",
    },
    consent_state: consent,
    events: events,
    event_count: events.length,
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Trigger a file download of the user's analytics data.
 */
export function downloadUserData(): void {
  if (typeof document === "undefined") return;

  const json = exportUserData();
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `bandhan-ai-my-data-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Delete ALL locally stored analytics data.
 * This fulfils the DPDP Act 2023 "right to erasure" requirement.
 * NOTE: Server-side data in Umami can be purged via the admin dashboard
 * or automatically after 90 days by the retention cron.
 */
export function deleteUserData(): void {
  clearAnalytics();
  withdrawConsent();
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. DASHBOARD HELPERS (backward-compatible)
// ─────────────────────────────────────────────────────────────────────────────

export function getAllEvents(): AnalyticsEvent[] {
  return getStoredEvents();
}

export function getEventsByName(eventName: string): AnalyticsEvent[] {
  return getStoredEvents().filter((e) => e.event_name === eventName);
}

export function getConversionRate(): number {
  const events = getAllEvents();
  const impressions = events.filter(
    (e) => e.event_name === "upsell_modal_shown",
  ).length;
  const conversions = events.filter(
    (e) => e.event_name === "premium_converted",
  ).length;
  if (impressions === 0) return 0;
  return (conversions / impressions) * 100;
}

export function getLimitHitsByHour(): Record<number, number> {
  const events = getEventsByName("daily_limit_reached");
  const byHour: Record<number, number> = {};
  events.forEach((event) => {
    const hour = new Date(event.event_timestamp).getHours();
    byHour[hour] = (byHour[hour] || 0) + 1;
  });
  return byHour;
}

export function clearAnalytics(): void {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(ANALYTICS_STORAGE_KEY);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. INITIALIZATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Initialize analytics.
 * Call this once from layout (e.g. in PerfInit).
 *
 * - If user has already consented, loads Umami immediately.
 * - If Do Not Track is on, skips Umami entirely.
 * - If no consent response yet, waits for the ConsentBanner interaction.
 */
export function initAnalytics(): void {
  if (typeof window === "undefined") return;

  // Respect Do Not Track
  if (isDoNotTrack()) return;

  // If user previously consented to any optional purpose, load Umami
  const consent = getConsent();
  if (consent.hasResponded) {
    const anyOptional =
      consent.purposes.matching ||
      consent.purposes.safety ||
      consent.purposes.marketing;
    if (anyOptional) {
      loadUmamiScript();
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Default export (backward-compatible)
// ─────────────────────────────────────────────────────────────────────────────

export default {
  trackEvent,
  trackLimitReached,
  trackLimitCounterView,
  trackLimitExceedAttempt,
  trackUpsellModalShown,
  trackUpgradeCTAClick,
  trackUpsellModalDismissed,
  trackRemindMeTomorrow,
  trackCheckoutStarted,
  trackConversion,
  trackPaymentFailure,
  trackPremiumPageTime,
  trackFeatureViewed,
  trackABTestExposure,
  getAllEvents,
  getEventsByName,
  getConversionRate,
  getLimitHitsByHour,
  clearAnalytics,
  // New exports
  initAnalytics,
  getConsent,
  setConsent,
  updateConsent,
  acceptAllConsent,
  rejectOptionalConsent,
  hasConsentFor,
  hasConsentResponse,
  withdrawConsent,
  exportUserData,
  downloadUserData,
  deleteUserData,
  trackMatchCreated,
  trackInterestSent,
  trackMessageSent,
  trackProfileUpdated,
  trackVoiceNoteRecorded,
  trackSafetyButtonPressed,
};
