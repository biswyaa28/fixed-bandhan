/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Subscription Service (Lifecycle Management)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Manages subscription state from trial → active → renewal → cancellation.
 *
 * LIFECYCLE:
 *   free → trial(7d) → active → renewed → ... → cancelled → expired → free
 *
 * FEATURES:
 *   • 7-day free trial on first subscription (per account, not per plan)
 *   • Auto-renewal via Razorpay Subscriptions API
 *   • Grace period: 3 days after failed renewal before downgrade
 *   • Prorated upgrades (monthly → yearly credit remaining days)
 *   • Easy cancellation (immediate effect at period end, no hoops)
 *   • Refund eligibility: 48h after purchase if no premium features used
 *
 * STORAGE:
 *   Firestore: users/{uid}/subscription/{subscriptionId}
 *   Also denormalised on user document: isPremium, premiumExpiresAt
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { type PlanId, type BillingCycle, PLANS, formatINR } from "./pricing";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type SubscriptionStatus =
  | "none"            // Never subscribed
  | "trialing"        // In 7-day free trial
  | "active"          // Paid and active
  | "past_due"        // Renewal failed, in 3-day grace period
  | "cancelled"       // User cancelled, active until period end
  | "expired"         // Period ended, downgraded to free
  | "paused";         // Temporarily paused (future feature)

