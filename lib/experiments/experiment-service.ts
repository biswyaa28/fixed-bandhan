/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — A/B Experiment Service
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Core engine for running, assigning, and evaluating experiments.
 *
 * Architecture:
 *
 *   ┌──────────────┐   ┌──────────────────┐   ┌──────────────────┐
 *   │  Experiment   │──▶│  Assignment      │──▶│  Analytics        │
 *   │  Definitions  │   │  (deterministic  │   │  (trackEvent +    │
 *   │  (static TS)  │   │   hash per user) │   │   localStorage)   │
 *   └──────────────┘   └──────────────────┘   └──────────────────┘
 *
 * Key design decisions:
 *   1. Deterministic assignment — same user always sees same variant
 *      (hashed from userId + experimentId, no randomness)
 *   2. Client-side only — no server round-trip, instant rendering
 *   3. localStorage cache — assignment persists across sessions
 *   4. Exposure tracking — variant only tracked when actually rendered
 *   5. Privacy-first — zero PII in experiment data
 *   6. Statistical rigour — built-in significance calculator
 *
 * Usage:
 *   const variant = getVariant("pricing_test_v2", userId);
 *   // variant === "control" | "variant_a" | "variant_b"
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { trackABTestExposure, trackEvent } from "@/lib/analytics";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ExperimentStatus = "draft" | "running" | "paused" | "completed" | "archived";

export interface ExperimentVariant {
  id: string;
  name: string;
  /** 0–100 traffic allocation; all variants in an experiment must sum to 100 */
  weight: number;
  /** The value this variant injects (could be anything: string, number, object) */
  value: unknown;
}

export interface Experiment {
  id: string;
  name: string;
  description: string;
  hypothesis: string;
  /** What event counts as a "conversion" for this experiment */
  primaryMetric: string;
  secondaryMetrics: string[];
  variants: ExperimentVariant[];
  status: ExperimentStatus;
  /** ISO date strings */
  startDate: string;
  endDate: string | null;
  /** Minimum sample per variant before results are meaningful */
  minSamplePerVariant: number;
  /** Who created this experiment */
  owner: string;
  /** Tags for filtering */
  tags: string[];
  /** Target audience filter (e.g. "free_users", "all", "new_users") */
  audience: string;
}

export interface ExperimentAssignment {
  experimentId: string;
  variantId: string;
  assignedAt: string;
  exposed: boolean;
}

export interface ExperimentResult {
  experimentId: string;
  variantId: string;
  sampleSize: number;
  conversions: number;
  conversionRate: number;
}

