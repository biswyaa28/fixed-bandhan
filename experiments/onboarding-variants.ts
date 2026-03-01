/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Onboarding A/B Experiments
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { Experiment } from "@/lib/experiments/experiment-service";

export const onboardingExperiments: Experiment[] = [
  {
    id: "onb_flow_order",
    name: "Onboarding: Intent-first vs Details-first",
    description:
      "Test whether starting with a simple intent question (1 tap) builds more momentum than starting with life details (multiple fields).",
    hypothesis:
      "Intent-first produces 10%+ higher completion because a single easy choice creates commitment (foot-in-the-door effect).",
    primaryMetric: "onboarding_published",
    secondaryMetrics: ["profile_completion_percent", "time_to_complete_sec", "day_7_retention"],
    variants: [
      { id: "control", name: "Intent → Details → Values → Photos → Review", weight: 50, value: "intent_first" },
      { id: "variant_a", name: "Details → Values → Intent → Photos → Review", weight: 50, value: "details_first" },
    ],
    status: "completed",
    startDate: "2026-01-15",
    endDate: "2026-02-01",
    minSamplePerVariant: 500,
    owner: "product",
    tags: ["onboarding", "flow"],
    audience: "all",
  },
  {
    id: "onb_photo_requirement",
    name: "Onboarding: Required vs Optional Photo",
    description:
      "Test whether requiring at least one photo reduces drop-off or improves match quality enough to offset the friction.",
    hypothesis:
      "Optional photo with nudge has the best balance — slightly lower completion but significantly higher match rate.",
    primaryMetric: "onboarding_published",
    secondaryMetrics: ["match_rate_d7", "photo_upload_rate", "profile_completion_percent"],
    variants: [
      { id: "control", name: "Photo required (1 minimum)", weight: 33, value: "required" },
      { id: "variant_a", name: "Photo optional (skip button)", weight: 34, value: "optional" },
      { id: "variant_b", name: "Optional + 3× likes nudge", weight: 33, value: "optional_nudge" },
    ],
    status: "completed",
    startDate: "2026-02-03",
    endDate: "2026-02-17",
    minSamplePerVariant: 500,
    owner: "product",
    tags: ["onboarding", "photos"],
    audience: "all",
  },
  {
    id: "onb_incentive_copy",
    name: "Onboarding: Completion Incentive Messaging",
    description:
      "Test which incentive message best motivates users to reach 100% profile completion.",
    hypothesis:
      "Concrete reward ('5 bonus likes') outperforms vague promise ('better matches') by 15%+.",
    primaryMetric: "profile_100_percent",
    secondaryMetrics: ["onboarding_published", "time_to_complete_sec"],
    variants: [
      { id: "control", name: "No incentive", weight: 25, value: null },
      { id: "variant_a", name: "Complete for better matches", weight: 25, value: "better_matches" },
      { id: "variant_b", name: "5 bonus likes at 100%", weight: 25, value: "bonus_likes" },
      { id: "variant_c", name: "Unlock premium features", weight: 25, value: "premium_unlock" },
    ],
    status: "running",
    startDate: "2026-02-20",
    endDate: null,
    minSamplePerVariant: 1000,
    owner: "growth",
    tags: ["onboarding", "copy", "incentive"],
    audience: "all",
  },
  {
    id: "onb_bio_prompts",
    name: "Onboarding: Bio Prompt Style",
    description:
      "Test whether showing clickable prompt starters in the bio field increases bio completion rate.",
    hypothesis:
      "Clickable prompts reduce blank-page anxiety and increase bio fill rate by 20%+.",
    primaryMetric: "bio_filled",
    secondaryMetrics: ["bio_length_avg", "match_rate_d7"],
    variants: [
      { id: "control", name: "Empty textarea + placeholder", weight: 50, value: "placeholder_only" },
      { id: "variant_a", name: "Clickable prompt chips above textarea", weight: 50, value: "prompt_chips" },
    ],
    status: "running",
    startDate: "2026-02-25",
    endDate: null,
    minSamplePerVariant: 800,
    owner: "product",
    tags: ["onboarding", "bio", "ux"],
    audience: "all",
  },
];
