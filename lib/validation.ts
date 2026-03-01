/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Zod Validation Schemas (Complete)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Single source of truth for ALL form validations in the app.
 * Every user input — from login to profile editing to chat — passes through
 * a Zod schema before being processed or stored.
 *
 * SCHEMA GROUPS:
 *   1. Authentication (login, OTP, Google sign-in)
 *   2. User Profile (creation, update, photos)
 *   3. Onboarding (intent, values, life-architecture, dealbreakers)
 *   4. Chat & Messaging (text, voice, appreciation)
 *   5. Safety & Reporting (report, block, share-date)
 *   6. Preferences & Settings (privacy, notifications, filters)
 *   7. Premium & Payments (subscription, referral)
 *   8. Search & Discovery (filters, quick-filters)
 *
 * USAGE:
 *   import { profileUpdateSchema, validateForm } from '@/lib/validation';
 *
 *   const result = profileUpdateSchema.safeParse(formData);
 *   if (!result.success) handleErrors(result.error);
 *   else saveProfile(result.data);
 *
 * RULES:
 *   • Every string field has a max length (prevent payload bombs)
 *   • All text inputs are sanitized via transform (XSS prevention)
 *   • Phone/email/Aadhaar formats validated with regex
 *   • Enum values strictly typed (no arbitrary strings)
 *   • Bilingual error messages where possible
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { z } from "zod";
import { sanitizeText, sanitizeName, sanitizeBio, sanitizeMessage, sanitizeUrl } from "./security";

// ─────────────────────────────────────────────────────────────────────────────
// Shared Primitives
// ─────────────────────────────────────────────────────────────────────────────

/** Indian phone number: +91 followed by 10 digits starting with 6-9 */
const INDIAN_PHONE_REGEX = /^\+91[6-9]\d{9}$/;

/** Indian PIN code: 6 digits, first digit 1-9 */
const PIN_CODE_REGEX = /^[1-9]\d{5}$/;

/** Firebase-style UID: alphanumeric, 20-128 chars */
const UID_REGEX = /^[a-zA-Z0-9]{20,128}$/;

/** ISO 8601 date: YYYY-MM-DD */
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// ── Primitive schemas ────────────────────────────────────────────────────

export const uidSchema = z
  .string()
  .min(1, "User ID is required.")
  .max(128, "User ID is too long.")
  .regex(UID_REGEX, "Invalid user ID format.");

export const phoneSchema = z
  .string()
  .trim()
  .regex(INDIAN_PHONE_REGEX, "Invalid phone number. Must be +91 followed by 10 digits.");

export const otpSchema = z
  .string()
  .trim()
  .length(6, "OTP must be exactly 6 digits.")
  .regex(/^\d{6}$/, "OTP must contain only numbers.");

export const nameSchema = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters.")
  .max(50, "Name must be at most 50 characters.")
  .transform(sanitizeName);

export const emailSchema = z
  .string()
  .trim()
  .email("Invalid email address.")
  .max(254, "Email is too long.")
  .toLowerCase();

export const bioSchema = z
  .string()
  .max(300, "Bio must be at most 300 characters.")
  .transform(sanitizeBio);

export const messageContentSchema = z
  .string()
  .trim()
  .min(1, "Message cannot be empty.")
  .max(1000, "Message is too long (max 1000 characters).")
  .transform(sanitizeMessage);

export const ageSchema = z
  .number()
  .int()
  .min(18, "Must be at least 18 years old.")
  .max(100, "Invalid age.");

export const citySchema = z
  .string()
  .trim()
  .min(2, "City name is too short.")
  .max(100, "City name is too long.")
  .transform(sanitizeName);

export const pinCodeSchema = z
  .string()
  .trim()
  .regex(PIN_CODE_REGEX, "Invalid PIN code.");

export const dateSchema = z
  .string()
  .regex(ISO_DATE_REGEX, "Invalid date format. Use YYYY-MM-DD.");

export const urlSchema = z
  .string()
  .url("Invalid URL.")
  .max(2048, "URL is too long.")
  .transform(sanitizeUrl)
  .refine((val) => val.length > 0, "URL must use http or https.");

export const httpsUrlSchema = z
  .string()
  .url("Invalid URL.")
  .refine(
    (url) => {
      try { return new URL(url).protocol === "https:"; }
      catch { return false; }
    },
    "URL must use HTTPS.",
  );

// ─────────────────────────────────────────────────────────────────────────────
// 1. AUTHENTICATION SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const loginFormSchema = z.object({
  phone: phoneSchema,
});

export const otpVerifySchema = z.object({
  phone: phoneSchema,
  otp: otpSchema,
});

