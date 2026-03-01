/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Performance Monitoring (Unified)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Ties together Web Vitals, API response times, and bundle size metrics
 * from lib/performance.ts with the analytics layer from lib/analytics.ts.
 *
 * This module:
 *   1. Monitors Core Web Vitals and reports them to Umami
 *   2. Tracks API response times per endpoint
 *   3. Tracks route-level bundle sizes
 *   4. Detects performance regressions against budgets
 *   5. Provides React hooks for perf-aware components
 *
 * ZERO external dependencies. Uses only browser-native APIs.
 *
 * LIGHTHOUSE TARGETS:
 *   Performance score:  90+
 *   FCP:   < 1.8s (4G), < 3.0s (2G)
 *   LCP:   < 2.5s (4G), < 4.0s (2G)
 *   CLS:   < 0.1
 *   INP:   < 200ms
 *   TTFB:  < 800ms
 *   Bundle: < 150KB initial JS (gzipped)
 *   API P95: < 500ms
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  initPerfMonitoring,
  getPerfMetrics,
  getApiTimingStats,
  measureJsBundleSize,
  getNetworkTier,
  getDeviceMemory,
  getConnectionInfo,
  BUNDLE_BUDGETS,
  type PerfMetrics,
} from "@/lib/performance";
import { trackEvent } from "@/lib/analytics";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface PerfBudget {
  metric: string;
  threshold: number;
  unit: string;
  actual: number | null;
  passed: boolean;
}

export interface PerfSnapshot {
  timestamp: string;
  webVitals: PerfMetrics;
  apiStats: {
    count: number;
    avgMs: number;
    p50Ms: number;
    p95Ms: number;
    p99Ms: number;
    slowestUrl: string;
  };
  bundleStats: {
    totalKb: number;
    entryCount: number;
    overBudget: boolean;
  };
  budgetResults: PerfBudget[];
  network: {
    tier: string;
    downlinkMbps: number;
    rttMs: number;
    saveData: boolean;
  };
  device: {
    memoryGb: number;
  };
}

/** Callback fired when a budget is exceeded */
export type BudgetViolationHandler = (violation: PerfBudget) => void;

// ─────────────────────────────────────────────────────────────────────────────
// Budget Thresholds
// ─────────────────────────────────────────────────────────────────────────────

