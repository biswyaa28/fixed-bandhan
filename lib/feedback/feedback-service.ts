/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Feedback Service
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Handles submission, storage, categorisation, and retrieval of user feedback.
 * localStorage for demo; Firestore in production.
 *
 * Feedback types:
 *   • in_app      — floating button on every screen
 *   • nps         — Net Promoter Score (triggered Day 7)
 *   • bug_report  — with optional screenshot
 *   • feature_req — categorised by popularity
 *   • testimonial — success stories / positive feedback
 *   • exit_survey — when user deletes account
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { trackEvent } from "@/lib/analytics";

// ─── Types ───────────────────────────────────────────────────────────────

export type FeedbackType =
  | "in_app"
  | "nps"
  | "bug_report"
  | "feature_request"
  | "testimonial"
  | "exit_survey";

export type FeedbackCategory =
  | "matching"
  | "chat"
  | "profile"
  | "safety"
  | "billing"
  | "performance"
  | "ui_ux"
  | "verification"
  | "general";

export type FeedbackStatus =
  | "new"
  | "reviewed"
  | "in_progress"
  | "shipped"
  | "wont_fix"
  | "duplicate";

export type FeedbackSentiment = "positive" | "neutral" | "negative";

export interface FeedbackEntry {
  id: string;
  userId: string;
  userName: string;
  type: FeedbackType;
  category: FeedbackCategory;
  /** 1-5 star rating (optional, mainly for in_app + nps) */
  rating: number | null;
  /** NPS score 0-10 (only for nps type) */
  npsScore: number | null;
  /** Free-text message */
  message: string;
  /** Optional screenshot (base64 data URL or storage URL) */
  screenshotUrl: string | null;
  /** Where in the app the feedback was triggered */
  screenPath: string;
  /** Auto-detected sentiment */
  sentiment: FeedbackSentiment;
  status: FeedbackStatus;
  /** Admin response (if any) */
  adminResponse: string | null;
  /** Upvote count (for feature requests) */
  upvotes: number;
  createdAt: string;
  updatedAt: string;
  /** App metadata */
  metadata: {
    appVersion: string;
    platform: string;
    language: string;
  };
}

export interface FeedbackStats {
  total: number;
  byType: Record<FeedbackType, number>;
  byStatus: Record<FeedbackStatus, number>;
  bySentiment: Record<FeedbackSentiment, number>;
  avgRating: number;
  npsScore: number; // -100 to +100
  topFeatureRequests: { message: string; upvotes: number }[];
}

// ─── Storage ─────────────────────────────────────────────────────────────

const FEEDBACK_KEY = "bandhan_feedback";
const NPS_PROMPTED_KEY = "bandhan_nps_prompted_at";

function loadFeedback(): FeedbackEntry[] {
  if (typeof localStorage === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(FEEDBACK_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveFeedback(entries: FeedbackEntry[]): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(entries));
  } catch {
    /* storage full — silent */
  }
}

// ─── Sentiment Detection (simple keyword-based) ─────────────────────────

const POSITIVE_WORDS = /\b(love|great|amazing|awesome|perfect|thank|good|excellent|nice|wonderful|best|happy|helpful)\b/i;
const NEGATIVE_WORDS = /\b(hate|terrible|awful|worst|bad|broken|bug|crash|slow|ugly|annoying|frustrated|angry|useless|scam)\b/i;

function detectSentiment(text: string): FeedbackSentiment {
  const posMatch = text.match(POSITIVE_WORDS);
  const negMatch = text.match(NEGATIVE_WORDS);
  if (posMatch && !negMatch) return "positive";
  if (negMatch && !posMatch) return "negative";
  if (posMatch && negMatch) return "neutral";
  return "neutral";
}

// ─── ID Generator ────────────────────────────────────────────────────────

let _counter = Date.now();
function generateId(prefix: string): string {
  return `${prefix}-${(++_counter).toString(36).toUpperCase()}`;
}

// ─── Public API ──────────────────────────────────────────────────────────

/**
 * Submit a new feedback entry.
 */
export function submitFeedback(data: {
  userId: string;
  userName: string;
  type: FeedbackType;
  category: FeedbackCategory;
  rating?: number;
  npsScore?: number;
  message: string;
  screenshotUrl?: string;
  screenPath: string;
}): FeedbackEntry {
  const entry: FeedbackEntry = {
    id: generateId("FB"),
    userId: data.userId,
    userName: data.userName,
    type: data.type,
    category: data.category,
    rating: data.rating ?? null,
    npsScore: data.npsScore ?? null,
    message: data.message,
    screenshotUrl: data.screenshotUrl ?? null,
    screenPath: data.screenPath,
    sentiment: detectSentiment(data.message),
    status: "new",
    adminResponse: null,
    upvotes: data.type === "feature_request" ? 1 : 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      appVersion: "1.0.0",
      platform: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 100) : "unknown",
      language: typeof navigator !== "undefined" ? navigator.language : "en",
    },
  };

  const entries = loadFeedback();
  entries.unshift(entry);
  saveFeedback(entries);

  // Analytics
  trackEvent("feedback_submitted", {
    type: data.type,
    category: data.category,
    sentiment: entry.sentiment,
    rating: data.rating ?? 0,
    nps_score: data.npsScore ?? -1,
  });

  return entry;
}

