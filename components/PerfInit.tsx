/**
 * Bandhan AI — Performance, Accessibility & Analytics Initializer
 *
 * Mounts once in the root layout and:
 *  1. Initializes Web Vitals monitoring (FCP, LCP, CLS, FID)
 *  2. Detects slow networks (2G) and sets data-reduce-motion on <html>
 *  3. Injects hidden aria-live regions for screen reader announcements
 *  4. Respects prefers-reduced-motion OS preference
 *  5. Initializes Umami analytics (only if user previously consented)
 *  6. Logs performance summary in development
 *
 * ZERO external dependencies. < 0.5KB gzipped.
 */

"use client";

import { useEffect } from "react";
import {
  initPerfMonitoring,
  shouldReduceMotion,
  logPerfSummary,
} from "@/lib/performance";
import {
  initLiveRegions,
  onReducedMotionChange,
  prefersReducedMotion,
} from "@/lib/a11y";
import { initAnalytics } from "@/lib/analytics";

export function PerfInit() {
  useEffect(() => {
    // ── Performance monitoring ──
    initPerfMonitoring();

    // ── Accessibility: inject aria-live regions ──
    initLiveRegions();

    // ── Analytics: load Umami if user already consented ──
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
