/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Pricing Configuration (Single Source of Truth)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ALL pricing, plan features, and limits are defined here.
 * Every other file (payment service, subscription service, UI components,
 * analytics, legal docs) references this module — NEVER hardcode prices.
 *
 * PRICING PHILOSOPHY:
 *   • GST-inclusive (18% GST baked into displayed price)
 *   • Yearly plan = 40% savings vs monthly (strongest nudge)
 *   • Family plan fills a unique Indian market gap
 *   • 7-day free trial removes risk for first-time subscribers
 *   • UPI-first (85%+ of Indian digital payments)
 *
 * CURRENCY: INR (₹) — all amounts in paise internally (×100)
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type PlanId = "free" | "premium_monthly" | "premium_yearly" | "family";
export type BillingCycle = "monthly" | "yearly";
export type PaymentMethod = "upi" | "card" | "netbanking" | "wallet";

export interface PlanFeature {
  id: string;
  label: string;
  labelHi: string;
  /** Whether this feature is available in the plan */
  included: boolean;
  /** Short description for tooltips */
  description?: string;
  descriptionHi?: string;
}

export interface PricingPlan {
  id: PlanId;
  name: string;
  nameHi: string;
  /** Price in paise (₹499 = 49900) */
  priceInPaise: number;
  /** Display price string (GST-inclusive) */
  displayPrice: string;
  /** Billing cycle */
  cycle: BillingCycle | null;
  /** Period label */
  periodLabel: string;
  periodLabelHi: string;
  /** Savings vs monthly (e.g., "Save 40%") */
  savingsBadge: string | null;
  savingsBadgeHi: string | null;
  /** Effective daily cost for marketing */
  dailyCostDisplay: string;
  dailyCostDisplayHi: string;
  /** Whether trial is available */
  hasFreeTrial: boolean;
  /** Trial duration in days */
  trialDays: number;
  /** Plan-specific limits */
  limits: PlanLimits;
  /** Features list */
  features: PlanFeature[];
  /** Badge text (e.g., "Most Popular") */
  badge: string | null;
  badgeHi: string | null;
}

