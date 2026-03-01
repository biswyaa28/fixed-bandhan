/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Pricing A/B Experiments
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { Experiment } from "@/lib/experiments/experiment-service";

export const pricingExperiments: Experiment[] = [
  {
    id: "price_monthly",
    name: "Premium Monthly Price Point",
    description:
      "Find the revenue-maximising monthly price. Revenue = price × conversion rate. A higher price may convert fewer users but generate more total revenue.",
    hypothesis:
      "₹499 is the sweet spot — ₹399 has higher conversion but lower LTV, ₹599 prices out Tier 2/3 city users.",
    primaryMetric: "premium_converted",
    secondaryMetrics: ["checkout_started", "payment_failed", "day_30_retention_paid"],
    variants: [
      { id: "control", name: "₹499/month (current)", weight: 34, value: 499 },
      { id: "variant_a", name: "₹399/month (lower)", weight: 33, value: 399 },
      { id: "variant_b", name: "₹599/month (higher)", weight: 33, value: 599 },
    ],
    status: "running",
    startDate: "2026-02-15",
    endDate: null,
    minSamplePerVariant: 1000,
    owner: "revenue",
    tags: ["pricing", "premium"],
    audience: "free",
  },
  {
    id: "price_annual_discount",
    name: "Annual Plan Discount Level",
    description:
      "Test different annual discount levels to maximise annual plan uptake (higher LTV, lower churn).",
    hypothesis:
      "45% annual discount converts 20% more users to annual vs 40% discount, without cannibalising monthly revenue.",
    primaryMetric: "annual_plan_selected",
    secondaryMetrics: ["premium_converted", "checkout_started"],
    variants: [
      { id: "control", name: "40% off (₹2,999/yr)", weight: 50, value: { discount: 40, price: 2999 } },
      { id: "variant_a", name: "45% off (₹2,699/yr)", weight: 50, value: { discount: 45, price: 2699 } },
    ],
    status: "draft",
    startDate: "2026-03-10",
    endDate: null,
    minSamplePerVariant: 500,
    owner: "revenue",
    tags: ["pricing", "annual"],
    audience: "free",
  },
  {
    id: "price_trial_length",
    name: "Free Trial Length",
    description:
      "Test 3-day vs 7-day vs 14-day free trial. Shorter trials create urgency; longer trials build habit.",
    hypothesis:
      "7-day trial has the best trial-to-paid conversion because users need a full week to experience matches.",
    primaryMetric: "trial_to_paid_conversion",
    secondaryMetrics: ["trial_started", "trial_cancelled", "day_7_engagement"],
    variants: [
      { id: "control", name: "7-day trial (current)", weight: 34, value: 7 },
      { id: "variant_a", name: "3-day trial (urgency)", weight: 33, value: 3 },
      { id: "variant_b", name: "14-day trial (habit)", weight: 33, value: 14 },
    ],
    status: "draft",
    startDate: "2026-03-15",
    endDate: null,
    minSamplePerVariant: 800,
    owner: "revenue",
    tags: ["pricing", "trial"],
    audience: "free",
  },
  {
    id: "price_upsell_timing",
    name: "Upsell Modal Trigger Timing",
    description:
      "Test when to show the first upsell modal — after hitting the daily limit vs after first match vs after 3 days.",
    hypothesis:
      "Showing the upsell after first match (emotional high) converts 25% better than after hitting daily limit (frustration).",
    primaryMetric: "premium_converted",
    secondaryMetrics: ["upsell_modal_dismissed", "upsell_modal_shown", "remind_me_tomorrow"],
    variants: [
      { id: "control", name: "After daily limit hit", weight: 34, value: "limit_hit" },
      { id: "variant_a", name: "After first match", weight: 33, value: "first_match" },
      { id: "variant_b", name: "After 3 days of usage", weight: 33, value: "day_3" },
    ],
    status: "running",
    startDate: "2026-02-22",
    endDate: null,
    minSamplePerVariant: 1000,
    owner: "growth",
    tags: ["pricing", "upsell", "timing"],
    audience: "free",
  },
];
