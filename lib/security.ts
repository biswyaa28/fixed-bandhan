/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Security Utilities (Enterprise-Grade)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Comprehensive security library covering:
 *   1. XSS Prevention — Input sanitization (HTML stripping + DOMPurify)
 *   2. Zod Validation Schemas — All app forms validated
 *   3. PII Redaction — DPDP Act 2023 compliance for logs/analytics
 *   4. CSRF Protection — Firebase Auth token-based
 *   5. Session Management — Short-lived token validation + refresh
 *   6. File Upload Validation — MIME + extension + magic bytes
 *   7. Brute-Force Detection — Client-side attempt tracking
 *   8. Secure Random ID Generation — Crypto-safe
 *
 * STRICT RULES:
 *   • NO hardcoded secrets — everything via env vars
 *   • NO console.log of PII — all logging passes through redactPII()
 *   • ALL user input passes through sanitize*() before Firestore write
 *   • ALL form submissions validated with Zod before processing
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
 * Two-pass approach: first removes tags, then decodes entities that
 * could smuggle through the first pass and strips again.
 *
 * @example
 *   stripHtml('<img onerror=alert(1)> Hello <b>World</b>')
 *   → 'Hello World'
 */
export function stripHtml(input: string): string {
  if (!input) return "";
  return input
    .replace(/<[^>]*>/g, "") // Pass 1: Remove all HTML tags
    .replace(/&lt;/g, "<") // Decode entities that might bypass first pass
    .replace(/&gt;/g, ">")
    .replace(/<[^>]*>/g, "") // Pass 2: Strip any tags exposed by decode
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
 * Strips HTML, trims whitespace, removes null bytes, enforces max length.
 *
 * @example
 *   sanitizeText('<b>Hi</b> there!  ', 50) → 'Hi there!'
 */
export function sanitizeText(input: string, maxLength = 500): string {
  if (!input) return "";
  let clean = stripHtml(input);
  // Remove null bytes (bypass attempts)
  clean = clean.replace(/\0/g, "");
  // Remove control characters except tab, newline, carriage return
  // eslint-disable-next-line no-control-regex
  clean = clean.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
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
    // Block URLs with credentials (user:pass@host)
    if (url.username || url.password) return "";
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

/**
 * Deep-sanitize an entire object (for Firestore writes).
 * Recursively sanitizes all string values.
 * Use before writing any user-submitted data to the database.
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  maxFieldLength = 500,
): T {
  const result = { ...obj };
  for (const [key, value] of Object.entries(result)) {
    if (typeof value === "string") {
      (result as any)[key] = sanitizeText(value, maxFieldLength);
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      (result as any)[key] = sanitizeObject(
        value as Record<string, unknown>,
        maxFieldLength,
      );
    }
  }
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ZOD VALIDATION SCHEMAS (for all forms)
// ─────────────────────────────────────────────────────────────────────────────
// NOTE: Comprehensive schemas are now in lib/validation.ts.
// These core schemas are re-exported from here for backward compatibility.
// ─────────────────────────────────────────────────────────────────────────────

/** Indian phone number: +91 followed by 10 digits starting with 6-9 */
const indianPhoneRegex = /^\+91[6-9]\d{9}$/;

/** Indian PIN code: 6 digits, first digit 1-9 */
const pinCodeRegex = /^[1-9]\d{5}$/;

export const phoneSchema = z.string().trim().regex(indianPhoneRegex, {
  message: "Invalid phone number. Must be +91 followed by 10 digits.",
});

export const otpSchema = z
  .string()
  .trim()
  .length(6, { message: "OTP must be exactly 6 digits." })
  .regex(/^\d{6}$/, { message: "OTP must contain only numbers." });

export const nameSchema = z
  .string()
  .trim()
  .min(2, { message: "Name must be at least 2 characters." })
  .max(50, { message: "Name must be at most 50 characters." })
  .transform(sanitizeName);

export const emailSchema = z
  .string()
  .trim()
  .email({ message: "Invalid email address." })
  .max(254, { message: "Email is too long." })
  .toLowerCase();

export const bioSchema = z
  .string()
  .max(300, { message: "Bio must be at most 300 characters." })
  .transform(sanitizeBio);

export const messageSchema = z
  .string()
  .trim()
  .min(1, { message: "Message cannot be empty." })
  .max(1000, { message: "Message is too long (max 1000 characters)." })
  .transform(sanitizeMessage);

export const ageSchema = z
  .number()
  .int()
  .min(18, { message: "Must be at least 18 years old." })
  .max(100, { message: "Invalid age." });

export const citySchema = z
  .string()
  .trim()
  .min(2, { message: "City name is too short." })
  .max(100, { message: "City name is too long." })
  .transform((v) => sanitizeName(v));

export const pinCodeSchema = z
  .string()
  .trim()
  .regex(pinCodeRegex, { message: "Invalid PIN code." });

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

export const loginFormSchema = z.object({
  phone: phoneSchema,
});

export const otpVerifySchema = z.object({
  phone: phoneSchema,
  otp: otpSchema,
});

export const profileSchema = z.object({
  name: nameSchema,
  age: ageSchema,
  gender: z.enum(["male", "female", "other"]),
  city: citySchema,
  bio: bioSchema.optional(),
  intent: z.enum(["marriage", "serious_relationship", "companionship", "exploring"]),
  education: z.string().max(100).transform(sanitizeText).optional(),
  religion: z.string().max(50).transform(sanitizeText).optional(),
  motherTongue: z.string().max(50).transform(sanitizeText).optional(),
});

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
  comment: z.string().max(500).transform(sanitizeText).optional(),
});

