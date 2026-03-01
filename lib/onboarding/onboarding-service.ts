/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Onboarding State Management Service
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Single source of truth for all onboarding data.
 *
 * Features:
 *   • Auto-save to localStorage on every field change (never lose data)
 *   • Step validation (which fields are required vs optional)
 *   • Completion percentage for progress indicator
 *   • Step navigation (next/prev with validation)
 *   • Resume from last incomplete step on re-entry
 *   • Analytics integration (track funnel drop-offs)
 *   • Time tracking (estimated time remaining)
 *
 * Data shape mirrors the Firestore user schema so we can push directly
 * on publish without transformation.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Types ───────────────────────────────────────────────────────────────

export type OnboardingStep =
  | "intent"
  | "life-details"
  | "values"
  | "photos"
  | "review";

export type IntentType =
  | "marriage-soon"
  | "serious-relationship"
  | "friendship-networking"
  | "healing-space";

export interface OnboardingData {
  // Step 1: Intent
  intent: IntentType | null;

  // Step 2: Life Details
  name: string;
  age: string;
  gender: string;
  city: string;
  pincode: string;
  relocation: string;
  familyStructure: string;
  education: string;
  career: string;
  diet: string[];

  // Step 3: Values
  loveLanguages: string[];
  dealbreakers: Record<string, string>;
  lifestyle: string[];
  bio: string;

  // Step 4: Photos
  photoUrls: string[];        // base64 or blob URLs for preview
  photoCount: number;
  verificationSelfie: string | null;

  // Meta
  startedAt: string;          // ISO timestamp of first interaction
  lastStepCompleted: OnboardingStep | null;
  completedAt: string | null; // ISO timestamp of publish
  timeSpentSeconds: number;   // total time across sessions
}

export interface StepConfig {
  id: OnboardingStep;
  path: string;
  label: string;
  labelHi: string;
  estimatedSeconds: number;
  requiredFields: (keyof OnboardingData)[];
  optionalFields: (keyof OnboardingData)[];
}

export interface StepValidation {
  isValid: boolean;
  missingRequired: string[];
  filledOptional: string[];
  completionPercent: number;
}

// ─── Constants ───────────────────────────────────────────────────────────

const STORAGE_KEY = "onboarding_data";
const TIMER_KEY = "onboarding_timer_start";

export const STEPS: StepConfig[] = [
  {
    id: "intent",
    path: "/intent",
    label: "Your Intent",
    labelHi: "आपका इरादा",
    estimatedSeconds: 15,
    requiredFields: ["intent"],
    optionalFields: [],
  },
  {
    id: "life-details",
    path: "/life-details",
    label: "Life Details",
    labelHi: "जीवन विवरण",
    estimatedSeconds: 60,
    requiredFields: ["city", "education", "career"],
    optionalFields: ["name", "age", "gender", "pincode", "relocation", "familyStructure", "diet"],
  },
  {
    id: "values",
    path: "/values",
    label: "Values",
    labelHi: "मूल्य",
    estimatedSeconds: 45,
    requiredFields: [],
    optionalFields: ["loveLanguages", "dealbreakers", "lifestyle", "bio"],
  },
  {
    id: "photos",
    path: "/photos",
    label: "Photos",
    labelHi: "फोटो",
    estimatedSeconds: 30,
    requiredFields: [],
    optionalFields: ["photoUrls", "verificationSelfie"],
  },
  {
    id: "review",
    path: "/review",
    label: "Review",
    labelHi: "समीक्षा",
    estimatedSeconds: 15,
    requiredFields: [],
    optionalFields: [],
  },
];

const EMPTY_DATA: OnboardingData = {
  intent: null,
  name: "",
  age: "",
  gender: "",
  city: "",
  pincode: "",
  relocation: "",
  familyStructure: "",
  education: "",
  career: "",
  diet: [],
  loveLanguages: [],
  dealbreakers: {},
  lifestyle: [],
  bio: "",
  photoUrls: [],
  photoCount: 0,
  verificationSelfie: null,
  startedAt: "",
  lastStepCompleted: null,
  completedAt: null,
  timeSpentSeconds: 0,
};

// ─── Core Functions ──────────────────────────────────────────────────────

/**
 * Load onboarding data from localStorage.
 * Returns empty defaults if nothing saved.
 */
export function loadOnboardingData(): OnboardingData {
  if (typeof window === "undefined") return { ...EMPTY_DATA };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_DATA, startedAt: new Date().toISOString() };
    return { ...EMPTY_DATA, ...JSON.parse(raw) };
  } catch {
    return { ...EMPTY_DATA, startedAt: new Date().toISOString() };
  }
}

/**
 * Save onboarding data to localStorage (auto-save).
 * Merges with existing data so partial updates are safe.
 */
export function saveOnboardingData(partial: Partial<OnboardingData>): OnboardingData {
  if (typeof window === "undefined") return { ...EMPTY_DATA, ...partial };
  const current = loadOnboardingData();
  const merged = { ...current, ...partial };
  // Ensure startedAt is always set
  if (!merged.startedAt) merged.startedAt = new Date().toISOString();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // Storage full — silently degrade
  }
  return merged;
}

/**
 * Clear all onboarding data (after publish or reset).
 */
export function clearOnboardingData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(TIMER_KEY);
}

// ─── Step Validation ─────────────────────────────────────────────────────

function isFieldFilled(data: OnboardingData, field: keyof OnboardingData): boolean {
  const val = data[field];
  if (val === null || val === undefined) return false;
  if (typeof val === "string") return val.trim().length > 0;
  if (Array.isArray(val)) return val.length > 0;
  if (typeof val === "object") return Object.keys(val).length > 0;
  if (typeof val === "number") return val > 0;
  return Boolean(val);
}

