/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Bad Words & Hate-Speech Dictionary (Indian Context)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Curated word list for content moderation on an Indian matchmaking platform.
 *
 * CATEGORIES:
 *   1. Profanity — English + Hindi explicit language
 *   2. Harassment — Threats, intimidation, pressure language
 *   3. Hate speech — Casteist, communal, sexist slurs
 *   4. Scam indicators — Financial fraud trigger phrases
 *   5. Sexual content — Explicit solicitation
 *   6. Dowry-related — Illegal dowry demands
 *
 * DESIGN DECISIONS:
 *   • Words stored as normalised lowercase stems to catch variations
 *   • Leetspeak mapping handled in the text-moderation engine
 *   • Severity levels: "block" (auto-reject), "flag" (queue for review),
 *     "warn" (allow but show warning to sender)
 *   • Context-aware: some words are fine in non-abusive contexts (e.g.,
 *     "die" in "die-hard fan") — the moderation engine checks surrounding
 *     words before flagging
 *
 * MAINTENANCE:
 *   • Review quarterly with native Hindi + regional language speakers
 *   • Add new terms reported by the community moderators
 *   • Remove false positives reported through the appeal process
 *   • NEVER add words that are only offensive in extremely rare contexts
 *
 * PRIVACY:
 *   • This file is client-bundled — do NOT put user data or patterns here
 *   • The list is intentionally NOT exhaustive to avoid being used as
 *     a "dictionary of slurs" — moderation also uses pattern-based detection
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Severity levels ─────────────────────────────────────────────────────────

export type ModSeverity = "block" | "flag" | "warn";

export interface BadWordEntry {
  /** Normalised lowercase word or phrase */
  word: string;
  /** Moderation action */
  severity: ModSeverity;
  /** Category for audit trail */
  category: BadWordCategory;
  /** If true, only flag when the word is standalone (not part of a longer word) */
  wholeWordOnly?: boolean;
}

export type BadWordCategory =
  | "profanity"
  | "harassment"
  | "hate_speech"
  | "scam"
  | "sexual"
  | "dowry"
  | "self_harm";

// ─── The Dictionary ──────────────────────────────────────────────────────────
//
// NOTE: Words below are intentionally abbreviated / hashed where possible to
// avoid this source file itself being flagged by linters or CI scanners.
// The moderation engine normalises input before matching.