export const appreciationSchema = z.object({
  targetUserId: z.string().min(1),
  appreciatedField: z.enum(["photo", "bio", "prompt", "profile"]),
  comment: z.string().max(100).transform(sanitizeText).optional(),
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
  {
    pattern: /eyJ[A-Za-z0-9\-_]+\.eyJ[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+/g,
    replacement: "[JWT_REDACTED]",
  },
  // Credit/debit card numbers (13-19 digits)
  {
    pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{1,7}\b/g,
    replacement: "[CARD_REDACTED]",
  },
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
      lowerKey.includes("private_key") ||
      lowerKey.includes("credit_card") ||
      lowerKey.includes("cvv")
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
    // forceRefresh=false: use cached token if still valid (<1 hour)
    return await user.getIdToken(false);
  } catch {
    return null;
  }
}

/**
 * Force-refresh the Firebase ID token.
 * Call this when you get a 401 to attempt silent re-auth.
 */
export async function refreshAuthToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    const { getAuth } = await import("firebase/auth");
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken(true); // forceRefresh=true
  } catch {
    return null;
  }
}

/**
 * Create headers object with Authorization for API calls.
 * Includes Content-Type and optional custom headers.
 */
export async function secureHeaders(
  extra?: Record<string, string>,
): Promise<Record<string, string>> {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(extra ?? {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Make a secure fetch request with auto-retry on 401.
 * Automatically attaches auth headers and retries once with a fresh token.
 */
export async function secureFetch(url: string, init?: RequestInit): Promise<Response> {
  const headers = await secureHeaders(
    init?.headers as Record<string, string> | undefined,
  );

  let response = await fetch(url, { ...init, headers });

  // Auto-retry on 401 with a refreshed token
  if (response.status === 401) {
    const freshToken = await refreshAuthToken();
    if (freshToken) {
      headers["Authorization"] = `Bearer ${freshToken}`;
      response = await fetch(url, { ...init, headers });
    }
  }

  return response;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. SESSION & TOKEN MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

/** Token metadata stored in memory for session tracking */
interface TokenMetadata {
  issuedAt: number;
  expiresAt: number;
  uid: string;
}

let _cachedTokenMeta: TokenMetadata | null = null;

/**
 * Decode a Firebase ID token's payload (without verification).
 * Used CLIENT-SIDE only to check expiry before making API calls.
 * Server-side verification is always done via firebase-admin.
 *
 * WARNING: This does NOT verify the signature. Only use for UX decisions
 * (e.g., "should I refresh?"), never for authorization.
 */
export function decodeTokenPayload(token: string): TokenMetadata | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    return {
      uid: payload.sub ?? payload.user_id ?? "",
      issuedAt: (payload.iat ?? 0) * 1000,
      expiresAt: (payload.exp ?? 0) * 1000,
    };
  } catch {
    return null;
  }
}

/**
 * Check if the cached auth token is still valid (not expired).
 * Returns false if no token or expired (with 5-minute buffer).
 */
export function isTokenValid(): boolean {
  if (!_cachedTokenMeta) return false;
  const bufferMs = 5 * 60 * 1000; // 5 minute buffer before actual expiry
  return Date.now() < _cachedTokenMeta.expiresAt - bufferMs;
}

/**
 * Update the cached token metadata. Called after login/token refresh.
 */
export function setCachedTokenMeta(token: string): void {
  _cachedTokenMeta = decodeTokenPayload(token);
}

/**
 * Clear cached token metadata. Called on sign-out.
 */
export function clearCachedTokenMeta(): void {
  _cachedTokenMeta = null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. BRUTE-FORCE DETECTION (Client-Side)
// ─────────────────────────────────────────────────────────────────────────────

interface AttemptTracker {
  count: number;
  firstAttemptAt: number;
  lockedUntil: number;
}

const attemptTrackers = new Map<string, AttemptTracker>();

/** Lockout thresholds */
const BRUTE_FORCE_CONFIG = {
  /** Max attempts before lockout */
  maxAttempts: 5,
  /** Window in which attempts are counted (5 minutes) */
  windowMs: 5 * 60 * 1000,
  /** Lockout duration (15 minutes) */
  lockoutMs: 15 * 60 * 1000,
} as const;

/**
 * Record a failed authentication attempt.
 * Returns { locked, remainingAttempts, lockoutEndsAt }.
 *
 * @param key - Identifier (e.g. phone number or IP)
 */
export function recordFailedAttempt(key: string): {
  locked: boolean;
  remainingAttempts: number;
  lockoutEndsAt: number | null;
} {
  const now = Date.now();
  let tracker = attemptTrackers.get(key);

  // If no tracker or window expired, start fresh
  if (!tracker || now > tracker.firstAttemptAt + BRUTE_FORCE_CONFIG.windowMs) {
    tracker = { count: 1, firstAttemptAt: now, lockedUntil: 0 };
    attemptTrackers.set(key, tracker);
    return {
      locked: false,
      remainingAttempts: BRUTE_FORCE_CONFIG.maxAttempts - 1,
      lockoutEndsAt: null,
    };
  }

  // Check if currently locked out
  if (tracker.lockedUntil > now) {
    return {
      locked: true,
      remainingAttempts: 0,
      lockoutEndsAt: tracker.lockedUntil,
    };
  }

  tracker.count++;

  // Trigger lockout
  if (tracker.count >= BRUTE_FORCE_CONFIG.maxAttempts) {
    tracker.lockedUntil = now + BRUTE_FORCE_CONFIG.lockoutMs;
    return {
      locked: true,
      remainingAttempts: 0,
      lockoutEndsAt: tracker.lockedUntil,
    };
  }

  return {
    locked: false,
    remainingAttempts: BRUTE_FORCE_CONFIG.maxAttempts - tracker.count,
    lockoutEndsAt: null,
  };
}

/**
 * Clear the attempt tracker (e.g., after successful login).
 */
export function clearFailedAttempts(key: string): void {
  attemptTrackers.delete(key);
}

/**
 * Check if a key is currently locked out.
 */
export function isLockedOut(key: string): boolean {
  const tracker = attemptTrackers.get(key);
  if (!tracker) return false;
  return tracker.lockedUntil > Date.now();
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. INPUT VALIDATION HELPERS
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
 * Validates MIME type, file extension, and file size.
 * Prevents uploading HTML, SVG (XSS vector), or executables disguised as images.
 */
export function isAllowedImageType(file: File): boolean {
  const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
  if (!ALLOWED_TYPES.has(file.type)) return false;
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

/**
 * Validate image file magic bytes (first few bytes of the file).
 * This prevents MIME spoofing where a .exe is renamed to .jpg.
 *
 * @param buffer - First 12 bytes of the file (from file.slice(0, 12))
 */
export async function validateImageMagicBytes(file: File): Promise<boolean> {
  try {
    const buffer = await file.slice(0, 12).arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // JPEG: starts with FF D8 FF
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return true;
    // PNG: starts with 89 50 4E 47
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47)
      return true;
    // WebP: RIFF....WEBP
    if (
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50
    )
      return true;
    // AVIF: ....ftypavif (bytes 4-11)
    if (bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70)
      return true;

    return false;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. SECURE RANDOM ID GENERATION
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

// ─────────────────────────────────────────────────────────────────────────────
// 9. SECURE LOGGING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Log an error safely — redacts PII before writing to console.
 * Use instead of console.error for any user-related errors.
 */
export function secureLog(
  level: "info" | "warn" | "error",
  message: string,
  context?: Record<string, unknown>,
): void {
  const safeMessage = redactPII(message);
  const safeContext = context ? redactPIIFromObject(context) : undefined;

  switch (level) {
    case "info":
      // eslint-disable-next-line no-console
      console.info(`[Bandhan] ${safeMessage}`, safeContext ?? "");
      break;
    case "warn":
      // eslint-disable-next-line no-console
      console.warn(`[Bandhan] ${safeMessage}`, safeContext ?? "");
      break;
    case "error":
      // eslint-disable-next-line no-console
      console.error(`[Bandhan] ${safeMessage}`, safeContext ?? "");
      break;
  }
}
