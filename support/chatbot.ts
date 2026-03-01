/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — AI Support Chatbot
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Rule-based chatbot that answers common queries using the FAQ database.
 * Falls back to creating a support ticket when the bot can't help.
 *
 * Architecture:
 *   User message → keyword extraction → FAQ search → ranked response
 *   If no match → "Let me connect you with a human" → create ticket
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { searchFAQ, FAQ_DATABASE, type FAQEntry } from "./faq-database";

// ─── Types ───────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: "user" | "bot" | "system";
  text: string;
  textHi?: string;
  timestamp: string;
  /** FAQ ID if this response came from the knowledge base */
  faqId?: string;
  /** Quick reply buttons */
  quickReplies?: string[];
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  resolved: boolean;
  escalatedToHuman: boolean;
  createdAt: string;
}

// ─── Intent Detection ────────────────────────────────────────────────────

type Intent =
  | "greeting"
  | "faq_query"
  | "complaint"
  | "talk_to_human"
  | "unknown";

const GREETING_PATTERNS = /^(hi|hello|hey|namaste|namaskar|help|hola|good\s?(morning|afternoon|evening))/i;
const HUMAN_PATTERNS = /(human|agent|person|real|talk|speak|call|support|help me)/i;
const COMPLAINT_PATTERNS = /(complaint|not working|broken|angry|frustrated|terrible|worst|scam|fraud)/i;

function detectIntent(text: string): Intent {
  const t = text.toLowerCase().trim();
  if (GREETING_PATTERNS.test(t)) return "greeting";
  if (HUMAN_PATTERNS.test(t)) return "talk_to_human";
  if (COMPLAINT_PATTERNS.test(t)) return "complaint";
  if (t.length > 3) return "faq_query";
  return "unknown";
}

// ─── Response Generation ─────────────────────────────────────────────────

function makeMessage(
  role: "bot" | "system",
  text: string,
  options?: { textHi?: string; faqId?: string; quickReplies?: string[] },
): ChatMessage {
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    role,
    text,
    textHi: options?.textHi,
    timestamp: new Date().toISOString(),
    faqId: options?.faqId,
    quickReplies: options?.quickReplies,
  };
}

const GREETING_RESPONSE = makeMessage("bot",
  "Hello! 👋 I'm Bandhan's support assistant. How can I help you today?",
  {
    textHi: "नमस्ते! 👋 मैं बंधन का सहायक हूँ। आज मैं आपकी कैसे मदद कर सकता हूँ?",
    quickReplies: [
      "How does matching work?",
      "I have a billing question",
      "I want to report someone",
      "Talk to a human",
    ],
  },
);

const ESCALATION_RESPONSE = makeMessage("bot",
  "I'll connect you with our support team. Please describe your issue and we'll get back to you within 24 hours. You can also email us at support@bandhan.ai.",
  {
    textHi: "मैं आपको हमारी सहायता टीम से जोड़ता हूँ। कृपया अपनी समस्या बताएं, हम 24 घंटे में जवाब देंगे।",
  },
);

const COMPLAINT_RESPONSE = makeMessage("bot",
  "I'm sorry you're having a bad experience. 😔 I want to help fix this. Let me connect you with our team right away. Can you tell me more about what happened?",
  {
    textHi: "मुझे खेद है कि आपको परेशानी हो रही है। 😔 मैं इसे ठीक करवाना चाहता हूँ। कृपया बताएं क्या हुआ?",
    quickReplies: [
      "Profile issue",
      "Payment problem",
      "Safety concern",
      "Bug report",
    ],
  },
);

const NO_MATCH_RESPONSE = makeMessage("bot",
  "I couldn't find an exact answer for that. Here are some things I can help with:",
  {
    textHi: "मुझे इसका सटीक जवाब नहीं मिला। यहाँ कुछ चीज़ें हैं जिनमें मैं मदद कर सकता हूँ:",
    quickReplies: [
      "How does matching work?",
      "Verification levels",
      "Cancel subscription",
      "Report someone",
      "Talk to a human",
    ],
  },
);

// ─── Public API ──────────────────────────────────────────────────────────

/**
 * Process a user message and return the bot's response(s).
 * May return multiple messages (e.g. FAQ answer + follow-up).
 */
export function processMessage(userText: string): ChatMessage[] {
  const intent = detectIntent(userText);

  switch (intent) {
    case "greeting":
      return [GREETING_RESPONSE];

    case "talk_to_human":
      return [ESCALATION_RESPONSE];

    case "complaint":
      return [COMPLAINT_RESPONSE];

    case "faq_query": {
      const results = searchFAQ(userText);
      if (results.length === 0) return [NO_MATCH_RESPONSE];

      const best = results[0];
      const response = makeMessage("bot", best.answer, {
        textHi: best.answerHi,
        faqId: best.id,
      });

      const followUp = makeMessage("bot", "Did that answer your question?", {
        textHi: "क्या इससे आपका सवाल हल हुआ?",
        quickReplies: ["Yes, thanks!", "No, I need more help", "Talk to a human"],
      });

      return [response, followUp];
    }

    default:
      return [NO_MATCH_RESPONSE];
  }
}

/**
 * Get the initial greeting messages when the chatbot opens.
 */
export function getWelcomeMessages(): ChatMessage[] {
  return [GREETING_RESPONSE];
}
