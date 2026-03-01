/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Feature Flag System
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Simple boolean feature flags that sit on top of the experiment engine.
 *
 * A feature flag is just a two-variant experiment:
 *   - "control" (off) + "enabled" (on) with configurable traffic split.
 *
 * Use for:
 *   • Gradual rollouts (5% → 25% → 50% → 100%)
 *   • Kill switches (set to 0% to disable instantly)
 *   • User-segment gates (premium-only, new-users-only)
 *   • Ops toggles (maintenance mode, degraded experience)
 *
 * Usage:
 *   if (isFeatureEnabled("video_calls", userId)) {
 *     return <VideoCallButton />;
 *   }
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  registerExperiments,
  getVariant,
  trackExposure,
  type Experiment,
} from "./experiment-service";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  /** 0–100 percentage of users who see this feature */
  rolloutPercent: number;
  /** Optional audience restriction */
  audience: "all" | "free" | "premium" | "new_users" | "returning";
  /** Is this flag active at all? */
  enabled: boolean;
  /** When this flag was last updated */
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Flag Definitions
// ─────────────────────────────────────────────────────────────────────────────

const FLAGS: FeatureFlag[] = [
  {
    id: "video_calls",
    name: "Safe Video Calls",
    description: "In-app video calling without sharing phone numbers",
    rolloutPercent: 0,
    audience: "all",
    enabled: false,
    updatedAt: "2026-02-28",
  },
  {
    id: "voice_prompts",
    name: "Voice Profile Prompts",
    description: "Record 15-second audio answers to profile prompts",
    rolloutPercent: 25,
    audience: "all",
    enabled: true,
    updatedAt: "2026-02-28",
  },
  {
    id: "ai_icebreakers",
    name: "AI-Powered Icebreakers",
    description: "Contextual conversation starters generated from shared interests",
    rolloutPercent: 10,
    audience: "all",
    enabled: true,
    updatedAt: "2026-02-28",
  },
  {
    id: "premium_spotlight",
    name: "Spotlight Feature",
    description: "Boost your profile visibility for 2 hours",
    rolloutPercent: 100,
    audience: "premium",
    enabled: true,
    updatedAt: "2026-02-28",
  },
  {
    id: "family_view_pdf",
    name: "Family View PDF",
    description: "Generate a printable profile summary for parents",
    rolloutPercent: 50,
    audience: "all",
    enabled: true,
    updatedAt: "2026-02-28",
  },
  {
    id: "dark_mode",
    name: "Dark Mode",
    description: "Alternative dark color scheme",
    rolloutPercent: 0,
    audience: "all",
    enabled: false,
    updatedAt: "2026-02-28",
  },
  {
    id: "success_stories_feed",
    name: "Success Stories in Feed",
    description: "Show success story cards between discovery profiles",
    rolloutPercent: 100,
    audience: "all",
    enabled: true,
    updatedAt: "2026-02-28",
  },
  {
    id: "respectful_initiation",
    name: "Respectful Initiation Mode",
    description: "Option for women to message first with 48h time limit",
    rolloutPercent: 100,
    audience: "all",
    enabled: true,
    updatedAt: "2026-02-28",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Convert flags to experiments for the engine
// ─────────────────────────────────────────────────────────────────────────────

function flagToExperiment(flag: FeatureFlag): Experiment {
  return {
    id: `ff_${flag.id}`,
    name: `[Flag] ${flag.name}`,
    description: flag.description,
    hypothesis: `Rolling out ${flag.name} to ${flag.rolloutPercent}% of ${flag.audience} users`,
    primaryMetric: "feature_engagement",
    secondaryMetrics: [],
    variants: [
      { id: "control", name: "Off", weight: 100 - flag.rolloutPercent, value: false },
      { id: "enabled", name: "On", weight: flag.rolloutPercent, value: true },
    ],
    status: flag.enabled ? "running" : "paused",
    startDate: flag.updatedAt,
    endDate: null,
    minSamplePerVariant: 100,
    owner: "product",
    tags: ["feature-flag"],
    audience: flag.audience,
  };
}

/**
 * Initialize all feature flags into the experiment registry.
 * Call once at app startup.
 */
export function initFeatureFlags(): void {
  const experiments = FLAGS.map(flagToExperiment);
  registerExperiments(experiments);
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check whether a feature flag is enabled for a specific user.
 *
 * @param flagId - The feature flag ID (e.g. "video_calls")
 * @param userId - The current user's ID
 * @returns boolean — true if the user is in the "enabled" group
 */
export function isFeatureEnabled(flagId: string, userId: string): boolean {
  const flag = FLAGS.find((f) => f.id === flagId);
  if (!flag || !flag.enabled) return false;
  if (flag.rolloutPercent >= 100) return true;
  if (flag.rolloutPercent <= 0) return false;

  const experimentId = `ff_${flagId}`;
  const variant = getVariant(experimentId, userId);
  return variant === "enabled";
}

/**
 * Check and track exposure in one call.
 * Use when you render UI based on a flag.
 */
export function useFeatureFlag(flagId: string, userId: string): boolean {
  const enabled = isFeatureEnabled(flagId, userId);
  if (enabled) {
    trackExposure(`ff_${flagId}`, userId);
  }
  return enabled;
}

/**
 * Get all feature flags and their current state for a user.
 */
export function getUserFlags(userId: string): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  for (const flag of FLAGS) {
    result[flag.id] = isFeatureEnabled(flag.id, userId);
  }
  return result;
}

/**
 * Get the raw flag definitions (for admin dashboard).
 */
export function getAllFlags(): FeatureFlag[] {
  return [...FLAGS];
}