/**
 * Validate a specific step. Returns whether it's complete and what's missing.
 */
export function validateStep(step: OnboardingStep, data: OnboardingData): StepValidation {
  const config = STEPS.find((s) => s.id === step);
  if (!config) return { isValid: true, missingRequired: [], filledOptional: [], completionPercent: 100 };

  const missingRequired = config.requiredFields.filter((f) => !isFieldFilled(data, f));
  const filledOptional = config.optionalFields.filter((f) => isFieldFilled(data, f));

  const totalFields = config.requiredFields.length + config.optionalFields.length;
  const filledFields = config.requiredFields.filter((f) => isFieldFilled(data, f)).length + filledOptional.length;
  const completionPercent = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 100;

  return {
    isValid: missingRequired.length === 0,
    missingRequired,
    filledOptional,
    completionPercent,
  };
}

/**
 * Check if the user can advance to the next step.
 */
export function canAdvance(step: OnboardingStep, data: OnboardingData): boolean {
  return validateStep(step, data).isValid;
}

// ─── Progress Calculation ────────────────────────────────────────────────

/**
 * Overall onboarding completion (0-100).
 * Weights required fields more heavily than optional ones.
 */
export function getOverallCompletion(data: OnboardingData): number {
  let totalWeight = 0;
  let filledWeight = 0;

  for (const step of STEPS) {
    for (const field of step.requiredFields) {
      totalWeight += 2; // required = 2× weight
      if (isFieldFilled(data, field)) filledWeight += 2;
    }
    for (const field of step.optionalFields) {
      totalWeight += 1;
      if (isFieldFilled(data, field)) filledWeight += 1;
    }
  }

  return totalWeight > 0 ? Math.round((filledWeight / totalWeight) * 100) : 0;
}

/**
 * Get current step index (0-based) based on last completed step.
 */
export function getCurrentStepIndex(data: OnboardingData): number {
  if (!data.lastStepCompleted) return 0;
  const idx = STEPS.findIndex((s) => s.id === data.lastStepCompleted);
  return idx >= 0 ? Math.min(idx + 1, STEPS.length - 1) : 0;
}

/**
 * Get the path the user should resume at.
 */
export function getResumeStep(data: OnboardingData): string {
  const idx = getCurrentStepIndex(data);
  return STEPS[idx].path;
}

// ─── Time Tracking ───────────────────────────────────────────────────────

/**
 * Start or resume the session timer.
 */
export function startTimer(): void {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem(TIMER_KEY)) {
    localStorage.setItem(TIMER_KEY, String(Date.now()));
  }
}

/**
 * Get elapsed seconds for the current session.
 */
export function getSessionSeconds(): number {
  if (typeof window === "undefined") return 0;
  const start = localStorage.getItem(TIMER_KEY);
  if (!start) return 0;
  return Math.round((Date.now() - parseInt(start, 10)) / 1000);
}

/**
 * Save accumulated time and reset session timer.
 */
export function saveTimeAndReset(): void {
  const data = loadOnboardingData();
  const sessionSec = getSessionSeconds();
  saveOnboardingData({ timeSpentSeconds: data.timeSpentSeconds + sessionSec });
  if (typeof window !== "undefined") {
    localStorage.removeItem(TIMER_KEY);
  }
}

/**
 * Estimated seconds remaining based on steps not yet completed.
 */
export function getEstimatedSecondsRemaining(data: OnboardingData): number {
  const currentIdx = getCurrentStepIndex(data);
  return STEPS.slice(currentIdx).reduce((sum, s) => sum + s.estimatedSeconds, 0);
}

/**
 * Format seconds to human-readable (e.g. "2 min" or "45 sec").
 */
export function formatTime(seconds: number): { en: string; hi: string } {
  if (seconds >= 60) {
    const min = Math.ceil(seconds / 60);
    return { en: `~${min} min`, hi: `~${min} मिनट` };
  }
  return { en: `~${seconds} sec`, hi: `~${seconds} सेकंड` };
}

// ─── Step Navigation ─────────────────────────────────────────────────────

/**
 * Mark a step as completed, auto-save, and return the next step path.
 */
export function completeStep(
  step: OnboardingStep,
  stepData: Partial<OnboardingData>,
): { nextPath: string; data: OnboardingData } {
  const saved = saveOnboardingData({ ...stepData, lastStepCompleted: step });
  const currentIdx = STEPS.findIndex((s) => s.id === step);
  const nextIdx = Math.min(currentIdx + 1, STEPS.length - 1);
  return { nextPath: STEPS[nextIdx].path, data: saved };
}

/**
 * Get the previous step path for the back button.
 */
export function getPreviousPath(step: OnboardingStep): string | null {
  const idx = STEPS.findIndex((s) => s.id === step);
  if (idx <= 0) return null;
  return STEPS[idx - 1].path;
}

// ─── Analytics Helpers ───────────────────────────────────────────────────

/**
 * Get a summary object for analytics tracking.
 */
export function getOnboardingAnalytics(data: OnboardingData): Record<string, unknown> {
  return {
    completion_percent: getOverallCompletion(data),
    current_step: data.lastStepCompleted || "not_started",
    time_spent_seconds: data.timeSpentSeconds + getSessionSeconds(),
    has_intent: Boolean(data.intent),
    has_city: Boolean(data.city),
    has_photos: data.photoCount > 0,
    has_bio: data.bio.length > 0,
    love_languages_count: data.loveLanguages.length,
    dealbreakers_count: Object.keys(data.dealbreakers).length,
    lifestyle_count: data.lifestyle.length,
  };
}
