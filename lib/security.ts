/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Security Utilities (ZERO cost)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Input sanitization, XSS prevention, Zod form schemas, PII redaction,
 * and CSRF token helpers.
 *
 * ZERO external dependencies — no DOMPurify needed.
 * We use a custom sanitizer that covers OWASP XSS prevention rules:
 *   - Strip all HTML tags from user input
 *   - Encode HTML entities in display output
 *   - Validate & sanitize URLs (no javascript: or data: schemes)
 *   - Regex-based phone/email validation (Indian formats)
 *
 * For rich text (if ever needed), add DOMPurify as a single dependency.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// 1. XSS PREVENTION — Input Sanitization
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Strip ALL HTML tags from a string.
 * Use on every user-submitted text field before storing in Firestore.
 *
 * @example
 *   stripHtml('<img onerror=alert(1)> Hello <b>World</b>')
 *   → ' Hello World'
 */
export function stripHtml(input: string): string {
  if (!input) return "";
  return input
    .replace(/<[^>]*>/g, "") // Remove all HTML tags
    .replace(/&lt;/g, "<")   // Decode entities that might bypass first pass
    .replace(/&gt;/g, ">")
    .replace(/<[^>]*>/g, "") // Second pass after decode
    .trim();
}

/**
 * Encode special characters to HTML entities for safe rendering.
 * Use when displaying user content in HTML (prevents stored XSS).
 *
 * @example
 *   escapeHtml('<script>alert("xss")</script>')
 *   → '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
 */
export function escapeHtml(input: string): string {
  if (!input) return "";
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
    "`": "&#96;",
  };
  return input.replace(/[&<>"'/`]/g, (char) => map[char] || char);
}

/**
 * Sanitize a user-submitted text field.
 * Strips HTML, trims whitespace, enforces max length.
 *
 * @example
 *   sanitizeText('<b>Hi</b> there!  ', 50) → 'Hi there!'
 */
export function sanitizeText(input: string, maxLength = 500): string {
  if (!input) return "";
  let clean = stripHtml(input);
  // Remove null bytes (bypass attempts)
  clean = clean.replace(/\0/g, "");
  // Collapse multiple whitespace
  clean = clean.replace(/\s+/g, " ").trim();
  // Enforce max length
  if (clean.length > maxLength) clean = clean.slice(0, maxLength);
  return clean;
}

/**
 * Sanitize a user-submitted URL.
 * Only allows http:// and https:// schemes. Blocks javascript:, data:, etc.
 */
export function sanitizeUrl(input: string): string {
  if (!input) return "";
  const trimmed = input.trim();
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return url.href;
  } catch {
    return "";
  }
}

/**
 * Sanitize a display name.
 * Only allows letters (including Devanagari), spaces, dots, hyphens.
 * Max 50 characters.
 */