export interface Subscription {
  /** Firestore document ID */
  id: string;
  /** User UID */
  userId: string;
  /** Current plan */
  planId: PlanId;
  /** Billing cycle */
  cycle: BillingCycle;
  /** Current status */
  status: SubscriptionStatus;
  /** When subscription started (trial or paid) */
  startedAt: string;
  /** When current period started */
  currentPeriodStart: string;
  /** When current period ends */
  currentPeriodEnd: string;
  /** When trial ends (null if no trial) */
  trialEndsAt: string | null;
  /** Whether user has used their one-time trial */
  trialUsed: boolean;
  /** Razorpay Subscription ID (for auto-renewal) */
  razorpaySubscriptionId: string | null;
  /** Last payment date */
  lastPaymentAt: string | null;
  /** Last payment amount in paise */
  lastPaymentAmountInPaise: number | null;
  /** Next billing date (null if cancelled) */
  nextBillingAt: string | null;
  /** When user cancelled (null if active) */
  cancelledAt: string | null;
  /** Reason for cancellation */
  cancellationReason: string | null;
  /** Number of renewals completed */
  renewalCount: number;
  /** Whether refund is still eligible (within 48h, no premium features used) */
  refundEligible: boolean;
  /** Count of premium features used (to determine refund eligibility) */
  premiumFeaturesUsed: number;
  /** Timestamps */
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionSummary {
  /** User-facing status label */
  statusLabel: string;
  statusLabelHi: string;
  /** Plan display name */
  planName: string;
  planNameHi: string;
  /** Price display */
  priceDisplay: string;
  /** Days remaining in current period */
  daysRemaining: number;
  /** Whether user is in trial */
  isTrialing: boolean;
  /** Whether user is active (trial or paid) */
  isActive: boolean;
  /** Whether cancellation is pending */
  isCancelling: boolean;
  /** Whether refund is possible */
  canRefund: boolean;
  /** Next billing date (formatted) */
  nextBillingDisplay: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const TRIAL_DAYS = 7;
const GRACE_PERIOD_DAYS = 3;
const REFUND_WINDOW_HOURS = 48;

// ─────────────────────────────────────────────────────────────────────────────
// Subscription Creation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a new subscription after successful payment.
 *
 * If the user is eligible for a trial, starts with trial status.
 * Otherwise, starts as active immediately.
 */
export function createSubscription(
  userId: string,
  planId: PlanId,
  cycle: BillingCycle,
  hasUsedTrialBefore: boolean,
  razorpaySubscriptionId?: string,
): Subscription {
  const plan = PLANS[planId];
  const now = new Date();
  const id = `sub_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

  // Calculate period end based on cycle
  const periodEnd = new Date(now);
  if (cycle === "yearly") {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  } else {
    periodEnd.setDate(periodEnd.getDate() + 30);
  }

  // Trial: only if plan supports it AND user hasn't used trial before
  const eligibleForTrial = plan.hasFreeTrial && !hasUsedTrialBefore;
  let trialEnd: string | null = null;
  let status: SubscriptionStatus = "active";

  if (eligibleForTrial) {
    const trialEndDate = new Date(now);
    trialEndDate.setDate(trialEndDate.getDate() + TRIAL_DAYS);
    trialEnd = trialEndDate.toISOString();
    status = "trialing";
  }

  return {
    id,
    userId,
    planId,
    cycle,
    status,
    startedAt: now.toISOString(),
    currentPeriodStart: now.toISOString(),
    currentPeriodEnd: periodEnd.toISOString(),
    trialEndsAt: trialEnd,
    trialUsed: true, // Mark as used even if not eligible (prevents future attempts)
    razorpaySubscriptionId: razorpaySubscriptionId || null,
    lastPaymentAt: eligibleForTrial ? null : now.toISOString(),
    lastPaymentAmountInPaise: eligibleForTrial ? null : plan.priceInPaise,
    nextBillingAt: eligibleForTrial ? trialEnd : periodEnd.toISOString(),
    cancelledAt: null,
    cancellationReason: null,
    renewalCount: 0,
    refundEligible: !eligibleForTrial, // Trial has no payment to refund
    premiumFeaturesUsed: 0,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Subscription Operations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Cancel a subscription.
 * The subscription remains active until the current period ends.
 * No partial refunds after the refund window.
 */
export function cancelSubscription(
  sub: Subscription,
  reason: string,
): Subscription {
  return {
    ...sub,
    status: "cancelled",
    cancelledAt: new Date().toISOString(),
    cancellationReason: reason,
    nextBillingAt: null,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Check and handle a subscription that may have expired or needs renewal.
 * Call this on app load / periodically.
 */
export function checkSubscriptionStatus(sub: Subscription): Subscription {
  const now = new Date();
  const periodEnd = new Date(sub.currentPeriodEnd);

  // Trial ended → if payment not made, expire
  if (sub.status === "trialing" && sub.trialEndsAt) {
    const trialEnd = new Date(sub.trialEndsAt);
    if (now >= trialEnd) {
      // Trial expired — check if auto-payment succeeded
      if (!sub.lastPaymentAt) {
        return { ...sub, status: "expired", updatedAt: now.toISOString() };
      }
      // Payment exists — transition to active
      return { ...sub, status: "active", updatedAt: now.toISOString() };
    }
  }

  // Active or cancelled → check period end
  if (sub.status === "active" || sub.status === "cancelled") {
    if (now >= periodEnd) {
      if (sub.status === "cancelled") {
        return { ...sub, status: "expired", updatedAt: now.toISOString() };
      }
      // Active but period ended → past_due (grace period)
      const graceEnd = new Date(periodEnd);
      graceEnd.setDate(graceEnd.getDate() + GRACE_PERIOD_DAYS);
      if (now >= graceEnd) {
        return { ...sub, status: "expired", updatedAt: now.toISOString() };
      }
      return { ...sub, status: "past_due", updatedAt: now.toISOString() };
    }
  }

  // Past due → check grace period
  if (sub.status === "past_due") {
    const graceEnd = new Date(periodEnd);
    graceEnd.setDate(graceEnd.getDate() + GRACE_PERIOD_DAYS);
    if (now >= graceEnd) {
      return { ...sub, status: "expired", updatedAt: now.toISOString() };
    }
  }

  return sub;
}

/**
 * Renew a subscription after successful payment.
 */
export function renewSubscription(sub: Subscription): Subscription {
  const plan = PLANS[sub.planId];
  const now = new Date();
  const newPeriodEnd = new Date(now);

  if (sub.cycle === "yearly") {
    newPeriodEnd.setFullYear(newPeriodEnd.getFullYear() + 1);
  } else {
    newPeriodEnd.setDate(newPeriodEnd.getDate() + 30);
  }

  return {
    ...sub,
    status: "active",
    currentPeriodStart: now.toISOString(),
    currentPeriodEnd: newPeriodEnd.toISOString(),
    lastPaymentAt: now.toISOString(),
    lastPaymentAmountInPaise: plan.priceInPaise,
    nextBillingAt: newPeriodEnd.toISOString(),
    renewalCount: sub.renewalCount + 1,
    refundEligible: true,
    premiumFeaturesUsed: 0,
    updatedAt: now.toISOString(),
  };
}

/**
 * Record usage of a premium feature (for refund eligibility tracking).
 */
export function recordPremiumFeatureUsage(sub: Subscription): Subscription {
  const updated = { ...sub, premiumFeaturesUsed: sub.premiumFeaturesUsed + 1, updatedAt: new Date().toISOString() };
  // Once any premium feature is used, refund eligibility is lost
  if (updated.premiumFeaturesUsed > 0) {
    updated.refundEligible = false;
  }
  return updated;
}

// ─────────────────────────────────────────────────────────────────────────────
// Refund Eligibility
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check if a subscription is eligible for a refund.
 *
 * Rules:
 *   1. Within 48 hours of purchase
 *   2. No premium features used (profiles viewed, filters applied, etc.)
 *   3. Not a trial subscription (no payment was made)
 *   4. Not already cancelled/expired
 */
export function checkRefundEligibility(sub: Subscription): {
  eligible: boolean;
  reason: string;
  reasonHi: string;
} {
  if (sub.status === "trialing") {
    return {
      eligible: false,
      reason: "You are on a free trial — no payment to refund.",
      reasonHi: "आप फ्री ट्रायल पर हैं — वापस करने के लिए कोई भुगतान नहीं।",
    };
  }

  if (sub.status === "expired" || sub.status === "none") {
    return {
      eligible: false,
      reason: "No active subscription to refund.",
      reasonHi: "वापसी के लिए कोई सक्रिय सदस्यता नहीं।",
    };
  }

  if (!sub.lastPaymentAt) {
    return {
      eligible: false,
      reason: "No payment found for this subscription.",
      reasonHi: "इस सदस्यता के लिए कोई भुगतान नहीं मिला।",
    };
  }

  // Check 48-hour window
  const paymentTime = new Date(sub.lastPaymentAt).getTime();
  const hoursSincePayment = (Date.now() - paymentTime) / (1000 * 60 * 60);
  if (hoursSincePayment > REFUND_WINDOW_HOURS) {
    return {
      eligible: false,
      reason: `Refund window (${REFUND_WINDOW_HOURS} hours) has expired.`,
      reasonHi: `वापसी विंडो (${REFUND_WINDOW_HOURS} घंटे) समाप्त हो गई है।`,
    };
  }

  // Check feature usage
  if (sub.premiumFeaturesUsed > 0) {
    return {
      eligible: false,
      reason: "Refund not available after using premium features.",
      reasonHi: "प्रीमियम सुविधाओं का उपयोग करने के बाद वापसी उपलब्ध नहीं है।",
    };
  }

  const refundAmount = formatINR(sub.lastPaymentAmountInPaise || 0);
  return {
    eligible: true,
    reason: `Full refund of ${refundAmount} will be processed within 5-7 business days.`,
    reasonHi: `${refundAmount} की पूर्ण वापसी 5-7 कार्य दिवसों में प्रसंस्कृत की जाएगी।`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Upgrade/Downgrade
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculate prorated credit when upgrading from monthly to yearly.
 * Returns the amount in paise that should be credited.
 */
export function calculateProratedCredit(sub: Subscription): number {
  if (sub.cycle !== "monthly" || !sub.lastPaymentAmountInPaise) return 0;

  const periodStart = new Date(sub.currentPeriodStart).getTime();
  const periodEnd = new Date(sub.currentPeriodEnd).getTime();
  const now = Date.now();

  const totalDays = (periodEnd - periodStart) / (1000 * 60 * 60 * 24);
  const usedDays = (now - periodStart) / (1000 * 60 * 60 * 24);
  const remainingRatio = Math.max(0, (totalDays - usedDays) / totalDays);

  return Math.round(sub.lastPaymentAmountInPaise * remainingRatio);
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary for UI
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a user-friendly subscription summary for display.
 */
export function getSubscriptionSummary(
  sub: Subscription | null,
  language: "en" | "hi" = "en",
): SubscriptionSummary {
  const isHi = language === "hi";

  if (!sub || sub.status === "none" || sub.status === "expired") {
    return {
      statusLabel: isHi ? "मुफ्त योजना" : "Free Plan",
      statusLabelHi: "मुफ्त योजना",
      planName: isHi ? "मुफ्त" : "Free",
      planNameHi: "मुफ्त",
      priceDisplay: "₹0",
      daysRemaining: 0,
      isTrialing: false,
      isActive: false,
      isCancelling: false,
      canRefund: false,
      nextBillingDisplay: null,
    };
  }

  const plan = PLANS[sub.planId];
  const periodEnd = new Date(sub.currentPeriodEnd);
  const daysRemaining = Math.max(
    0,
    Math.ceil((periodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  );

  const statusLabels: Record<SubscriptionStatus, { en: string; hi: string }> = {
    none: { en: "Free Plan", hi: "मुफ्त योजना" },
    trialing: { en: "Free Trial", hi: "फ्री ट्रायल" },
    active: { en: "Active", hi: "सक्रिय" },
    past_due: { en: "Payment Due", hi: "भुगतान बकाया" },
    cancelled: { en: "Cancelling", hi: "रद्द हो रहा है" },
    expired: { en: "Expired", hi: "समाप्त" },
    paused: { en: "Paused", hi: "रुका हुआ" },
  };

  const refundCheck = checkRefundEligibility(sub);

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString(isHi ? "hi-IN" : "en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  };

  return {
    statusLabel: isHi ? statusLabels[sub.status].hi : statusLabels[sub.status].en,
    statusLabelHi: statusLabels[sub.status].hi,
    planName: isHi ? plan.nameHi : plan.name,
    planNameHi: plan.nameHi,
    priceDisplay: plan.displayPrice,
    daysRemaining,
    isTrialing: sub.status === "trialing",
    isActive: sub.status === "active" || sub.status === "trialing",
    isCancelling: sub.status === "cancelled",
    canRefund: refundCheck.eligible,
    nextBillingDisplay: sub.nextBillingAt ? formatDate(sub.nextBillingAt) : null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Default (empty) subscription
// ─────────────────────────────────────────────────────────────────────────────

export function createEmptySubscription(userId: string): Subscription {
  return {
    id: "",
    userId,
    planId: "free",
    cycle: "monthly",
    status: "none",
    startedAt: "",
    currentPeriodStart: "",
    currentPeriodEnd: "",
    trialEndsAt: null,
    trialUsed: false,
    razorpaySubscriptionId: null,
    lastPaymentAt: null,
    lastPaymentAmountInPaise: null,
    nextBillingAt: null,
    cancelledAt: null,
    cancellationReason: null,
    renewalCount: 0,
    refundEligible: false,
    premiumFeaturesUsed: 0,
    createdAt: "",
    updatedAt: "",
  };
}
