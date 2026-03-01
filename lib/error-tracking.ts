/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Error Tracking (Sentry Free Tier — 5,000 events/month)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Structured error monitoring using Sentry's free tier:
 *   • Frontend errors: React rendering, unhandled promises, network failures
 *   • Error grouping: By section (chat, feed, profile, auth, payment)
 *   • PII scrubbing: Phone numbers, Aadhaar, emails, tokens all redacted
 *   • DPDP compliance: No personal data ever leaves India
 *   • Budget-safe: 0.1 sample rate keeps under 5k events/month
 *
 * ARCHITECTURE:
 *   Errors flow through three layers:
 *     1. React ErrorBoundary catches render errors → calls reportError()
 *     2. window.onerror catches unhandled JS errors → calls reportError()
 *     3. Explicit try/catch in services → calls reportError()
 *
 *   reportError() then:
 *     a. Redacts PII from the error
 *     b. Enriches with context (section, network, device)
 *     c. Deduplicates (same error within 60s = 1 event)
 *     d. Sends to Sentry (if configured) OR logs to console
 *     e. Stores in local buffer for the error dashboard
 *
 * SETUP:
 *   1. Create free Sentry account: https://sentry.io/signup/
 *   2. Create a Next.js project in Sentry
 *   3. Add DSN to .env.local:
 *        NEXT_PUBLIC_SENTRY_DSN=https://xxxx@oxxxxx.ingest.sentry.io/xxxxx
 *   4. This module auto-initializes when imported
 *
 * BUDGET OPTIMIZATION (stay under 5,000 events/month):
 *   • Sample rate: 0.1 (10% of errors sent to Sentry)
 *   • Deduplication: Same error within 60s counted as 1
 *   • Ignored errors: Network timeouts on 2G, ResizeObserver, extensions
 *   • Only production: No errors sent in development
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { redactPII, redactPIIFromObject } from "@/lib/security";
import { getNetworkTier, getDeviceMemory, getConnectionInfo } from "@/lib/performance";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ErrorSeverity = "fatal" | "error" | "warning" | "info";

export type ErrorSection =
  | "auth"
  | "chat"
  | "discovery"
  | "profile"
  | "matches"
  | "payment"
  | "notification"
  | "safety"
  | "general";

export interface ErrorReport {
  /** Short unique ID for user-facing reference (e.g. "EB-ABC123") */
  id: string;
  /** PII-redacted error message */
  message: string;
  /** PII-redacted stack trace */
  stack: string;
  /** App section where error occurred */
  section: ErrorSection;
  /** Error severity level */
  severity: ErrorSeverity;
  /** ISO timestamp */
  timestamp: string;
  /** Current URL path (no query params) */
  url: string;
  /** Network tier at time of error */
  networkTier: string;
  /** Device memory in GB */
  deviceMemoryGb: number;
  /** Additional context (all values PII-redacted) */
  context: Record<string, unknown>;
  /** Whether this was sent to Sentry */
  sentToSentry: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || "";
const IS_PRODUCTION = process.env.NODE_ENV === "production";

/**
 * Sample rate: 10% of errors are sent to Sentry.
 * With ~1,000 daily users, this keeps us well under 5,000 events/month.
 * Adjust up if user base is smaller, down if larger.
 */
const SAMPLE_RATE = 0.1;

/** Deduplication window: same error message within 60s = 1 event */
const DEDUP_WINDOW_MS = 60_000;

/** Max local error buffer size */
const MAX_LOCAL_ERRORS = 100;

/** Errors to completely ignore (browser noise, not our bugs) */
const IGNORED_ERRORS = [
  // Browser APIs that fire benign errors
  "ResizeObserver loop",
  "ResizeObserver loop completed with undelivered notifications",
  // Network errors on very slow connections (not actionable)
  "Failed to fetch",
  "Load failed",
  "NetworkError",
  "AbortError",
  "TypeError: cancelled",
  // Browser extensions injecting errors
  "chrome-extension://",
  "moz-extension://",
  "safari-extension://",
  // Third-party script errors (can't fix)
  "Script error.",
  "Script error",
  // Next.js dev-mode hydration (harmless in dev)
  "Hydration failed because the initial UI",
  "There was an error while hydrating",
  "Text content does not match",
];

// ─────────────────────────────────────────────────────────────────────────────
// State
// ─────────────────────────────────────────────────────────────────────────────

let _initialized = false;
const _recentErrors = new Map<string, number>(); // message → timestamp
const _errorBuffer: ErrorReport[] = [];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function generateErrorId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `EB-${ts}-${rand}`;
}

function shouldIgnore(message: string): boolean {
  return IGNORED_ERRORS.some((pattern) => message.includes(pattern));
}