export function sanitizeName(input: string): string {
  if (!input) return "";
  // Allow: Latin, Devanagari, space, dot, hyphen, apostrophe
  return input
    .replace(/[^\p{L}\p{M}\s.\-']/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 50);
}

/**
 * Sanitize a bio/description field.
 * Allows basic punctuation, strips HTML, max 300 chars.
 */
export function sanitizeBio(input: string): string {
  return sanitizeText(input, 300);
}

/**
 * Sanitize a chat message.
 * Strips HTML, allows emojis and Unicode, max 1000 chars.
 */
export function sanitizeMessage(input: string): string {
  return sanitizeText(input, 1000);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ZOD VALIDATION SCHEMAS (for all forms)
// ─────────────────────────────────────────────────────────────────────────────

/** Indian phone number: +91 followed by 10 digits starting with 6-9 */
const indianPhoneRegex = /^\+91[6-9]\d{9}$/;

/** Indian PIN code: 6 digits, first digit 1-9 */
const pinCodeRegex = /^[1-9]\d{5}$/;

/**
 * Phone number schema — Indian format (+91XXXXXXXXXX)
 */
export const phoneSchema = z
  .string()
  .trim()
  .regex(indianPhoneRegex, {
    message: "Invalid phone number. Must be +91 followed by 10 digits.",
  });

/**
 * OTP schema — exactly 6 digits
 */
export const otpSchema = z
  .string()
  .trim()
  .length(6, { message: "OTP must be exactly 6 digits." })
  .regex(/^\d{6}$/, { message: "OTP must contain only numbers." });

/**
 * Display name schema
 */
export const nameSchema = z
  .string()
  .trim()
  .min(2, { message: "Name must be at least 2 characters." })
  .max(50, { message: "Name must be at most 50 characters." })
  .transform(sanitizeName);

/**
 * Email schema (optional, for account recovery)
 */
export const emailSchema = z
  .string()
  .trim()
  .email({ message: "Invalid email address." })
  .max(254, { message: "Email is too long." })
  .toLowerCase();

/**
 * Bio/About Me schema
 */
export const bioSchema = z
  .string()
  .max(300, { message: "Bio must be at most 300 characters." })
  .transform(sanitizeBio);

/**
 * Chat message schema
 */
export const messageSchema = z
  .string()
  .trim()
  .min(1, { message: "Message cannot be empty." })
  .max(1000, { message: "Message is too long (max 1000 characters)." })
  .transform(sanitizeMessage);

/**
 * Age schema — 18-100 (India legal adult age)
 */
export const ageSchema = z
  .number()
  .int()
  .min(18, { message: "Must be at least 18 years old." })
  .max(100, { message: "Invalid age." });

/**
 * City name schema
 */
export const citySchema = z
  .string()
  .trim()
  .min(2, { message: "City name is too short." })
  .max(100, { message: "City name is too long." })
  .transform((v) => sanitizeName(v));

/**
 * PIN code schema
 */
export const pinCodeSchema = z
  .string()
  .trim()
  .regex(pinCodeRegex, { message: "Invalid PIN code." });

/**
 * Profile photo URL schema
 */
export const photoUrlSchema = z
  .string()
  .url({ message: "Invalid photo URL." })
  .refine(
    (url) => {
      try {
        const u = new URL(url);
        return u.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "Photo URL must use HTTPS." },
  );

/**
 * Login form schema
 */
export const loginFormSchema = z.object({
  phone: phoneSchema,
});

/**
 * OTP verification schema
 */
export const otpVerifySchema = z.object({
  phone: phoneSchema,
  otp: otpSchema,
});

/**
 * Profile creation/update schema
 */
export const profileSchema = z.object({
  name: nameSchema,
  age: ageSchema,
  gender: z.enum(["male", "female", "other"]),
  city: citySchema,
  bio: bioSchema.optional(),
  intent: z.enum([
    "marriage",
    "serious_relationship",
    "companionship",
    "exploring",
  ]),
  education: z
    .string()
    .max(100)
    .transform(sanitizeText)
    .optional(),
  religion: z
    .string()
    .max(50)
    .transform(sanitizeText)
    .optional(),
  motherTongue: z
    .string()
    .max(50)
    .transform(sanitizeText)
    .optional(),
});

/**
 * Report submission schema
 */
export const reportSchema = z.object({
  reportedUserId: z.string().min(1),
  reason: z.enum([
    "fake_profile",
    "harassment",
    "spam",
    "inappropriate_content",
    "underage",
    "other",
  ]),
  comment: z
    .string()
    .max(500)
    .transform(sanitizeText)
    .optional(),
});

/**
 * Chat appreciation schema
 */
export const appreciationSchema = z.object({
  targetUserId: z.string().min(1),
  appreciatedField: z.enum(["photo", "bio", "prompt", "profile"]),
  comment: z
    .string()
    .max(100)
    .transform(sanitizeText)
    .optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. PII REDACTION (DPDP Act 2023 compliance)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Patterns that match Personally Identifiable Information.
 * Used to scrub PII from error reports, logs, and analytics.
 */
const PII_PATTERNS: { pattern: RegExp; replacement: string }[] = [
  // Indian phone numbers: +91XXXXXXXXXX, 91XXXXXXXXXX, 0XXXXXXXXXX
  { pattern: /(\+?91|0)?[6-9]\d{9}/g, replacement: "[PHONE_REDACTED]" },
  // Email addresses
  { pattern: /[\w.+-]+@[\w-]+\.[\w.-]+/g, replacement: "[EMAIL_REDACTED]" },
  // Aadhaar numbers: 12 digits with optional spaces (XXXX XXXX XXXX)
  { pattern: /\b\d{4}\s?\d{4}\s?\d{4}\b/g, replacement: "[AADHAAR_REDACTED]" },
  // PAN numbers: ABCDE1234F
  { pattern: /\b[A-Z]{5}\d{4}[A-Z]\b/g, replacement: "[PAN_REDACTED]" },
  // PIN codes (standalone 6 digits)
  { pattern: /\b[1-9]\d{5}\b/g, replacement: "[PIN_REDACTED]" },
  // Firebase UIDs (28 chars alphanumeric)
  { pattern: /\b[a-zA-Z0-9]{28}\b/g, replacement: "[UID_REDACTED]" },
  // IP addresses (IPv4)
  { pattern: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, replacement: "[IP_REDACTED]" },
  // Bearer tokens
  { pattern: /Bearer\s+[A-Za-z0-9\-._~+/]+=*/g, replacement: "Bearer [TOKEN_REDACTED]" },
  // Firebase ID tokens (long base64 JWTs)
  { pattern: /eyJ[A-Za-z0-9\-_]+\.eyJ[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+/g, replacement: "[JWT_REDACTED]" },
];

/**
 * Redact ALL PII from a string.
 * Use before sending error reports to Sentry, logging, or analytics.
 *
 * @example
 *   redactPII('Error for user +919876543210 at 192.168.1.1')
 *   → 'Error for user [PHONE_REDACTED] at [IP_REDACTED]'
 */
export function redactPII(input: string): string {
  if (!input) return "";
  let result = input;
  for (const { pattern, replacement } of PII_PATTERNS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

/**
 * Redact PII from an object (recursive).
 * Use on error context objects before sending to Sentry.
 */
export function redactPIIFromObject(obj: unknown): unknown {
  if (typeof obj === "string") return redactPII(obj);
  if (typeof obj !== "object" || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(redactPIIFromObject);

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    // Completely redact sensitive field names
    const lowerKey = key.toLowerCase();
    if (
      lowerKey.includes("password") ||
      lowerKey.includes("secret") ||
      lowerKey.includes("token") ||
      lowerKey.includes("authorization") ||
      lowerKey.includes("cookie") ||
      lowerKey.includes("aadhaar") ||
      lowerKey.includes("pan_number") ||
      lowerKey.includes("private_key")
    ) {
      result[key] = "[REDACTED]";
    } else {
      result[key] = redactPIIFromObject(value);
    }
  }
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. CSRF TOKEN HELPERS (Firebase Auth-based)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get the current Firebase Auth ID token for use as a CSRF token.
 * Firebase ID tokens are:
 *   - Short-lived (1 hour)
 *   - Signed by Google
 *   - Tied to the authenticated user
 *   - Verified server-side via firebase-admin
 *
 * Use in API requests:
 *   headers: { 'Authorization': `Bearer ${await getAuthToken()}` }
 */
export async function getAuthToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    const { getAuth } = await import("firebase/auth");
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return null;
    // forceRefresh=false: use cached token if still valid
    return await user.getIdToken(false);
  } catch {
    return null;
  }
}

/**
 * Create headers object with Authorization for API calls.
 */
export async function secureHeaders(): Promise<Record<string, string>> {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. INPUT VALIDATION HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validate and sanitize form data using a Zod schema.
 * Returns { success, data, errors }.
 *
 * @example
 *   const result = validateForm(profileSchema, formData);
 *   if (!result.success) {
 *     showErrors(result.errors);
 *     return;
 *   }
 *   await updateProfile(result.data);
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
    const path = issue.path.join(".");
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }
  return { success: false, errors };
}

/**
 * Check if a file upload is a safe image type.
 * Prevents uploading HTML, SVG (XSS vector), or executables disguised as images.
 */
export function isAllowedImageType(file: File): boolean {
  const ALLOWED_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
  ]);
  // Check MIME type
  if (!ALLOWED_TYPES.has(file.type)) return false;
  // Check file extension as second barrier
  const ext = file.name.split(".").pop()?.toLowerCase();
  const ALLOWED_EXTS = new Set(["jpg", "jpeg", "png", "webp", "avif"]);
  if (!ext || !ALLOWED_EXTS.has(ext)) return false;
  // Max 10MB
  if (file.size > 10 * 1024 * 1024) return false;
  return true;
}

/**
 * Check if a file upload is a safe audio type (voice notes).
 */
export function isAllowedAudioType(file: File): boolean {
  const ALLOWED_TYPES = new Set([
    "audio/webm",
    "audio/ogg",
    "audio/mp4",
    "audio/mpeg",
    "audio/wav",
  ]);
  if (!ALLOWED_TYPES.has(file.type)) return false;
  // Max 5MB for voice notes
  if (file.size > 5 * 1024 * 1024) return false;
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. SECURE RANDOM ID GENERATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a cryptographically secure random ID.
 * Use for anything that needs to be unpredictable (nonces, tokens, IDs).
 */
export function secureRandomId(length = 32): string {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const bytes = new Uint8Array(Math.ceil(length / 2));
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0"))
      .join("")
      .slice(0, length);
  }
  // Fallback (should never hit in modern browsers/Node)
  return Math.random().toString(36).slice(2).repeat(3).slice(0, length);
}