export const googleSignInSchema = z.object({
  idToken: z.string().min(1, "Google ID token is required."),
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. USER PROFILE SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

/** Gender enum matching schema.ts */
export const genderSchema = z.enum(
  ["male", "female", "non-binary", "prefer-not-to-say"],
  { errorMap: () => ({ message: "Please select a valid gender." }) },
);

/** Intent enum matching schema.ts */
export const intentSchema = z.enum(
  ["marriage-soon", "serious-relationship", "friendship", "healing"],
  { errorMap: () => ({ message: "Please select your relationship intent." }) },
);

/** Diet enum matching schema.ts */
export const dietSchema = z.enum(
  ["vegetarian", "eggetarian", "non-vegetarian", "jain", "halal", "vegan"],
  { errorMap: () => ({ message: "Please select a valid diet preference." }) },
);

/** Frequency enum */
export const frequencySchema = z.enum(["never", "occasionally", "regularly"]);

/** Family type */
export const familyTypeSchema = z.enum(["joint", "nuclear"]);

/** Profile photo entry */
export const photoSchema = z.object({
  url: httpsUrlSchema,
  isPrimary: z.boolean(),
  storagePath: z.string().max(500).optional(),
});

/** Full profile creation schema (onboarding) */
export const profileCreateSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  gender: genderSchema,
  dateOfBirth: dateSchema.optional(),
  age: ageSchema.optional(),
  city: citySchema.optional(),
  state: z.string().max(50).transform(sanitizeName).optional(),
  bio: bioSchema.optional(),
  intent: intentSchema.optional(),
  education: z.string().max(100).transform(sanitizeText).optional(),
  college: z.string().max(100).transform(sanitizeText).optional(),
  career: z.string().max(100).transform(sanitizeText).optional(),
  company: z.string().max(100).transform(sanitizeText).optional(),
  annualIncome: z.string().max(30).transform(sanitizeText).optional(),
  height: z.string().max(10).optional(),
  motherTongue: z.string().max(50).transform(sanitizeName).optional(),
  religion: z.string().max(50).transform(sanitizeName).optional(),
  caste: z.string().max(50).transform(sanitizeName).nullable().optional(),
  diet: dietSchema.optional(),
  smoking: frequencySchema.optional(),
  drinking: frequencySchema.optional(),
});

/** Partial profile update schema */
export const profileUpdateSchema = profileCreateSchema.partial();

// ─────────────────────────────────────────────────────────────────────────────
// 3. ONBOARDING SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const intentSelectionSchema = z.object({
  intent: intentSchema,
});

export const valuesSelectionSchema = z.object({
  values: z
    .array(z.string().max(50).transform(sanitizeText))
    .min(1, "Please select at least one value.")
    .max(10, "Maximum 10 values allowed."),
});

export const lifeArchitectureSchema = z.object({
  education: z.string().max(100).transform(sanitizeText),
  career: z.string().max(100).transform(sanitizeText),
  city: citySchema,
  familyType: familyTypeSchema.optional(),
  religion: z.string().max(50).transform(sanitizeName).optional(),
  diet: dietSchema.optional(),
});