/**
 * Get all feedback, optionally filtered.
 */
export function getFeedback(filters?: {
  type?: FeedbackType;
  status?: FeedbackStatus;
  category?: FeedbackCategory;
  sentiment?: FeedbackSentiment;
  userId?: string;
}): FeedbackEntry[] {
  let entries = loadFeedback();
  if (filters) {
    if (filters.type) entries = entries.filter((e) => e.type === filters.type);
    if (filters.status) entries = entries.filter((e) => e.status === filters.status);
    if (filters.category) entries = entries.filter((e) => e.category === filters.category);
    if (filters.sentiment) entries = entries.filter((e) => e.sentiment === filters.sentiment);
    if (filters.userId) entries = entries.filter((e) => e.userId === filters.userId);
  }
  return entries;
}

/**
 * Update feedback status (admin action).
 */
export function updateFeedbackStatus(
  feedbackId: string,
  status: FeedbackStatus,
  adminResponse?: string,
): FeedbackEntry | null {
  const entries = loadFeedback();
  const entry = entries.find((e) => e.id === feedbackId);
  if (!entry) return null;

  entry.status = status;
  entry.updatedAt = new Date().toISOString();
  if (adminResponse) entry.adminResponse = adminResponse;

  saveFeedback(entries);
  return entry;
}

/**
 * Upvote a feature request.
 */
export function upvoteFeatureRequest(feedbackId: string): FeedbackEntry | null {
  const entries = loadFeedback();
  const entry = entries.find((e) => e.id === feedbackId);
  if (!entry || entry.type !== "feature_request") return null;

  entry.upvotes += 1;
  entry.updatedAt = new Date().toISOString();
  saveFeedback(entries);
  return entry;
}

/**
 * Compute aggregate feedback stats.
 */
export function getFeedbackStats(): FeedbackStats {
  const entries = loadFeedback();

  const byType = {} as Record<FeedbackType, number>;
  const byStatus = {} as Record<FeedbackStatus, number>;
  const bySentiment = {} as Record<FeedbackSentiment, number>;

  (["in_app", "nps", "bug_report", "feature_request", "testimonial", "exit_survey"] as FeedbackType[]).forEach((t) => (byType[t] = 0));
  (["new", "reviewed", "in_progress", "shipped", "wont_fix", "duplicate"] as FeedbackStatus[]).forEach((s) => (byStatus[s] = 0));
  (["positive", "neutral", "negative"] as FeedbackSentiment[]).forEach((s) => (bySentiment[s] = 0));

  let ratingSum = 0;
  let ratingCount = 0;
  let npsPromoters = 0;
  let npsDetractors = 0;
  let npsTotal = 0;

  for (const entry of entries) {
    byType[entry.type] = (byType[entry.type] || 0) + 1;
    byStatus[entry.status] = (byStatus[entry.status] || 0) + 1;
    bySentiment[entry.sentiment] = (bySentiment[entry.sentiment] || 0) + 1;

    if (entry.rating !== null) {
      ratingSum += entry.rating;
      ratingCount++;
    }
    if (entry.npsScore !== null) {
      npsTotal++;
      if (entry.npsScore >= 9) npsPromoters++;
      else if (entry.npsScore <= 6) npsDetractors++;
    }
  }

  const featureRequests = entries
    .filter((e) => e.type === "feature_request")
    .sort((a, b) => b.upvotes - a.upvotes)
    .slice(0, 5)
    .map((e) => ({ message: e.message, upvotes: e.upvotes }));

  return {
    total: entries.length,
    byType,
    byStatus,
    bySentiment,
    avgRating: ratingCount > 0 ? Math.round((ratingSum / ratingCount) * 10) / 10 : 0,
    npsScore: npsTotal > 0 ? Math.round(((npsPromoters - npsDetractors) / npsTotal) * 100) : 0,
    topFeatureRequests: featureRequests,
  };
}

/**
 * Check whether we should prompt the NPS survey.
 * Rules: after 7 days of usage, max once per 90 days.
 */
export function shouldPromptNPS(userCreatedAt: string): boolean {
  if (typeof localStorage === "undefined") return false;

  const createdMs = new Date(userCreatedAt).getTime();
  const daysSinceCreation = (Date.now() - createdMs) / (1000 * 60 * 60 * 24);
  if (daysSinceCreation < 7) return false;

  const lastPrompted = localStorage.getItem(NPS_PROMPTED_KEY);
  if (lastPrompted) {
    const daysSincePrompt = (Date.now() - new Date(lastPrompted).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSincePrompt < 90) return false;
  }

  return true;
}

/**
 * Record that NPS was prompted (regardless of whether user responded).
 */
export function markNPSPrompted(): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(NPS_PROMPTED_KEY, new Date().toISOString());
}
