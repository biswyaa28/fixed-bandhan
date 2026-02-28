/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — React Error Boundary (Client-Side)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Wraps subtrees that might throw. Catches rendering errors and:
 *   1. Displays a comic-book-styled fallback UI
 *   2. Logs the error with PII redacted
 *   3. Provides a "Try Again" button to recover
 *   4. Optional: reports to an error service (Sentry-shaped API)
 *
 * Usage:
 *   <ErrorBoundary fallback="chat">
 *     <ChatMessages />
 *   </ErrorBoundary>
 *
 *   <ErrorBoundary>
 *     <DiscoveryFeed />
 *   </ErrorBoundary>
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { redactPII } from "@/lib/security";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ErrorBoundaryProps {
  children: ReactNode;
  /**
   * Which section this boundary wraps. Used in error reporting
   * to group issues by feature area.
   */
  fallback?: "page" | "chat" | "feed" | "profile" | "generic";
  /**
   * Optional: Custom fallback UI to render instead of default.
   */
  fallbackRender?: (props: { error: Error; reset: () => void }) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Fallback messages per section
// ─────────────────────────────────────────────────────────────────────────────

const FALLBACK_TEXT: Record<
  string,
  { en: string; hi: string }
> = {
  page: {
    en: "This page encountered an error.",
    hi: "इस पृष्ठ में कोई त्रुटि आई।",
  },
  chat: {
    en: "Chat couldn't load. Your messages are safe.",
    hi: "चैट लोड नहीं हो सका। आपके संदेश सुरक्षित हैं।",
  },
  feed: {
    en: "Discovery feed had a problem loading.",
    hi: "डिस्कवरी फ़ीड लोड करने में समस्या आई।",
  },
  profile: {
    en: "Profile couldn't load right now.",
    hi: "प्रोफ़ाइल अभी लोड नहीं हो सका।",
  },
  generic: {
    en: "Something went wrong.",
    hi: "कुछ गलत हो गया।",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Error Boundary Component
// ─────────────────────────────────────────────────────────────────────────────

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: "",
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Generate a short error ID for support reference
    const errorId = `EB-${Date.now().toString(36).toUpperCase()}`;
    return { hasError: true, error, errorId };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const section = this.props.fallback || "generic";

    // ── Redact PII before logging ──
    const safeMessage = redactPII(error.message);
    const safeStack = redactPII(error.stack || "");
    const safeComponentStack = redactPII(errorInfo.componentStack || "");

    // ── Console log (PII-safe) ──
    console.error(
      `[ErrorBoundary:${section}] ${this.state.errorId}`,
      safeMessage,
    );

    if (process.env.NODE_ENV === "development") {
      console.error("[ErrorBoundary] Stack:", safeStack);
      console.error("[ErrorBoundary] Component Stack:", safeComponentStack);
    }

    // ── Report to error service (if available) ──
    // This is a lightweight, Sentry-compatible reporter.
    // It calls window.__BANDHAN_REPORT_ERROR if registered by an error SDK.
    if (typeof window !== "undefined" && (window as any).__BANDHAN_REPORT_ERROR) {
      try {
        (window as any).__BANDHAN_REPORT_ERROR({
          errorId: this.state.errorId,
          message: safeMessage,
          stack: safeStack,
          componentStack: safeComponentStack,
          section,
          url: window.location.href,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        });
      } catch {
        // Reporting itself failed — don't cascade
      }
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorId: "" });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    // ── Custom fallback UI ──
    if (this.props.fallbackRender && this.state.error) {
      return this.props.fallbackRender({
        error: this.state.error,
        reset: this.handleReset,
      });
    }

    // ── Default fallback UI (comic book style) ──
    const section = this.props.fallback || "generic";
    const text = FALLBACK_TEXT[section] || FALLBACK_TEXT.generic;

    return (
      <div
        className="flex items-center justify-center p-6 min-h-[200px]"
        role="alert"
        aria-live="assertive"
      >
        <div className="text-center max-w-xs">
          {/* Error icon */}
          <div className="inline-block border-[3px] border-black px-4 py-2 shadow-[4px_4px_0px_#000] mb-4">
            <span className="text-2xl font-bold text-black tracking-wider">
              !
            </span>
          </div>

          <p className="text-xs font-bold text-black uppercase tracking-wider mb-1">
            {text.en}
          </p>
          <p className="text-[10px] text-[#9E9E9E] mb-4" lang="hi">
            {text.hi}
          </p>

          {this.state.errorId && (
            <p className="text-[9px] font-mono text-[#E0E0E0] mb-3">
              Ref: {this.state.errorId}
            </p>
          )}

          <button
            onClick={this.handleReset}
            className="inline-flex items-center justify-center px-5 py-2 text-[10px] font-bold uppercase tracking-wider text-white bg-black border-[3px] border-black shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
