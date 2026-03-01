/**
 * Bandhan AI — Payments Module (barrel export)
 */
export {
  PLANS,
  GST_RATE,
  extractGST,
  formatINR,
  getPlan,
  getPaidPlans,
  getLimitsForPlan,
  isFeatureAvailable,
  isUnlimited,
  getUpgradeRecommendation,
  getUpgradeGains,
  type PlanId,
  type BillingCycle,
  type PaymentMethod,
  type PricingPlan,
  type PlanFeature,
  type PlanLimits,
} from "./pricing";

export {
  createPaymentOrder,
  openRazorpayCheckout,
  verifyPayment,
  generateUPILink,
  isUPIIntentSupported,
  isValidUPIVpa,
  getPaymentErrorMessage,
  loadRazorpayScript,
  MERCHANT_VPA,
  type PaymentStatus,
  type PaymentOrder,
  type PaymentResult,
  type PaymentReceipt,
} from "./payment-service";

export {
  createSubscription,
  cancelSubscription,
  checkSubscriptionStatus,
  renewSubscription,
  recordPremiumFeatureUsage,
  checkRefundEligibility,
  calculateProratedCredit,
  getSubscriptionSummary,
  createEmptySubscription,
  type SubscriptionStatus,
  type Subscription,
  type SubscriptionSummary,
} from "./subscription-service";
