/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Text Content Moderation Engine
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Client-side text moderation for real-time chat, profiles, and prompts.
 *
 * PIPELINE (runs in ~1ms for typical messages):
 *   1. Normalise input (lowercase, strip accents, expand leetspeak)
 *   2. Check against bad-words dictionary (exact + fuzzy)
 *   3. Check harassment/threat patterns (regex)
 *   4. Check scam indicators (URL/phone/UPI patterns)
 *   5. Check for contact info sharing (phone numbers, social handles)
 *   6. Return a ModerationResult with severity + matched rules
 *
 * ACTIONS:
 *   "pass"  → Content is clean, allow through
 *   "warn"  → Allow but show a gentle warning to the sender
 *   "flag"  → Queue for human moderator review (message still sent)
 *   "block" → Prevent the content from being sent/saved
 *
 * ZERO EXTERNAL DEPENDENCIES — everything runs client-side.
 * No content ever leaves the device for moderation purposes.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  BAD_WORDS,
  LEETSPEAK_MAP,
  EVASION_CHARS,
  WHOLE_WORD_ONLY,
  HELPLINES,
  type ModSeverity,
  type BadWordCategory,
  type BadWordEntry,
} from "@/data/bad-words";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ModerationAction = "pass" | "warn" | "flag" | "block";

export interface ModerationViolation {
  /** The matched word or pattern */
  matchedTerm: string;
  /** Category of the violation */
  category: BadWordCategory;
  /** Severity of the individual match */
  severity: ModSeverity;
  /** Character position range in the original input */
  position: { start: number; end: number } | null;
}