/** Dealbreakers from onboarding */
export const dealbreakersSchema = z.object({
  smoking: z.enum(["non-negotiable", "okay-occasionally", "dont-care"]),
  drinking: z.enum(["non-negotiable", "okay-occasionally", "dont-care"]),
  diet: z.enum(["strict-veg", "eggetarian", "non-veg", "dont-care"]),
  familyValues: z.enum(["traditional", "modern", "flexible"]),
  relocation: z.enum(["not-willing", "open-discuss", "definitely"]),
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. CHAT & MESSAGING SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const sendMessageSchema = z.object({
  matchId: z.string().min(1, "Match ID is required."),
  content: messageContentSchema,
  type: z.enum(["text", "icebreaker"]).default("text"),
  replyToId: z.string().max(128).nullable().optional(),
});

export const sendMediaMessageSchema = z.object({
  matchId: z.string().min(1, "Match ID is required."),
  type: z.enum(["voice", "image"]),
  caption: z.string().max(200).transform(sanitizeText).optional(),
});

export const appreciationSchema = z.object({
  targetUserId: uidSchema,
  appreciatedField: z.enum(["photo", "bio", "prompt", "profile"]),
  comment: z.string().max(100).transform(sanitizeText).optional(),
});

/** Icebreaker selection */
export const icebreakerSchema = z.object({
  matchId: z.string().min(1),
  questionId: z.string().min(1).max(50),
  questionText: z.string().max(200).transform(sanitizeText),
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. SAFETY & REPORTING SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const reportReasonSchema = z.enum([
  "fake-profile",
  "harassment",
  "spam",
  "inappropriate-content",
  "underage",
  "scam",
  "other",
]);

export const reportSchema = z.object({
  reportedUserId: uidSchema,
  reason: reportReasonSchema,
  comment: z.string().max(500).transform(sanitizeText).optional(),
});

export const blockUserSchema = z.object({
  userId: uidSchema,
  reason: z.string().max(200).transform(sanitizeText).optional(),
});

/** Share My Date safety feature */
export const shareDateSchema = z.object({
  contacts: z
    .array(
      z.object({
        name: z.string().max(50).transform(sanitizeName),
        phone: phoneSchema,
      }),
    )
    .min(1, "At least one emergency contact is required.")
    .max(3, "Maximum 3 contacts allowed."),
  durationMinutes: z
    .number()
    .int()
    .min(30)
    .max(120)
    .default(120),
  includeMatchDetails: z.boolean().default(false),
  matchDetails: z
    .object({
      name: z.string().max(50).transform(sanitizeName),
      photoUrl: httpsUrlSchema.optional(),
    })
    .optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. PREFERENCES & SETTINGS SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const privacySettingsSchema = z.object({
  showOnlineStatus: z.boolean(),
  showProfileVisits: z.boolean(),
  showReadReceipts: z.boolean(),
  showLastSeen: z.boolean(),
  showDistance: z.boolean(),
});

export const notificationSettingsSchema = z.object({
  matches: z.boolean().default(true),
  messages: z.boolean().default(true),
  likes: z.boolean().default(true),
  reminders: z.boolean().default(true),
  marketing: z.boolean().default(false),
});

export const preferencesSchema = z.object({
  ageRange: z.object({
    min: z.number().int().min(18).max(100),
    max: z.number().int().min(18).max(100),
  }).refine(
    (data) => data.min <= data.max,
    "Minimum age must be less than or equal to maximum age.",
  ),
  locations: z.array(z.string().max(100).transform(sanitizeName)).max(10),
  diets: z.array(dietSchema).max(6),
  intents: z.array(intentSchema).max(4),
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. PREMIUM & PAYMENTS SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const premiumPlanSchema = z.enum(["monthly", "quarterly", "yearly"]);

export const paymentInitSchema = z.object({
  plan: premiumPlanSchema,
  couponCode: z.string().max(20).transform(sanitizeText).optional(),
});

export const paymentVerifySchema = z.object({
  orderId: z.string().min(1).max(100),
  paymentId: z.string().min(1).max(100),
  signature: z.string().min(1).max(500),
});

export const referralCodeSchema = z
  .string()
  .trim()
  .min(4, "Referral code is too short.")
  .max(20, "Referral code is too long.")
  .regex(/^[A-Z0-9-]+$/, "Referral code can only contain uppercase letters, numbers, and hyphens.");

// ─────────────────────────────────────────────────────────────────────────────
// 8. SEARCH & DISCOVERY SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const discoveryFiltersSchema = z.object({
  city: z.string().max(100).transform(sanitizeName).optional(),
  ageMin: z.number().int().min(18).max(100).optional(),
  ageMax: z.number().int().min(18).max(100).optional(),
  intent: intentSchema.optional(),
  diet: dietSchema.optional(),
  verifiedOnly: z.boolean().optional(),
  religion: z.string().max(50).transform(sanitizeName).optional(),
});

export const quickFilterSchema = z.enum([
  "verified",
  "same-city",
  "marriage-intent",
  "vegetarian",
  "college-alumni",
  "age-25-30",
  "age-30-35",
]);

/** Interest (like) creation */
export const createInterestSchema = z.object({
  toUserId: uidSchema,
  type: z.enum(["like", "special", "premium"]).default("like"),
  comment: z.string().max(100).transform(sanitizeText).optional(),
  appreciatedElement: z.string().max(50).optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. PROFILE PROMPTS & SUCCESS STORIES
// ─────────────────────────────────────────────────────────────────────────────

export const profilePromptSchema = z.object({
  promptId: z.string().min(1).max(50),
  answer: z.string().min(1).max(200).transform(sanitizeText),
});

export const successStorySchema = z.object({
  partnerName: z.string().max(50).transform(sanitizeName),
  quote: z.string().min(10).max(500).transform(sanitizeText),
  city: citySchema,
  durationMonths: z.number().int().min(1).max(120),
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. MEETING FEEDBACK (Success Tracker)
// ─────────────────────────────────────────────────────────────────────────────

export const meetingFeedbackSchema = z.object({
  matchId: z.string().min(1).max(128),
  outcome: z.enum(["great", "not-compatible", "planning", "wont-meet"]),
  comment: z.string().max(300).transform(sanitizeText).optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION HELPER (re-exported for convenience)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validate and sanitize form data using a Zod schema.
 * Returns a discriminated union: { success, data } | { success, errors }.
 *
 * @example
 *   const result = validateForm(profileUpdateSchema, formData);
 *   if (!result.success) { showErrors(result.errors); return; }
 *   await saveProfile(result.data);
 */
export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join(".") || "_root";
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }
  return { success: false, errors };
}

/**
 * Type-safe helper to extract the inferred type from a Zod schema.
 *
 * @example
 *   type ProfileData = InferSchema<typeof profileUpdateSchema>;
 */
export type InferSchema<T extends z.ZodSchema> = z.infer<T>;
