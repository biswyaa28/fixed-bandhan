/**
 * Bandhan AI — Performance, Accessibility, Analytics & Error Tracking Initializer
 *
 * Mounts once in the root layout and:
 *  1. Initializes Web Vitals monitoring (FCP, LCP, CLS, FID, INP)
 *  2. Initializes performance budget monitoring & analytics reporting
 *  3. Initializes global error tracking (Sentry free tier)
 *  4. Detects slow networks (2G) and sets data-reduce-motion on <html>
 *  5. Injects hidden aria-live regions for screen reader announcements
 *  6. Respects prefers-reduced-motion OS preference
 *  7. Initializes Umami analytics (only if user previously consented)
 *  8. Logs performance summary in development
 *
 * ZERO external dependencies. < 0.5KB gzipped.
 */

"use client";

import { useEffect } from "react";
import { shouldReduceMotion, logPerfSummary } from "@/lib/performance";
import { initPerformanceMonitoring } from "@/lib/performance-monitoring";
import { initErrorTracking } from "@/lib/error-tracking";
import { initLiveRegions, onReducedMotionChange, prefersReducedMotion } from "@/lib/a11y";
import { initAnalytics } from "@/lib/analytics";

export function PerfInit() {
  useEffect(() => {
    // ── Performance monitoring (Web Vitals + budgets + analytics reporting) ──
    initPerformanceMonitoring((violation) => {
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.warn(
          `[Perf] Budget violation: ${violation.metric} = ${violation.actual}${violation.unit} (budget: < ${violation.threshold}${violation.unit})`,
        );
      }
    });

    // ── Error tracking (Sentry free tier + global handlers) ──
    initErrorTracking();

    // ── Accessibility: inject aria-live regions ──
    initLiveRegions();

    // ── Analytics: load Umami + record DAU + funnel stage ──
    initAnalytics();

    // ── Reduced motion: set data attribute for CSS to read ──
    if (shouldReduceMotion() || prefersReducedMotion()) {
      document.documentElement.setAttribute("data-reduce-motion", "true");
    }

    // Listen for OS preference changes at runtime
    const unsubMotion = onReducedMotionChange((prefers) => {
      document.documentElement.setAttribute(
        "data-reduce-motion",
        prefers ? "true" : "false",
      );
    });

    // ── Dev-only: log perf summary ──
    if (process.env.NODE_ENV === "development") {
      const timer = setTimeout(() => {
        logPerfSummary();
      }, 5000);
      return () => {
        clearTimeout(timer);
        unsubMotion();
      };
    }

    return unsubMotion;
  }, []);

  return null;
}