export interface ModerationResult {
  /** The overall action to take (highest severity among all violations) */
  action: ModerationAction;
  /** All violations found */
  violations: ModerationViolation[];
  /** Whether the content contains self-harm language (special handling) */
  containsSelfHarm: boolean;
  /** Helpline info to show if self-harm detected */
  helplines: typeof HELPLINES | null;
  /** Cleaned text with profanity replaced by asterisks (for warn/flag) */
  cleanedText: string;
  /** Processing time in milliseconds (for perf monitoring) */
  processingTimeMs: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Text Normalisation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalise text for comparison:
 *  - Lowercase
 *  - Expand leetspeak (0→o, 3→e, @→a, etc.)
 *  - Strip evasion characters (dots, dashes, asterisks)
 *  - Collapse repeated characters (fuuuuck → fuck)
 *  - Trim whitespace
 */
function normalise(input: string): string {
  let text = input.toLowerCase();

  // Expand leetspeak
  for (const [leet, normal] of Object.entries(LEETSPEAK_MAP)) {
    text = text.split(leet).join(normal);
  }

  // Collapse repeated characters (3+ of same char → single)
  text = text.replace(/(.)\1{2,}/g, "$1");

  return text;
}

/**
 * Strip evasion characters from a string for matching.
 * "f.u.c.k" → "fuck", "s*h*i*t" → "shit"
 */
function stripEvasion(input: string): string {
  return input.replace(EVASION_CHARS, "");
}

// ─────────────────────────────────────────────────────────────────────────────
// Pattern-Based Detection (regex)
// ─────────────────────────────────────────────────────────────────────────────

interface PatternRule {
  pattern: RegExp;
  category: BadWordCategory;
  severity: ModSeverity;
  description: string;
}

const PATTERNS: PatternRule[] = [
  // ── Contact info sharing (early stages = potential scam) ──
  {
    pattern: /(?:\+?91|0)?[6-9]\d{9}/,
    category: "scam",
    severity: "flag",
    description: "Phone number detected",
  },
  {
    pattern: /@[\w]{3,30}/,
    category: "scam",
    severity: "warn",
    description: "Social media handle detected",
  },
  {
    pattern: /(?:wa\.me|t\.me|bit\.ly|tinyurl|goo\.gl)\//i,
    category: "scam",
    severity: "block",
    description: "Shortened URL detected",
  },
  {
    pattern: /https?:\/\/[^\s]+/i,
    category: "scam",
    severity: "flag",
    description: "URL detected",
  },

  // ── UPI / financial info ──
  {
    pattern: /[\w.-]+@(?:upi|ybl|okaxis|okhdfcbank|okicici|paytm|apl|gpay)/i,
    category: "scam",
    severity: "block",
    description: "UPI ID detected",
  },

  // ── Repetitive harassment (same message 3+ times) ──
  {
    pattern: /(.{10,})\1{2,}/,
    category: "harassment",
    severity: "flag",
    description: "Repetitive text pattern",
  },

  // ── ALL-CAPS shouting (over 50 chars) ──
  {
    pattern: /[A-Z\s]{50,}/,
    category: "harassment",
    severity: "warn",
    description: "Excessive capitalisation",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Core Moderation Engine
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Moderate a text input and return the result.
 *
 * @param input  Raw text from the user (chat message, bio, prompt answer, etc.)
 * @param context  Where the text is being used (affects sensitivity thresholds)
 *
 * @example
 *   const result = moderateText("Hey, send me your UPI ID!");
 *   if (result.action === "block") {
 *     showError("This message can't be sent.");
 *   }
 */
export function moderateText(
  input: string,
  context: "chat" | "bio" | "prompt" | "name" | "report_comment" = "chat",
): ModerationResult {
  const start = performance.now();

  const violations: ModerationViolation[] = [];
  let containsSelfHarm = false;
  let cleanedText = input;

  if (!input || input.trim().length === 0) {
    return {
      action: "pass",
      violations: [],
      containsSelfHarm: false,
      helplines: null,
      cleanedText: input,
      processingTimeMs: performance.now() - start,
    };
  }

  const normalised = normalise(input);
  const stripped = stripEvasion(normalised);

  // ── Pass 1: Dictionary lookup (exact match + evasion-stripped) ──
  for (const entry of BAD_WORDS) {
    const { word, severity, category, wholeWordOnly } = entry;

    let matched = false;
    let matchSource = normalised;

    if (wholeWordOnly) {
      // Match as whole word only (surrounded by word boundaries)
      const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, "i");
      if (regex.test(normalised) || regex.test(stripped)) {
        matched = true;
        matchSource = regex.test(normalised) ? normalised : stripped;
      }
    } else {
      // Substring match (catches embedded profanity)
      if (normalised.includes(word) || stripped.includes(word)) {
        matched = true;
        matchSource = normalised.includes(word) ? normalised : stripped;
      }
    }

    if (matched) {
      // Find position in original input (approximate)
      const idx = matchSource.indexOf(word);
      violations.push({
        matchedTerm: word,
        category,
        severity,
        position: idx >= 0 ? { start: idx, end: idx + word.length } : null,
      });

      // Censor the word in cleaned text
      const censorRegex = new RegExp(escapeRegex(word), "gi");
      cleanedText = cleanedText.replace(censorRegex, (m) =>
        m[0] + "*".repeat(Math.max(0, m.length - 2)) + (m.length > 1 ? m[m.length - 1] : ""),
      );

      if (category === "self_harm") {
        containsSelfHarm = true;
      }
    }
  }

  // ── Pass 2: Pattern-based detection ──
  for (const rule of PATTERNS) {
    if (rule.pattern.test(input) || rule.pattern.test(normalised)) {
      const match = input.match(rule.pattern) || normalised.match(rule.pattern);
      violations.push({
        matchedTerm: rule.description,
        category: rule.category,
        severity: rule.severity,
        position: match?.index != null
          ? { start: match.index, end: match.index + match[0].length }
          : null,
      });
    }
  }

  // ── Pass 3: Context-specific rules ──
  if (context === "name") {
    // Names should be stricter — block any profanity match
    for (const v of violations) {
      if (v.severity === "warn" || v.severity === "flag") {
        v.severity = "block";
      }
    }
  }

  // ── Determine overall action ──
  const action = determineAction(violations);

  return {
    action,
    violations,
    containsSelfHarm,
    helplines: containsSelfHarm ? HELPLINES : null,
    cleanedText,
    processingTimeMs: performance.now() - start,
  };
}

/**
 * Quick check: returns true if the text should be blocked.
 * Lightweight wrapper for simple use cases.
 */
export function isTextBlocked(input: string): boolean {
  return moderateText(input).action === "block";
}

/**
 * Quick check: returns true if the text has any violations.
 */
export function hasViolations(input: string): boolean {
  return moderateText(input).violations.length > 0;
}

/**
 * Get a user-friendly rejection message based on the violation category.
 */
export function getRejectionMessage(
  result: ModerationResult,
  language: "en" | "hi" = "en",
): string {
  if (result.violations.length === 0) return "";

  const primaryCategory = result.violations[0].category;

  const messages: Record<BadWordCategory, { en: string; hi: string }> = {
    profanity: {
      en: "This message contains inappropriate language. Please keep conversations respectful.",
      hi: "इस संदेश में अनुचित भाषा है। कृपया बातचीत सम्मानजनक रखें।",
    },
    harassment: {
      en: "This message may be perceived as threatening or harassing. Harassment is not tolerated on Bandhan AI.",
      hi: "यह संदेश धमकी या उत्पीड़न के रूप में देखा जा सकता है। बंधन AI पर उत्पीड़न बर्दाश्त नहीं किया जाता।",
    },
    hate_speech: {
      en: "This message contains language that may be hurtful to a community. We celebrate diversity on Bandhan AI.",
      hi: "इस संदेश में ऐसी भाषा है जो किसी समुदाय को चोट पहुँचा सकती है। बंधन AI पर हम विविधता का सम्मान करते हैं।",
    },
    scam: {
      en: "Sharing personal financial information or external links is not allowed for your safety.",
      hi: "आपकी सुरक्षा के लिए व्यक्तिगत वित्तीय जानकारी या बाहरी लिंक साझा करने की अनुमति नहीं है।",
    },
    sexual: {
      en: "This message contains explicit content. Bandhan AI is a family-friendly platform for meaningful connections.",
      hi: "इस संदेश में अश्लील सामग्री है। बंधन AI सार्थक रिश्तों के लिए एक पारिवारिक मंच है।",
    },
    dowry: {
      en: "Dowry demands are illegal under the Dowry Prohibition Act, 1961. This content has been blocked.",
      hi: "दहेज की माँग, दहेज निषेध अधिनियम 1961 के तहत अवैध है। इस सामग्री को अवरुद्ध कर दिया गया है।",
    },
    self_harm: {
      en: "If you're feeling distressed, you're not alone. Please reach out to a helpline.",
      hi: "यदि आप परेशान महसूस कर रहे हैं, तो आप अकेले नहीं हैं। कृपया हेल्पलाइन से संपर्क करें।",
    },
  };

  return messages[primaryCategory]?.[language] || messages.profanity[language];
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function determineAction(violations: ModerationViolation[]): ModerationAction {
  if (violations.length === 0) return "pass";

  const hasBlock = violations.some((v) => v.severity === "block");
  if (hasBlock) return "block";

  const hasFlag = violations.some((v) => v.severity === "flag");
  if (hasFlag) return "flag";

  return "warn";
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ─────────────────────────────────────────────────────────────────────────────
// Batch Moderation (for profile review)
// ─────────────────────────────────────────────────────────────────────────────

export interface ProfileModerationResult {
  /** Overall pass/fail */
  action: ModerationAction;
  /** Per-field results */
  fields: {
    name: ModerationResult;
    bio: ModerationResult | null;
    prompts: ModerationResult[];
  };
}

/**
 * Moderate an entire profile at once.
 * Checks name, bio, and all prompt answers.
 */
export function moderateProfile(profile: {
  name: string;
  bio?: string | null;
  prompts?: string[];
}): ProfileModerationResult {
  const nameResult = moderateText(profile.name, "name");
  const bioResult = profile.bio ? moderateText(profile.bio, "bio") : null;
  const promptResults = (profile.prompts || []).map((p) => moderateText(p, "prompt"));

  const allResults = [nameResult, bioResult, ...promptResults].filter(
    Boolean,
  ) as ModerationResult[];

  const worstAction = allResults.reduce<ModerationAction>((worst, r) => {
    const order: ModerationAction[] = ["pass", "warn", "flag", "block"];
    return order.indexOf(r.action) > order.indexOf(worst) ? r.action : worst;
  }, "pass");

  return {
    action: worstAction,
    fields: {
      name: nameResult,
      bio: bioResult,
      prompts: promptResults,
    },
  };
}