function isDuplicate(message: string): boolean {
  const now = Date.now();
  const lastSeen = _recentErrors.get(message);
  if (lastSeen && now - lastSeen < DEDUP_WINDOW_MS) {
    return true;
  }
  _recentErrors.set(message, now);
  // Cleanup old entries
  if (_recentErrors.size > 200) {
    const cutoff = now - DEDUP_WINDOW_MS;
    for (const [key, ts] of _recentErrors) {
      if (ts < cutoff) _recentErrors.delete(key);
    }
  }
  return false;
}

function shouldSample(): boolean {
  return Math.random() < SAMPLE_RATE;
}

function getCurrentPath(): string {
  if (typeof window === "undefined") return "";
  // Strip query params and hash (may contain PII)
  return window.location.pathname;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sentry Integration (Lightweight)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Send an error to Sentry using their envelope API.
 * This avoids importing the full Sentry SDK (~30KB).
 * We construct a minimal Sentry envelope ourselves.
 */
async function sendToSentry(report: ErrorReport): Promise<boolean> {
  if (!SENTRY_DSN || !IS_PRODUCTION) return false;

  try {
    // Parse DSN: https://{key}@{host}/{projectId}
    const dsnUrl = new URL(SENTRY_DSN);
    const key = dsnUrl.username;
    const projectId = dsnUrl.pathname.slice(1);
    const host = dsnUrl.hostname;

    const envelopeUrl = `https://${host}/api/${projectId}/envelope/`;

    // Sentry envelope format: header\nitem_header\npayload
    const envelopeHeader = JSON.stringify({
      event_id: report.id.replace(/[^a-f0-9]/gi, "").padEnd(32, "0").slice(0, 32),
      dsn: SENTRY_DSN,
      sent_at: new Date().toISOString(),
    });

    const itemHeader = JSON.stringify({
      type: "event",
      content_type: "application/json",
    });

    const eventPayload = JSON.stringify({
      event_id: report.id.replace(/[^a-f0-9]/gi, "").padEnd(32, "0").slice(0, 32),
      timestamp: report.timestamp,
      platform: "javascript",
      level: report.severity,
      logger: `bandhan.${report.section}`,
      message: { formatted: report.message },
      exception: report.stack
        ? {
            values: [
              {
                type: "Error",
                value: report.message,
                stacktrace: { frames: parseStackFrames(report.stack) },
              },
            ],
          }
        : undefined,
      tags: {
        section: report.section,
        network: report.networkTier,
        device_memory: String(report.deviceMemoryGb),
      },
      contexts: {
        device: {
          memory_size: report.deviceMemoryGb * 1024 * 1024 * 1024,
        },
        browser: {
          name: getBrowserName(),
        },
      },
      extra: report.context,
      request: {
        url: report.url,
      },
      environment: IS_PRODUCTION ? "production" : "development",
    });

    const envelope = `${envelopeHeader}\n${itemHeader}\n${eventPayload}`;

    const response = await fetch(envelopeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=UTF-8",
        "X-Sentry-Auth": `Sentry sentry_version=7, sentry_client=bandhan/1.0, sentry_key=${key}`,
      },
      body: envelope,
    });

    return response.ok;
  } catch {
    // Sending to Sentry failed — don't cascade
    return false;
  }
}

function parseStackFrames(
  stack: string,
): { filename: string; function: string; lineno: number; colno: number }[] {
  if (!stack) return [];
  return stack
    .split("\n")
    .filter((line) => line.includes("at ") || line.includes("@"))
    .slice(0, 10) // Top 10 frames only
    .map((line) => {
      const match = line.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/) ||
        line.match(/at\s+(.+?):(\d+):(\d+)/);
      if (match) {
        return {
          function: match[1] || "<anonymous>",
          filename: match[2] || "",
          lineno: parseInt(match[3] || "0", 10),
          colno: parseInt(match[4] || "0", 10),
        };
      }
      return { function: line.trim(), filename: "", lineno: 0, colno: 0 };
    });
}

function getBrowserName(): string {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari")) return "Safari";
  if (ua.includes("Edge")) return "Edge";
  return "Other";
}

// ─────────────────────────────────────────────────────────────────────────────
// Core API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Report an error to the tracking system.
 *
 * This is the single entry point for ALL error reporting in the app.
 * It handles PII redaction, deduplication, sampling, and dispatch.
 *
 * @example
 *   try {
 *     await createMatch(userId);
 *   } catch (err) {
 *     reportError(err as Error, 'matches', 'error', { userId });
 *   }
 */