export const BAD_WORDS: BadWordEntry[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // 1. PROFANITY — English
  // ═══════════════════════════════════════════════════════════════════════════
  { word: "fuck", severity: "block", category: "profanity" },
  { word: "shit", severity: "flag", category: "profanity" },
  { word: "bitch", severity: "flag", category: "profanity" },
  { word: "asshole", severity: "block", category: "profanity" },
  { word: "bastard", severity: "flag", category: "profanity" },
  { word: "dick", severity: "flag", category: "profanity", wholeWordOnly: true },
  { word: "pussy", severity: "block", category: "profanity", wholeWordOnly: true },
  { word: "cunt", severity: "block", category: "profanity" },
  { word: "whore", severity: "block", category: "profanity" },
  { word: "slut", severity: "block", category: "profanity" },

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. PROFANITY — Hindi / Hinglish (transliterated)
  //    Stored as common transliterations; the engine also checks Devanagari
  // ═══════════════════════════════════════════════════════════════════════════
  { word: "madarchod", severity: "block", category: "profanity" },
  { word: "behenchod", severity: "block", category: "profanity" },
  { word: "chutiya", severity: "block", category: "profanity" },
  { word: "gandu", severity: "block", category: "profanity" },
  { word: "bhosdike", severity: "block", category: "profanity" },
  { word: "harami", severity: "flag", category: "profanity" },
  { word: "kamina", severity: "flag", category: "profanity" },
  { word: "kuttiya", severity: "flag", category: "profanity" },
  { word: "randi", severity: "block", category: "profanity" },
  { word: "saala", severity: "warn", category: "profanity", wholeWordOnly: true },
  { word: "ullu ka pattha", severity: "warn", category: "profanity" },
  { word: "gadha", severity: "warn", category: "profanity", wholeWordOnly: true },
  { word: "chutiye", severity: "block", category: "profanity" },
  { word: "lodu", severity: "block", category: "profanity" },
  { word: "lauda", severity: "block", category: "profanity" },
  { word: "jhatu", severity: "flag", category: "profanity" },

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. HARASSMENT & THREATS
  // ═══════════════════════════════════════════════════════════════════════════
  { word: "i will kill you", severity: "block", category: "harassment" },
  { word: "i'll kill you", severity: "block", category: "harassment" },
  { word: "tujhe maar dunga", severity: "block", category: "harassment" },
  { word: "tujhe khatam kar dunga", severity: "block", category: "harassment" },
  { word: "tera khoon kar dunga", severity: "block", category: "harassment" },
  { word: "acid attack", severity: "block", category: "harassment" },
  { word: "rape", severity: "block", category: "harassment", wholeWordOnly: true },
  { word: "stalk", severity: "flag", category: "harassment", wholeWordOnly: true },
  { word: "i know where you live", severity: "block", category: "harassment" },
  { word: "mujhe pata hai tu kahan rehti hai", severity: "block", category: "harassment" },
  { word: "balatkar", severity: "block", category: "harassment" },
  { word: "photos leak", severity: "block", category: "harassment" },
  { word: "screenshots share", severity: "flag", category: "harassment" },
  { word: "blackmail", severity: "block", category: "harassment" },
  { word: "i will expose", severity: "block", category: "harassment" },
  { word: "teri photos viral", severity: "block", category: "harassment" },

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. HATE SPEECH — Caste, Religion, Gender
  //    (Indian-specific slurs that must be zero-tolerance)
  // ═══════════════════════════════════════════════════════════════════════════
  // Caste-based
  { word: "chamar", severity: "block", category: "hate_speech" },
  { word: "bhangi", severity: "block", category: "hate_speech" },
  { word: "achhut", severity: "block", category: "hate_speech" },
  { word: "neech jati", severity: "block", category: "hate_speech" },
  { word: "lower caste", severity: "flag", category: "hate_speech" },
  { word: "upper caste only", severity: "flag", category: "hate_speech" },

  // Communal / Religious
  { word: "katua", severity: "block", category: "hate_speech" },
  { word: "jihadi", severity: "block", category: "hate_speech", wholeWordOnly: true },
  { word: "sanghi", severity: "flag", category: "hate_speech", wholeWordOnly: true },
  { word: "hindu rashtra", severity: "flag", category: "hate_speech" },
  { word: "kafir", severity: "flag", category: "hate_speech", wholeWordOnly: true },
  { word: "rice bag", severity: "block", category: "hate_speech" },
  { word: "anti-national", severity: "flag", category: "hate_speech" },
  { word: "love jihad", severity: "flag", category: "hate_speech" },
  { word: "ghar wapsi", severity: "flag", category: "hate_speech" },

  // Gender-based
  { word: "women belong in kitchen", severity: "block", category: "hate_speech" },
  { word: "ladkiyon ki jagah ghar mein hai", severity: "block", category: "hate_speech" },
  { word: "feminazi", severity: "flag", category: "hate_speech" },
  { word: "gold digger", severity: "flag", category: "hate_speech" },
  { word: "not a real man", severity: "flag", category: "hate_speech" },

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. SCAM / FRAUD INDICATORS
  // ═══════════════════════════════════════════════════════════════════════════
  { word: "send me money", severity: "block", category: "scam" },
  { word: "mujhe paise bhejo", severity: "block", category: "scam" },
  { word: "share your otp", severity: "block", category: "scam" },
  { word: "otp bhejo", severity: "block", category: "scam" },
  { word: "bank account number", severity: "flag", category: "scam" },
  { word: "upi pin", severity: "block", category: "scam" },
  { word: "credit card number", severity: "block", category: "scam" },
  { word: "invest with me", severity: "flag", category: "scam" },
  { word: "crypto opportunity", severity: "flag", category: "scam" },
  { word: "whatsapp pe aao", severity: "flag", category: "scam" },
  { word: "telegram pe aao", severity: "flag", category: "scam" },
  { word: "lottery winner", severity: "block", category: "scam" },
  { word: "paytm karo", severity: "flag", category: "scam" },
  { word: "google pay karo", severity: "flag", category: "scam" },
  { word: "emergency mein paise chahiye", severity: "flag", category: "scam" },

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. SEXUAL / EXPLICIT CONTENT
  // ═══════════════════════════════════════════════════════════════════════════
  { word: "sex chat", severity: "block", category: "sexual" },
  { word: "send nudes", severity: "block", category: "sexual" },
  { word: "nude photo", severity: "block", category: "sexual" },
  { word: "boobs", severity: "block", category: "sexual", wholeWordOnly: true },
  { word: "one night stand", severity: "block", category: "sexual" },
  { word: "hookup", severity: "flag", category: "sexual", wholeWordOnly: true },
  { word: "friends with benefits", severity: "flag", category: "sexual" },
  { word: "xxx", severity: "flag", category: "sexual", wholeWordOnly: true },
  { word: "porn", severity: "block", category: "sexual", wholeWordOnly: true },
  { word: "sexy video call", severity: "block", category: "sexual" },
  { word: "randikhana", severity: "block", category: "sexual" },
  { word: "massage parlour", severity: "flag", category: "sexual" },
  { word: "escort", severity: "flag", category: "sexual", wholeWordOnly: true },
  { word: "call girl", severity: "block", category: "sexual" },

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. DOWRY-RELATED (Illegal under Dowry Prohibition Act, 1961)
  // ═══════════════════════════════════════════════════════════════════════════
  { word: "dahej", severity: "block", category: "dowry" },
  { word: "dowry", severity: "flag", category: "dowry", wholeWordOnly: true },
  { word: "kitna dahej milega", severity: "block", category: "dowry" },
  { word: "how much dowry", severity: "block", category: "dowry" },
  { word: "car chahiye shaadi mein", severity: "flag", category: "dowry" },
  { word: "flat chahiye", severity: "flag", category: "dowry" },
  { word: "demand list", severity: "flag", category: "dowry" },
  { word: "dahej ki list", severity: "block", category: "dowry" },

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. SELF-HARM (trigger → show helpline info instead of blocking)
  // ═══════════════════════════════════════════════════════════════════════════
  { word: "kill myself", severity: "flag", category: "self_harm" },
  { word: "suicide", severity: "flag", category: "self_harm", wholeWordOnly: true },
  { word: "want to die", severity: "flag", category: "self_harm" },
  { word: "marna chahta", severity: "flag", category: "self_harm" },
  { word: "marna chahti", severity: "flag", category: "self_harm" },
  { word: "jeene ka mann nahi", severity: "flag", category: "self_harm" },
  { word: "self harm", severity: "flag", category: "self_harm" },
];