const WEB_VITALS_BUDGETS: { metric: keyof PerfMetrics; threshold: number; unit: string }[] = [
  { metric: "fcp", threshold: 1800, unit: "ms" },
  { metric: "lcp", threshold: 2500, unit: "ms" },
  { metric: "cls", threshold: 0.1, unit: "" },
  { metric: "fid", threshold: 100, unit: "ms" },
  { metric: "inp", threshold: 200, unit: "ms" },
  { metric: "ttfb", threshold: 800, unit: "ms" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Reporting to Analytics
// ─────────────────────────────────────────────────────────────────────────────

let _reported = false;

/**
 * Send Web Vitals to Umami analytics once per page load.
 * Called automatically after metrics stabilize (~10s after load).
 *
 * Events sent:
 *   web_vital_fcp, web_vital_lcp, web_vital_cls, web_vital_fid,
 *   web_vital_inp, web_vital_ttfb
 *
 * Each event includes { value, rating, network_tier, device_memory }.
 */
function reportWebVitalsToAnalytics(): void {
  if (_reported) return;
  _reported = true;

  const m = getPerfMetrics();
  const tier = getNetworkTier();
  const memory = getDeviceMemory();

  const vitals: { name: string; value: number | null; good: number }[] = [
    { name: "fcp", value: m.fcp, good: 1800 },
    { name: "lcp", value: m.lcp, good: 2500 },
    { name: "cls", value: m.cls, good: 0.1 },
    { name: "fid", value: m.fid, good: 100 },
    { name: "inp", value: m.inp, good: 200 },
    { name: "ttfb", value: m.ttfb, good: 800 },
  ];

  for (const v of vitals) {
    if (v.value === null) continue;
    const rating =
      v.value <= v.good ? "good" : v.value <= v.good * 1.5 ? "needs-improvement" : "poor";

    trackEvent(`web_vital_${v.name}`, {
      value: v.name === "cls" ? parseFloat(v.value.toFixed(4)) : Math.round(v.value),
      rating,
      network_tier: tier,
      device_memory_gb: memory,
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Budget Checking
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check all performance budgets against current metrics.
 * Returns an array of budget results with pass/fail.
 */
export function checkBudgets(): PerfBudget[] {
  const m = getPerfMetrics();
  const api = getApiTimingStats();
  const bundle = measureJsBundleSize();

  const results: PerfBudget[] = [];

  // Web Vitals budgets
  for (const budget of WEB_VITALS_BUDGETS) {
    const actual = m[budget.metric] as number | null;
    results.push({
      metric: budget.metric.toUpperCase(),
      threshold: budget.threshold,
      unit: budget.unit,
      actual,
      passed: actual === null || actual <= budget.threshold,
    });
  }

  // API P95 budget
  results.push({
    metric: "API P95",
    threshold: 500,
    unit: "ms",
    actual: api.count > 0 ? api.p95Ms : null,
    passed: api.count === 0 || api.p95Ms <= 500,
  });

  // Bundle size budget
  results.push({
    metric: "Bundle JS",
    threshold: BUNDLE_BUDGETS.initialJs,
    unit: "KB",
    actual: bundle.totalKb > 0 ? bundle.totalKb : null,
    passed: bundle.totalKb === 0 || !bundle.overBudget,
  });

  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// Snapshot
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Take a complete performance snapshot.
 * Useful for debugging and periodic health checks.
 */
export function takePerfSnapshot(): PerfSnapshot {
  const conn = getConnectionInfo();
  return {
    timestamp: new Date().toISOString(),
    webVitals: getPerfMetrics(),
    apiStats: getApiTimingStats(),
    bundleStats: measureJsBundleSize(),
    budgetResults: checkBudgets(),
    network: {
      tier: conn.effectiveType,
      downlinkMbps: conn.downlink,
      rttMs: conn.rtt,
      saveData: conn.saveData,
    },
    device: {
      memoryGb: getDeviceMemory(),
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Route Performance Tracking
// ─────────────────────────────────────────────────────────────────────────────

const _routeTimings = new Map<string, number[]>();

/**
 * Track a route transition duration.
 * Call when navigating between pages:
 *
 * @example
 *   const start = performance.now();
 *   router.push('/matches');
 *   // After route loads:
 *   trackRoutePerformance('/matches', performance.now() - start);
 */
export function trackRoutePerformance(route: string, durationMs: number): void {
  const timings = _routeTimings.get(route) || [];
  timings.push(durationMs);
  // Keep last 20 transitions per route
  if (timings.length > 20) timings.shift();
  _routeTimings.set(route, timings);

  // Report slow routes to analytics
  if (durationMs > 3000) {
    trackEvent("slow_route_transition", {
      route,
      duration_ms: Math.round(durationMs),
      network_tier: getNetworkTier(),
    });
  }
}

/**
 * Get average route transition times.
 */
export function getRoutePerformance(): Record<string, { avgMs: number; count: number }> {
  const result: Record<string, { avgMs: number; count: number }> = {};
  for (const [route, timings] of _routeTimings) {
    const sum = timings.reduce((a, b) => a + b, 0);
    result[route] = {
      avgMs: Math.round(sum / timings.length),
      count: timings.length,
    };
  }
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Initialization
// ─────────────────────────────────────────────────────────────────────────────

let _monitoringInitialized = false;

/**
 * Initialize performance monitoring and schedule Web Vitals reporting.
 *
 * Call once from PerfInit or root layout:
 *   import { initPerformanceMonitoring } from '@/lib/performance-monitoring';
 *   initPerformanceMonitoring();
 */
export function initPerformanceMonitoring(
  onBudgetViolation?: BudgetViolationHandler,
): void {
  if (typeof window === "undefined") return;
  if (_monitoringInitialized) return;
  _monitoringInitialized = true;

  // Initialize the base perf observer (FCP, LCP, CLS, FID, INP, TTFB)
  initPerfMonitoring();

  // Schedule Web Vitals → analytics report after metrics stabilize
  // LCP can update until the user interacts, so we wait 10s.
  setTimeout(() => {
    reportWebVitalsToAnalytics();

    // Check budgets and report violations
    const budgets = checkBudgets();
    const violations = budgets.filter((b) => !b.passed && b.actual !== null);
    for (const v of violations) {
      onBudgetViolation?.(v);

      // Report budget violation to analytics
      trackEvent("perf_budget_violation", {
        metric: v.metric,
        threshold: v.threshold,
        actual: v.actual,
        unit: v.unit,
        network_tier: getNetworkTier(),
      });
    }
  }, 10_000);
}

// ─────────────────────────────────────────────────────────────────────────────
// Console Report
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Log a comprehensive performance report to console.
 *
 * Usage from browser devtools:
 *   import('/lib/performance-monitoring').then(m => m.logPerformanceReport())
 */
export function logPerformanceReport(): void {
  if (typeof window === "undefined") return;

  const snapshot = takePerfSnapshot();

  // eslint-disable-next-line no-console
  console.group(
    "%c📊 Bandhan AI — Performance Report",
    "font-size: 16px; font-weight: bold; color: #212121;",
  );

  // Web Vitals
  // eslint-disable-next-line no-console
  console.log("\n%c🌐 Web Vitals:", "font-weight: bold;");
  const m = snapshot.webVitals;
  // eslint-disable-next-line no-console
  console.table({
    FCP: { value: m.fcp ? `${Math.round(m.fcp)}ms` : "—", budget: "< 1800ms" },
    LCP: { value: m.lcp ? `${Math.round(m.lcp)}ms` : "—", budget: "< 2500ms" },
    CLS: { value: m.cls !== null ? m.cls.toFixed(4) : "—", budget: "< 0.1" },
    FID: { value: m.fid ? `${Math.round(m.fid)}ms` : "—", budget: "< 100ms" },
    INP: { value: m.inp ? `${Math.round(m.inp)}ms` : "—", budget: "< 200ms" },
    TTFB: { value: m.ttfb ? `${Math.round(m.ttfb)}ms` : "—", budget: "< 800ms" },
  });

  // API stats
  // eslint-disable-next-line no-console
  console.log("\n%c🔌 API Response Times:", "font-weight: bold;");
  // eslint-disable-next-line no-console
  console.table({
    Calls: snapshot.apiStats.count,
    "Avg (ms)": snapshot.apiStats.avgMs,
    "P50 (ms)": snapshot.apiStats.p50Ms,
    "P95 (ms)": snapshot.apiStats.p95Ms,
    "P99 (ms)": snapshot.apiStats.p99Ms,
    Slowest: snapshot.apiStats.slowestUrl || "—",
  });

  // Bundle
  // eslint-disable-next-line no-console
  console.log("\n%c📦 Bundle Size:", "font-weight: bold;");
  // eslint-disable-next-line no-console
  console.table({
    "Total JS (KB)": snapshot.bundleStats.totalKb || "—",
    "Chunks loaded": snapshot.bundleStats.entryCount,
    "Budget (KB)": BUNDLE_BUDGETS.initialJs,
    "Over budget": snapshot.bundleStats.overBudget ? "❌ YES" : "✅ No",
  });

  // Route performance
  const routes = getRoutePerformance();
  if (Object.keys(routes).length > 0) {
    // eslint-disable-next-line no-console
    console.log("\n%c🛤️ Route Transitions:", "font-weight: bold;");
    // eslint-disable-next-line no-console
    console.table(routes);
  }

  // Budget summary
  // eslint-disable-next-line no-console
  console.log("\n%c🎯 Budget Check:", "font-weight: bold;");
  const budgets = snapshot.budgetResults.filter((b) => b.actual !== null);
  // eslint-disable-next-line no-console
  console.table(
    budgets.map((b) => ({
      Metric: b.metric,
      Actual: `${b.actual}${b.unit}`,
      Budget: `< ${b.threshold}${b.unit}`,
      Status: b.passed ? "✅" : "❌",
    })),
  );

  // Network
  // eslint-disable-next-line no-console
  console.log("\n%c📶 Network:", "font-weight: bold;");
  // eslint-disable-next-line no-console
  console.table(snapshot.network);

  // eslint-disable-next-line no-console
  console.groupEnd();
}