export async function reportError(
  error: Error | string,
  section: ErrorSection = "general",
  severity: ErrorSeverity = "error",
  context: Record<string, unknown> = {},
): Promise<ErrorReport | null> {
  const message = typeof error === "string" ? error : error.message || "Unknown error";
  const stack = typeof error === "string" ? "" : error.stack || "";

  // ── 1. Ignore known noise ──
  if (shouldIgnore(message)) return null;

  // ── 2. Deduplicate (same error within 60s) ──
  if (isDuplicate(message)) return null;

  // ── 3. Redact PII ──
  const safeMessage = redactPII(message);
  const safeStack = redactPII(stack);
  const safeContext = redactPIIFromObject(context) as Record<string, unknown>;

  // ── 4. Enrich with device/network context ──
  const report: ErrorReport = {
    id: generateErrorId(),
    message: safeMessage,
    stack: safeStack,
    section,
    severity,
    timestamp: new Date().toISOString(),
    url: getCurrentPath(),
    networkTier: getNetworkTier(),
    deviceMemoryGb: getDeviceMemory(),
    context: safeContext,
    sentToSentry: false,
  };

  // ── 5. Store locally (always) ──
  _errorBuffer.push(report);
  if (_errorBuffer.length > MAX_LOCAL_ERRORS) {
    _errorBuffer.shift();
  }

  // ── 6. Console log (always, PII-safe) ──
  const logFn = severity === "fatal" || severity === "error" ? console.error : console.warn;
  logFn(
    `[Bandhan:${section}] ${report.id}: ${safeMessage}`,
    IS_PRODUCTION ? "" : safeContext,
  );

  // ── 7. Send to Sentry (sampled, production only) ──
  if (IS_PRODUCTION && SENTRY_DSN && shouldSample()) {
    report.sentToSentry = await sendToSentry(report);
  }

  return report;
}

/**
 * Report an error from a caught exception with automatic section detection.
 */
export function captureException(
  error: unknown,
  section?: ErrorSection,
  context?: Record<string, unknown>,
): void {
  if (error instanceof Error) {
    reportError(error, section, "error", context);
  } else {
    reportError(String(error), section, "error", context);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Global Error Handlers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Initialize global error handlers.
 * Call once from PerfInit or root layout.
 *
 * Registers:
 *   - window.onerror for uncaught JS errors
 *   - window.onunhandledrejection for unhandled Promise rejections
 *   - window.__BANDHAN_REPORT_ERROR for ErrorBoundary integration
 */
export function initErrorTracking(): void {
  if (typeof window === "undefined") return;
  if (_initialized) return;
  _initialized = true;

  // ── Uncaught JS errors ──
  window.addEventListener("error", (event) => {
    reportError(
      event.error || new Error(event.message),
      "general",
      "error",
      {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    );
  });

  // ── Unhandled promise rejections ──
  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    const error =
      reason instanceof Error ? reason : new Error(String(reason));
    reportError(error, "general", "error", {
      type: "unhandled_promise_rejection",
    });
  });

  // ── ErrorBoundary hook (used by components/ErrorBoundary.tsx) ──
  (window as any).__BANDHAN_REPORT_ERROR = (data: {
    errorId?: string;
    message: string;
    stack: string;
    componentStack?: string;
    section?: string;
    url?: string;
    timestamp?: string;
  }) => {
    reportError(
      new Error(data.message),
      (data.section as ErrorSection) || "general",
      "error",
      {
        errorId: data.errorId,
        componentStack: data.componentStack,
      },
    );
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Error Dashboard Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Get all errors stored in the local buffer. */
export function getRecentErrors(): Readonly<ErrorReport[]> {
  return [..._errorBuffer];
}

/** Get errors grouped by section. */
export function getErrorsBySection(): Record<ErrorSection, ErrorReport[]> {
  const grouped: Record<string, ErrorReport[]> = {};
  for (const err of _errorBuffer) {
    if (!grouped[err.section]) grouped[err.section] = [];
    grouped[err.section].push(err);
  }
  return grouped as Record<ErrorSection, ErrorReport[]>;
}

/** Get error count by severity. */
export function getErrorCountBySeverity(): Record<ErrorSeverity, number> {
  const counts: Record<string, number> = { fatal: 0, error: 0, warning: 0, info: 0 };
  for (const err of _errorBuffer) {
    counts[err.severity] = (counts[err.severity] || 0) + 1;
  }
  return counts as Record<ErrorSeverity, number>;
}

/** Clear the local error buffer. */
export function clearErrorBuffer(): void {
  _errorBuffer.length = 0;
}

/** Log a summary of recent errors to console. */
export function logErrorSummary(): void {
  if (typeof console === "undefined") return;
  const bySection = getErrorsBySection();
  const bySeverity = getErrorCountBySeverity();

  // eslint-disable-next-line no-console
  console.group("%c🐛 Error Summary", "font-weight: bold; font-size: 14px;");
  // eslint-disable-next-line no-console
  console.log(`Total errors: ${_errorBuffer.length}`);
  // eslint-disable-next-line no-console
  console.table(bySeverity);
  // eslint-disable-next-line no-console
  console.log("\nBy section:");
  for (const [section, errors] of Object.entries(bySection)) {
    // eslint-disable-next-line no-console
    console.log(`  ${section}: ${errors.length}`);
  }
  // eslint-disable-next-line no-console
  console.groupEnd();
}