export interface SignificanceResult {
  isSignificant: boolean;
  confidence: number;
  /** Relative lift of treatment over control */
  lift: number;
  pValue: number;
  winner: string | null;
  recommendation: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const ASSIGNMENTS_KEY = "bandhan_ab_assignments";
const EXPOSURES_KEY = "bandhan_ab_exposures";
const MIN_CONFIDENCE = 0.95;
const MIN_SAMPLE = 30; // Absolute minimum before any calculation

// ─────────────────────────────────────────────────────────────────────────────
// Experiment Registry (import experiment definitions here)
// ─────────────────────────────────────────────────────────────────────────────

let _experiments: Map<string, Experiment> = new Map();

/**
 * Register experiments into the runtime registry.
 * Call once at app init (e.g. from PerfInit or layout).
 */
export function registerExperiments(experiments: Experiment[]): void {
  experiments.forEach((exp) => _experiments.set(exp.id, exp));
}

export function getExperiment(id: string): Experiment | undefined {
  return _experiments.get(id);
}

export function getAllExperiments(): Experiment[] {
  return Array.from(_experiments.values());
}

export function getRunningExperiments(): Experiment[] {
  const now = new Date().toISOString();
  return getAllExperiments().filter(
    (e) => e.status === "running" && e.startDate <= now && (!e.endDate || e.endDate > now),
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Deterministic Assignment
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Simple deterministic hash: FNV-1a 32-bit.
 * Always produces the same number for the same input string.
 */
function fnv1aHash(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash;
}

/**
 * Assign a user to a variant deterministically.
 *
 * The assignment is:
 *   1. Computed from hash(userId + experimentId) → bucket 0–99
 *   2. Mapped to a variant based on cumulative weights
 *   3. Cached in localStorage so it never changes
 *
 * Returns the variant ID (e.g. "control", "variant_a").
 */
function assignVariant(experiment: Experiment, userId: string): string {
  const bucket = fnv1aHash(`${userId}::${experiment.id}`) % 100;
  let cumulative = 0;
  for (const variant of experiment.variants) {
    cumulative += variant.weight;
    if (bucket < cumulative) return variant.id;
  }
  // Fallback to last variant (rounding edge case)
  return experiment.variants[experiment.variants.length - 1].id;
}

// ─────────────────────────────────────────────────────────────────────────────
// Assignment Storage
// ─────────────────────────────────────────────────────────────────────────────

function loadAssignments(): Record<string, ExperimentAssignment> {
  if (typeof localStorage === "undefined") return {};
  try {
    const raw = localStorage.getItem(ASSIGNMENTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAssignments(assignments: Record<string, ExperimentAssignment>): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments));
  } catch { /* storage full */ }
}

function loadExposures(): Set<string> {
  if (typeof localStorage === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(EXPOSURES_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveExposure(key: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    const set = loadExposures();
    set.add(key);
    localStorage.setItem(EXPOSURES_KEY, JSON.stringify([...set]));
  } catch { /* silent */ }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get the assigned variant for a user in an experiment.
 *
 * If the experiment isn't running, returns "control".
 * If the user hasn't been assigned yet, assigns deterministically.
 *
 * Does NOT track exposure — call `trackExposure()` when the variant is
 * actually rendered (prevents counting users who never see the UI).
 */
export function getVariant(experimentId: string, userId: string): string {
  const experiment = _experiments.get(experimentId);
  if (!experiment || experiment.status !== "running") return "control";

  // Check audience filter
  // (In production, this would check user properties; simplified here)

  const assignments = loadAssignments();
  const cached = assignments[experimentId];
  if (cached) return cached.variantId;

  // New assignment
  const variantId = assignVariant(experiment, userId);
  assignments[experimentId] = {
    experimentId,
    variantId,
    assignedAt: new Date().toISOString(),
    exposed: false,
  };
  saveAssignments(assignments);

  return variantId;
}

/**
 * Get the variant's actual value (the payload injected into UI).
 *
 * Example:
 *   const price = getVariantValue<number>("pricing_test_v2", userId, 499);
 *   // Returns 499 (control), 599 (variant_a), or 399 (variant_b)
 */
export function getVariantValue<T>(experimentId: string, userId: string, fallback: T): T {
  const variantId = getVariant(experimentId, userId);
  const experiment = _experiments.get(experimentId);
  if (!experiment) return fallback;

  const variant = experiment.variants.find((v) => v.id === variantId);
  return variant ? (variant.value as T) : fallback;
}

/**
 * Track that a user was actually exposed to a variant (saw it on screen).
 *
 * Call this from the UI component rendering the variant, not at assignment
 * time. This prevents inflating the sample with users who were assigned
 * but never opened the relevant screen.
 */
export function trackExposure(experimentId: string, userId: string): void {
  const variantId = getVariant(experimentId, userId);
  const key = `${experimentId}::${variantId}`;

  // Only track once per session
  const exposures = loadExposures();
  if (exposures.has(key)) return;

  saveExposure(key);

  // Mark assignment as exposed
  const assignments = loadAssignments();
  if (assignments[experimentId]) {
    assignments[experimentId].exposed = true;
    saveAssignments(assignments);
  }

  // Fire analytics event
  trackABTestExposure(experimentId, variantId);
}

/**
 * Track a conversion event for an experiment.
 *
 * Call when the user completes the primary action being tested
 * (e.g. "premium_converted", "profile_completed", "message_sent").
 */
export function trackConversion(
  experimentId: string,
  userId: string,
  metricName: string,
  value?: number,
): void {
  const variantId = getVariant(experimentId, userId);
  trackEvent("ab_test_conversion", {
    test_id: experimentId,
    variant: variantId,
    metric: metricName,
    value: value ?? 1,
  });
}

/**
 * Get all assignments for the current user (for debugging / data export).
 */
export function getUserAssignments(): Record<string, ExperimentAssignment> {
  return loadAssignments();
}

/**
 * Force-override a variant (for QA / debugging only).
 */
export function overrideVariant(experimentId: string, variantId: string): void {
  const assignments = loadAssignments();
  assignments[experimentId] = {
    experimentId,
    variantId,
    assignedAt: new Date().toISOString(),
    exposed: false,
  };
  saveAssignments(assignments);
}

/**
 * Clear all experiment assignments (for testing).
 */
export function clearAssignments(): void {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(ASSIGNMENTS_KEY);
  localStorage.removeItem(EXPOSURES_KEY);
}

// ─────────────────────────────────────────────────────────────────────────────
// Statistical Significance (two-proportion z-test)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Standard normal CDF approximation (Abramowitz & Stegun 26.2.17).
 */
function normalCDF(z: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.sqrt(2);
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return 0.5 * (1.0 + sign * y);
}

/**
 * Evaluate statistical significance between two variants.
 *
 * Uses a two-proportion z-test:
 *   H₀: p_control = p_treatment
 *   H₁: p_control ≠ p_treatment (two-sided)
 *
 * @param control  - { sampleSize, conversions } for control group
 * @param treatment - { sampleSize, conversions } for treatment group
 * @returns SignificanceResult with confidence, lift, and recommendation
 */
export function evaluateSignificance(
  control: ExperimentResult,
  treatment: ExperimentResult,
): SignificanceResult {
  const n1 = control.sampleSize;
  const n2 = treatment.sampleSize;
  const p1 = n1 > 0 ? control.conversions / n1 : 0;
  const p2 = n2 > 0 ? treatment.conversions / n2 : 0;

  // Not enough data
  if (n1 < MIN_SAMPLE || n2 < MIN_SAMPLE) {
    return {
      isSignificant: false,
      confidence: 0,
      lift: 0,
      pValue: 1,
      winner: null,
      recommendation: `Need at least ${MIN_SAMPLE} samples per variant. Control: ${n1}, Treatment: ${n2}.`,
    };
  }

  // Pooled proportion
  const pPool = (control.conversions + treatment.conversions) / (n1 + n2);
  const se = Math.sqrt(pPool * (1 - pPool) * (1 / n1 + 1 / n2));

  if (se === 0) {
    return {
      isSignificant: false,
      confidence: 0,
      lift: 0,
      pValue: 1,
      winner: null,
      recommendation: "No variance in data — cannot compute significance.",
    };
  }

  const z = (p2 - p1) / se;
  const pValue = 2 * (1 - normalCDF(Math.abs(z))); // Two-sided
  const confidence = 1 - pValue;
  const lift = p1 > 0 ? ((p2 - p1) / p1) * 100 : 0;

  const isSignificant = confidence >= MIN_CONFIDENCE;
  const winner = isSignificant ? (p2 > p1 ? treatment.variantId : control.variantId) : null;

  let recommendation: string;
  if (!isSignificant) {
    const needed = estimateSampleNeeded(p1, p2);
    recommendation = `Not significant yet (${(confidence * 100).toFixed(1)}% confidence). Need ~${needed} samples per variant.`;
  } else if (p2 > p1) {
    recommendation = `Treatment wins with +${lift.toFixed(1)}% lift at ${(confidence * 100).toFixed(1)}% confidence. Ship it!`;
  } else {
    recommendation = `Control wins. Treatment is ${Math.abs(lift).toFixed(1)}% worse at ${(confidence * 100).toFixed(1)}% confidence. Revert.`;
  }

  return { isSignificant, confidence, lift, pValue, winner, recommendation };
}

/**
 * Estimate sample size needed to reach 95% significance.
 * Uses formula: n = (z²·p·(1-p)) / E² for each group
 */
function estimateSampleNeeded(p1: number, p2: number): number {
  const effect = Math.abs(p2 - p1);
  if (effect === 0) return 99999;
  const pAvg = (p1 + p2) / 2;
  const z = 1.96; // 95% confidence
  const power = 0.8; // 80% power
  const zBeta = 0.84;
  const n = Math.ceil(
    (Math.pow(z + zBeta, 2) * (pAvg * (1 - pAvg) * 2)) / Math.pow(effect, 2),
  );
  return Math.max(n, 100);
}