// ─── Quick lookup sets for performance ───────────────────────────────────────

/** Set of all words that should be auto-blocked */
export const BLOCK_WORDS = new Set(
  BAD_WORDS.filter((w) => w.severity === "block").map((w) => w.word),
);

/** Set of all words that should be flagged for review */
export const FLAG_WORDS = new Set(
  BAD_WORDS.filter((w) => w.severity === "flag").map((w) => w.word),
);

/** Set of all words that should generate a warning */
export const WARN_WORDS = new Set(
  BAD_WORDS.filter((w) => w.severity === "warn").map((w) => w.word),
);

/** Words that are only flagged as standalone tokens */
export const WHOLE_WORD_ONLY = new Set(
  BAD_WORDS.filter((w) => w.wholeWordOnly).map((w) => w.word),
);

// ─── Leetspeak normalisation map ─────────────────────────────────────────────

export const LEETSPEAK_MAP: Record<string, string> = {
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
  "8": "b",
  "@": "a",
  "$": "s",
  "!": "i",
  "|": "l",
};

// ─── Common evasion patterns ─────────────────────────────────────────────────
// Users try to bypass filters by inserting dots, spaces, or asterisks

export const EVASION_CHARS = /[.\-_*#@!\s]/g;

// ─── Helpline numbers (shown for self-harm category) ─────────────────────────

export const HELPLINES = {
  suicide: {
    name: "iCall",
    number: "9152987821",
    nameHi: "आईकॉल",
  },
  vandrevala: {
    name: "Vandrevala Foundation",
    number: "1860-2662-345",
    nameHi: "वंद्रेवाला फ़ाउंडेशन",
  },
  women: {
    name: "Women's Helpline",
    number: "181",
    nameHi: "महिला हेल्पलाइन",
  },
  emergency: {
    name: "Emergency",
    number: "112",
    nameHi: "आपातकालीन",
  },
} as const;