export interface PlanLimits {
  /** Daily profile views (-1 = unlimited) */
  dailyProfileViews: number;
  /** Daily new conversations (-1 = unlimited) */
  dailyConversations: number;
  /** Weekly Special Interest sends */
  weeklySpecialInterests: number;
  /** Weekly Premium Interest sends */
  weeklyPremiumInterests: number;
  /** Daily Spotlight activations */
  weeklySpotlights: number;
  /** Whether advanced filters are available */
  advancedFilters: boolean;
  /** Whether Family View PDF is available */
  familyViewPdf: boolean;
  /** Whether Compatibility Insights are visible */
  compatibilityInsights: boolean;
  /** Whether priority matching is enabled */
  priorityMatching: boolean;
  /** Whether video calling is available */
  videoCalling: boolean;
  /** Number of profiles in plan (for Family) */
  profileSlots: number;
  /** Whether parent dashboard is available */
  parentDashboard: boolean;
  /** Read receipts visibility */
  readReceipts: boolean;
  /** Number of daily Perfect Match picks shown */
  dailyPerfectMatches: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// GST Configuration
// ─────────────────────────────────────────────────────────────────────────────

/** GST rate for digital services in India */
export const GST_RATE = 0.18;

/**
 * All displayed prices are GST-inclusive. This helper extracts the base
 * price and GST amount for invoice generation.
 */
export function extractGST(priceInPaise: number): {
  baseInPaise: number;
  gstInPaise: number;
  totalInPaise: number;
  gstRate: number;
} {
  const base = Math.round(priceInPaise / (1 + GST_RATE));
  const gst = priceInPaise - base;
  return {
    baseInPaise: base,
    gstInPaise: gst,
    totalInPaise: priceInPaise,
    gstRate: GST_RATE,
  };
}

/** Format paise to INR display string (e.g., 49900 → "₹499") */
export function formatINR(paise: number): string {
  const rupees = paise / 100;
  if (rupees >= 1000) {
    return `₹${rupees.toLocaleString("en-IN")}`;
  }
  return `₹${rupees}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Free Tier Features
// ─────────────────────────────────────────────────────────────────────────────

const FREE_FEATURES: PlanFeature[] = [
  { id: "profiles", label: "5 profile views/day", labelHi: "5 प्रोफ़ाइल/दिन", included: true },
  { id: "chats", label: "2 new conversations/day", labelHi: "2 नई बातचीत/दिन", included: true },
  { id: "basic_filters", label: "Basic filters (age, city, religion)", labelHi: "बुनियादी फ़िल्टर (आयु, शहर, धर्म)", included: true },
  { id: "special_interest", label: "1 Special Interest/week", labelHi: "1 विशेष रुचि/सप्ताह", included: true },
  { id: "safety", label: "Safety features", labelHi: "सुरक्षा सुविधाएं", included: true },
  { id: "verification", label: "Identity verification", labelHi: "पहचान सत्यापन", included: true },
  { id: "unlimited_profiles", label: "Unlimited profiles", labelHi: "असीमित प्रोफ़ाइल", included: false },
  { id: "advanced_filters", label: "Advanced filters", labelHi: "उन्नत फ़िल्टर", included: false },
  { id: "family_pdf", label: "Family View PDF", labelHi: "परिवार दृश्य PDF", included: false },
  { id: "compatibility", label: "Compatibility insights", labelHi: "अनुकूलता अंतर्दृष्टि", included: false },
];

// ─────────────────────────────────────────────────────────────────────────────
// Premium Features
// ─────────────────────────────────────────────────────────────────────────────

const PREMIUM_FEATURES: PlanFeature[] = [
  { id: "unlimited_profiles", label: "Unlimited profile views", labelHi: "असीमित प्रोफ़ाइल दृश्य", included: true },
  { id: "unlimited_chats", label: "Unlimited conversations", labelHi: "असीमित बातचीत", included: true },
  {
    id: "advanced_filters",
    label: "Advanced filters (caste, income, education)",
    labelHi: "उन्नत फ़िल्टर (जाति, आय, शिक्षा)",
    included: true,
    description: "Filter by caste subgroup, gotra, income range, education level",
    descriptionHi: "जाति उपसमूह, गोत्र, आय सीमा, शिक्षा स्तर द्वारा फ़िल्टर करें",
  },
  { id: "family_pdf", label: "Family View PDF generator", labelHi: "परिवार दृश्य PDF जनरेटर", included: true },
  { id: "compatibility", label: "Compatibility insights", labelHi: "अनुकूलता अंतर्दृष्टि", included: true },
  { id: "priority", label: "Priority matching", labelHi: "प्राथमिकता मिलान", included: true },
  { id: "read_receipts", label: "Read receipts", labelHi: "पढ़ने की रसीदें", included: true },
  { id: "perfect_match", label: "3 Perfect Matches daily", labelHi: "3 दैनिक परफेक्ट मैच", included: true },
  { id: "special_interest", label: "Unlimited Special Interests", labelHi: "असीमित विशेष रुचियाँ", included: true },
  { id: "spotlight", label: "3 Spotlights/week", labelHi: "3 स्पॉटलाइट/सप्ताह", included: true },
  { id: "video_call", label: "Video calling", labelHi: "वीडियो कॉलिंग", included: true },
];

// ─────────────────────────────────────────────────────────────────────────────
// Family Features
// ─────────────────────────────────────────────────────────────────────────────

const FAMILY_FEATURES: PlanFeature[] = [
  { id: "profiles", label: "2 profiles (siblings)", labelHi: "2 प्रोफ़ाइल (भाई-बहन)", included: true },
  { id: "parent_dashboard", label: "Parent dashboard", labelHi: "माता-पिता डैशबोर्ड", included: true },
  { id: "shared_prefs", label: "Shared matching preferences", labelHi: "साझा मिलान प्राथमिकताएं", included: true },
  { id: "all_premium", label: "All Premium features included", labelHi: "सभी प्रीमियम सुविधाएं शामिल", included: true },
  { id: "family_pdf", label: "Family View PDF for both profiles", labelHi: "दोनों प्रोफ़ाइल के लिए परिवार PDF", included: true },
];

// ─────────────────────────────────────────────────────────────────────────────
// Plan Definitions
// ─────────────────────────────────────────────────────────────────────────────

export const PLANS: Record<PlanId, PricingPlan> = {
  free: {
    id: "free",
    name: "Free",
    nameHi: "मुफ्त",
    priceInPaise: 0,
    displayPrice: "₹0",
    cycle: null,
    periodLabel: "",
    periodLabelHi: "",
    savingsBadge: null,
    savingsBadgeHi: null,
    dailyCostDisplay: "Free forever",
    dailyCostDisplayHi: "हमेशा मुफ्त",
    hasFreeTrial: false,
    trialDays: 0,
    limits: {
      dailyProfileViews: 5,
      dailyConversations: 2,
      weeklySpecialInterests: 1,
      weeklyPremiumInterests: 0,
      weeklySpotlights: 0,
      advancedFilters: false,
      familyViewPdf: false,
      compatibilityInsights: false,
      priorityMatching: false,
      videoCalling: false,
      profileSlots: 1,
      parentDashboard: false,
      readReceipts: false,
      dailyPerfectMatches: 1,
    },
    features: FREE_FEATURES,
    badge: null,
    badgeHi: null,
  },

  premium_monthly: {
    id: "premium_monthly",
    name: "Premium",
    nameHi: "प्रीमियम",
    priceInPaise: 49900,
    displayPrice: "₹499",
    cycle: "monthly",
    periodLabel: "/month",
    periodLabelHi: "/माह",
    savingsBadge: null,
    savingsBadgeHi: null,
    dailyCostDisplay: "~₹17/day",
    dailyCostDisplayHi: "~₹17/दिन",
    hasFreeTrial: true,
    trialDays: 7,
    limits: {
      dailyProfileViews: -1,
      dailyConversations: -1,
      weeklySpecialInterests: -1,
      weeklyPremiumInterests: 3,
      weeklySpotlights: 3,
      advancedFilters: true,
      familyViewPdf: true,
      compatibilityInsights: true,
      priorityMatching: true,
      videoCalling: true,
      profileSlots: 1,
      parentDashboard: false,
      readReceipts: true,
      dailyPerfectMatches: 3,
    },
    features: PREMIUM_FEATURES,
    badge: null,
    badgeHi: null,
  },

  premium_yearly: {
    id: "premium_yearly",
    name: "Premium",
    nameHi: "प्रीमियम",
    priceInPaise: 299900,
    displayPrice: "₹2,999",
    cycle: "yearly",
    periodLabel: "/year",
    periodLabelHi: "/वर्ष",
    savingsBadge: "Save 40%",
    savingsBadgeHi: "40% बचाएं",
    dailyCostDisplay: "~₹8/day",
    dailyCostDisplayHi: "~₹8/दिन",
    hasFreeTrial: true,
    trialDays: 7,
    limits: {
      dailyProfileViews: -1,
      dailyConversations: -1,
      weeklySpecialInterests: -1,
      weeklyPremiumInterests: 5,
      weeklySpotlights: 5,
      advancedFilters: true,
      familyViewPdf: true,
      compatibilityInsights: true,
      priorityMatching: true,
      videoCalling: true,
      profileSlots: 1,
      parentDashboard: false,
      readReceipts: true,
      dailyPerfectMatches: 3,
    },
    features: PREMIUM_FEATURES,
    badge: "Most Popular",
    badgeHi: "सबसे लोकप्रिय",
  },

  family: {
    id: "family",
    name: "Family",
    nameHi: "परिवार",
    priceInPaise: 79900,
    displayPrice: "₹799",
    cycle: "monthly",
    periodLabel: "/month",
    periodLabelHi: "/माह",
    savingsBadge: "2 profiles",
    savingsBadgeHi: "2 प्रोफ़ाइल",
    dailyCostDisplay: "~₹13/profile/day",
    dailyCostDisplayHi: "~₹13/प्रोफ़ाइल/दिन",
    hasFreeTrial: true,
    trialDays: 7,
    limits: {
      dailyProfileViews: -1,
      dailyConversations: -1,
      weeklySpecialInterests: -1,
      weeklyPremiumInterests: 3,
      weeklySpotlights: 3,
      advancedFilters: true,
      familyViewPdf: true,
      compatibilityInsights: true,
      priorityMatching: true,
      videoCalling: true,
      profileSlots: 2,
      parentDashboard: true,
      readReceipts: true,
      dailyPerfectMatches: 3,
    },
    features: FAMILY_FEATURES,
    badge: "Best for Families",
    badgeHi: "परिवारों के लिए सर्वोत्तम",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Get a plan by ID */
export function getPlan(id: PlanId): PricingPlan {
  return PLANS[id];
}

/** Get all paid plans */
export function getPaidPlans(): PricingPlan[] {
  return [PLANS.premium_monthly, PLANS.premium_yearly, PLANS.family];
}

/** Get the limits for a user based on their plan */
export function getLimitsForPlan(planId: PlanId): PlanLimits {
  return PLANS[planId].limits;
}

/** Check if a specific feature is available for a plan */
export function isFeatureAvailable(planId: PlanId, featureId: string): boolean {
  const plan = PLANS[planId];
  return plan.features.some((f) => f.id === featureId && f.included);
}

/** Check if a limit is unlimited (-1 = unlimited) */
export function isUnlimited(limit: number): boolean {
  return limit === -1;
}

/** Get the upgrade recommendation based on what feature the user needs */
export function getUpgradeRecommendation(featureNeeded: string): PlanId {
  // Family plan recommended only for parent-dashboard / multi-profile needs
  if (featureNeeded === "parent_dashboard" || featureNeeded === "profiles") {
    return "family";
  }
  // Default recommendation: yearly (best value)
  return "premium_yearly";
}

/** Compare two plans — returns features gained by upgrading from → to */
export function getUpgradeGains(
  fromPlan: PlanId,
  toPlan: PlanId,
): PlanFeature[] {
  const from = PLANS[fromPlan];
  const to = PLANS[toPlan];
  const fromIds = new Set(
    from.features.filter((f) => f.included).map((f) => f.id),
  );
  return to.features.filter((f) => f.included && !fromIds.has(f.id));
}
