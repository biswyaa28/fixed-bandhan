/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Performance Monitoring & Network-Aware Utilities
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ZERO-cost performance tracking using only browser-native APIs:
 *   • PerformanceObserver for FCP, LCP, CLS, FID, INP, TTFB
 *   • Navigator.connection for adaptive loading (2G/3G/4G)
 *   • Device memory detection for RAM-constrained phones
 *   • Lightweight — adds <1KB to bundle, no external services
 *
 * LIGHTHOUSE TARGETS:
 *   • Performance: 90+
 *   • First Contentful Paint: < 1.8s (4G), < 3.0s (2G)
 *   • Largest Contentful Paint: < 2.5s (4G), < 4.0s (2G)
 *   • Cumulative Layout Shift: < 0.1
 *   • Time to Interactive: < 3s on Moto E (2020)
 *   • Total Blocking Time: < 200ms
 *
 * Usage:
 *   import { initPerfMonitoring, getNetworkTier, shouldReduceData } from '@/lib/performance';
 *   // Call once in layout or _app
 *   initPerfMonitoring();
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface PerfMetrics {
  /** First Contentful Paint (ms) */
  fcp: number | null;
  /** Largest Contentful Paint (ms) */
  lcp: number | null;
  /** Cumulative Layout Shift (unitless) */
  cls: number | null;
  /** First Input Delay (ms) */
  fid: number | null;
  /** Interaction to Next Paint (ms) */
  inp: number | null;
  /** Time to First Byte (ms) */
  ttfb: number | null;
  /** Navigation type (navigate, reload, back_forward, prerender) */
  navigationType: string;
  /** Effective connection type */
  connectionType: string;
  /** Device memory in GB */
  deviceMemory: number;
  /** Timestamp when metrics were collected */
  timestamp: number;
}

export type NetworkTier = "offline" | "slow-2g" | "2g" | "3g" | "4g";

export interface ConnectionInfo {
  effectiveType: NetworkTier;
  downlink: number; // Mbps
  rtt: number; // ms
  saveData: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Singleton metrics store
// ─────────────────────────────────────────────────────────────────────────────

const metrics: PerfMetrics = {
  fcp: null,
  lcp: null,
  cls: null,
  fid: null,
  inp: null,
  ttfb: null,
  navigationType: "",
  connectionType: "",
  deviceMemory: 4,
  timestamp: 0,
};

let _initialized = false;

// ─────────────────────────────────────────────────────────────────────────────
// Network & Device Detection
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get the current network tier using Navigator.connection API.
 * Falls back to "4g" if the API is unavailable.
 *
 * Values: "offline" | "slow-2g" | "2g" | "3g" | "4g"
 */
export function getNetworkTier(): NetworkTier {
  if (typeof navigator === "undefined") return "4g";
  if (!navigator.onLine) return "offline";

  const conn = (navigator as any).connection;
  if (!conn) return "4g";

  return (conn.effectiveType as NetworkTier) || "4g";
}

/**
 * Get connection details including downlink speed and RTT.
 */
export function getConnectionInfo(): ConnectionInfo {
  if (typeof navigator === "undefined") {
    return { effectiveType: "4g", downlink: 10, rtt: 50, saveData: false };
  }

  const conn = (navigator as any).connection;
  if (!conn) {
    return {
      effectiveType: navigator.onLine ? "4g" : "offline",
      downlink: 10,
      rtt: 50,
      saveData: false,
    };
  }

  return {
    effectiveType: conn.effectiveType || "4g",
    downlink: conn.downlink || 10,
    rtt: conn.rtt || 50,
    saveData: conn.saveData || false,
  };
}

/**
 * Get device memory in GB. Budget phones typically have 1-2GB.
 * Falls back to 4 if the API is unavailable.
 */
export function getDeviceMemory(): number {
  if (typeof navigator === "undefined") return 4;
  return (navigator as any).deviceMemory || 4;
}

/**
 * Should we reduce data usage?
 * True when: 2G network, Save-Data header, or <2GB RAM.
 *
 * Use this to:
 *  - Skip preloading images below the fold
 *  - Load lower-quality image variants
 *  - Disable animations
 *  - Defer non-critical JS
 */
export function shouldReduceData(): boolean {
  const conn = getConnectionInfo();
  const mem = getDeviceMemory();

  return (
    conn.saveData ||
    conn.effectiveType === "slow-2g" ||
    conn.effectiveType === "2g" ||
    mem < 2
  );
}

/**
 * Should we disable animations?
 * True when: prefers-reduced-motion, 2G, or <2GB RAM.
 */
export function shouldReduceMotion(): boolean {
  if (typeof window === "undefined") return false;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return prefersReduced || shouldReduceData();
}

/**
 * Get recommended image quality (1-100) based on network.
 *  - 4G: 80 (high quality)
 *  - 3G: 60 (balanced)
 *  - 2G: 40 (low quality, smaller files)
 */
export function getImageQuality(): number {
  const tier = getNetworkTier();
  switch (tier) {
    case "4g":
      return 80;
    case "3g":
      return 60;
    case "2g":
    case "slow-2g":
      return 40;
    default:
      return 60;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Performance Observer
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Initialize performance monitoring.
 *
 * Call this ONCE in your root layout's useEffect or a client component.
 * It uses PerformanceObserver to collect Web Vitals metrics and logs
 * them to console in development.
 *
 * ZERO external dependencies. ZERO network requests. ZERO cost.
 */
export function initPerfMonitoring(
  onMetric?: (name: string, value: number) => void,
): void {
  if (typeof window === "undefined") return;
  if (_initialized) return;
  _initialized = true;

  // ── Populate device / network info ──
  metrics.connectionType = getNetworkTier();
  metrics.deviceMemory = getDeviceMemory();
  metrics.navigationType =
    (performance.getEntriesByType("navigation")[0] as any)?.type || "";
  metrics.timestamp = Date.now();

  const report = (name: string, value: number) => {
    (metrics as any)[name] = value;

    // Log in development
    if (process.env.NODE_ENV === "development") {
      const color =
        name === "cls" ? (value < 0.1 ? "green" : "red") : value < 2500 ? "green" : "red";
      // eslint-disable-next-line no-console
      console.log(
        `%c[Perf] ${name.toUpperCase()}: ${name === "cls" ? value.toFixed(4) : Math.round(value)}${name === "cls" ? "" : "ms"}`,
        `color: ${color}; font-weight: bold`,
      );
    }

    onMetric?.(name, value);
  };

  try {
    // ── FCP ──
    const fcpObserver = new PerformanceObserver((list) => {
      const entry = list.getEntries().find((e) => e.name === "first-contentful-paint");
      if (entry) {
        report("fcp", entry.startTime);
        fcpObserver.disconnect();
      }
    });
    fcpObserver.observe({ type: "paint", buffered: true });

    // ── LCP ──
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1];
      if (last) report("lcp", last.startTime);
    });
    lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });

    // ── CLS ──
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
          report("cls", clsValue);
        }
      }
    });
    clsObserver.observe({ type: "layout-shift", buffered: true });

    // ── FID ──
    const fidObserver = new PerformanceObserver((list) => {
      const entry = list.getEntries()[0];
      if (entry) {
        report("fid", (entry as any).processingStart - entry.startTime);
        fidObserver.disconnect();
      }
    });
    fidObserver.observe({ type: "first-input", buffered: true });

    // ── INP (Interaction to Next Paint) ──
    // INP replaces FID as the responsiveness Core Web Vital.
    // Captures the worst-case interaction latency across the page lifecycle.
    let inpValue = 0;
    try {
      const inpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const duration = (entry as any).duration ?? 0;
          if (duration > inpValue) {
            inpValue = duration;
            report("inp", inpValue);
          }
        }
      });
      inpObserver.observe({ type: "event", buffered: true });
    } catch {
      // event timing not supported — graceful degradation
    }

    // ── TTFB ──
    const navEntry = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming;
    if (navEntry) {
      report("ttfb", navEntry.responseStart - navEntry.requestStart);
    }
  } catch {
    // PerformanceObserver not supported — silently degrade
  }
}

/**
 * Get a snapshot of all collected metrics.
 */
export function getPerfMetrics(): Readonly<PerfMetrics> {
  return { ...metrics };
}

/**
 * Log a summary of all metrics to console.
 * Useful for manual testing on real devices.
 */
export function logPerfSummary(): void {
  if (typeof window === "undefined") return;

  const m = getPerfMetrics();
  const conn = getConnectionInfo();

  // eslint-disable-next-line no-console
  console.table({
    "FCP (ms)": m.fcp ? Math.round(m.fcp) : "—",
    "LCP (ms)": m.lcp ? Math.round(m.lcp) : "—",
    CLS: m.cls !== null ? m.cls.toFixed(4) : "—",
    "FID (ms)": m.fid ? Math.round(m.fid) : "—",
    "TTFB (ms)": m.ttfb ? Math.round(m.ttfb) : "—",
    Network: conn.effectiveType,
    "Downlink (Mbps)": conn.downlink,
    "RTT (ms)": conn.rtt,
    "Save Data": conn.saveData,
    "Device RAM (GB)": getDeviceMemory(),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// React Hook: usePerformance
// ─────────────────────────────────────────────────────────────────────────────

/**
 * React hook that initializes performance monitoring on mount
 * and returns current network/device state.
 *
 * Usage:
 *   const { networkTier, isSlowNetwork, reduceMotion } = usePerformance();
 */
export function usePerformanceInit() {
  if (typeof window !== "undefined" && !_initialized) {
    initPerfMonitoring();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// API Response Time Tracking
// ─────────────────────────────────────────────────────────────────────────────

interface ApiTimingEntry {
  url: string;
  method: string;
  durationMs: number;
  status: number;
  timestamp: number;
}

/** Circular buffer of last 50 API calls for P95 calculation */
const apiTimings: ApiTimingEntry[] = [];
const API_TIMING_BUFFER_SIZE = 50;

/**
 * Track an API call's response time.
 * Call this after every fetch/axios request.
 *
 * @example
 *   const start = performance.now();
 *   const res = await fetch('/api/matches');
 *   trackApiTiming('/api/matches', 'GET', performance.now() - start, res.status);
 */
export function trackApiTiming(
  url: string,
  method: string,
  durationMs: number,
  status: number,
): void {
  const entry: ApiTimingEntry = {
    url,
    method: method.toUpperCase(),
    durationMs: Math.round(durationMs),
    status,
    timestamp: Date.now(),
  };

  apiTimings.push(entry);
  if (apiTimings.length > API_TIMING_BUFFER_SIZE) {
    apiTimings.shift();
  }

  // Warn on slow APIs (>500ms p95 target)
  if (process.env.NODE_ENV === "development" && durationMs > 500) {
    // eslint-disable-next-line no-console
    console.warn(
      `%c[Perf] Slow API: ${method} ${url} took ${Math.round(durationMs)}ms (target: <500ms)`,
      "color: orange; font-weight: bold",
    );
  }
}

/**
 * Get API performance stats: average, p50, p95, p99.
 */
export function getApiTimingStats(): {
  count: number;
  avgMs: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  slowestUrl: string;
} {
  if (apiTimings.length === 0) {
    return { count: 0, avgMs: 0, p50Ms: 0, p95Ms: 0, p99Ms: 0, slowestUrl: "" };
  }

  const sorted = [...apiTimings].sort((a, b) => a.durationMs - b.durationMs);
  const n = sorted.length;
  const sum = sorted.reduce((s, e) => s + e.durationMs, 0);

  const percentile = (p: number) => sorted[Math.min(Math.floor(n * p), n - 1)].durationMs;

  const slowest = sorted[n - 1];

  return {
    count: n,
    avgMs: Math.round(sum / n),
    p50Ms: percentile(0.5),
    p95Ms: percentile(0.95),
    p99Ms: percentile(0.99),
    slowestUrl: `${slowest.method} ${slowest.url}`,
  };
}

/**
 * Wrap fetch() to automatically track API response times.
 * Drop-in replacement for global fetch.
 *
 * @example
 *   const res = await trackedFetch('/api/matches');
 */
export async function trackedFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const url =
    typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  const method = init?.method ?? "GET";

  const start = performance.now();
  try {
    const response = await fetch(input, init);
    trackApiTiming(url, method, performance.now() - start, response.status);
    return response;
  } catch (err) {
    trackApiTiming(url, method, performance.now() - start, 0); // 0 = network error
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Bundle Size Monitoring
// ─────────────────────────────────────────────────────────────────────────────

/** Budget targets in KB (gzipped) */
export const BUNDLE_BUDGETS = {
  /** Critical initial JS (first-load) */
  initialJs: 150,
  /** Any single route chunk */
  routeChunk: 80,
  /** Total CSS */
  css: 30,
  /** Single image (optimised) */
  image: 100,
} as const;

/**
 * Measure JS transfer sizes from the PerformanceObserver resource timing API.
 * Returns total JS size loaded so far in KB.
 *
 * NOTE: transferSize is only available for same-origin resources or those
 * with Timing-Allow-Origin headers.
 */
export function measureJsBundleSize(): {
  totalKb: number;
  entryCount: number;
  overBudget: boolean;
  entries: { name: string; sizeKb: number }[];
} {
  if (typeof performance === "undefined") {
    return { totalKb: 0, entryCount: 0, overBudget: false, entries: [] };
  }

  const resources = performance.getEntriesByType(
    "resource",
  ) as PerformanceResourceTiming[];
  const jsResources = resources.filter(
    (r) => r.name.endsWith(".js") || r.name.includes("/_next/static/chunks/"),
  );

  const entries = jsResources
    .map((r) => ({
      name: r.name.split("/").pop() ?? r.name,
      sizeKb: Math.round((r.transferSize || r.encodedBodySize || 0) / 1024),
    }))
    .filter((e) => e.sizeKb > 0)
    .sort((a, b) => b.sizeKb - a.sizeKb);

  const totalKb = entries.reduce((sum, e) => sum + e.sizeKb, 0);

  return {
    totalKb,
    entryCount: entries.length,
    overBudget: totalKb > BUNDLE_BUDGETS.initialJs,
    entries: entries.slice(0, 10), // top 10 largest
  };
}

/**
 * Log a full performance report: Web Vitals + API timings + bundle size.
 * Call in dev tools console: `import('/lib/performance').then(m => m.logFullReport())`
 */
export function logFullReport(): void {
  if (typeof window === "undefined") return;

  // eslint-disable-next-line no-console
  console.group(
    "%c📊 Bandhan AI — Performance Report",
    "font-size: 14px; font-weight: bold;",
  );

  // Web Vitals
  logPerfSummary();

  // API timings
  const api = getApiTimingStats();
  // eslint-disable-next-line no-console
  console.log("\n%c🌐 API Response Times:", "font-weight: bold");
  // eslint-disable-next-line no-console
  console.table({
    "Calls tracked": api.count,
    "Avg (ms)": api.avgMs,
    "P50 (ms)": api.p50Ms,
    "P95 (ms)": api.p95Ms,
    "P99 (ms)": api.p99Ms,
    Slowest: api.slowestUrl,
    "P95 Target": "< 500ms",
    "P95 Pass": api.p95Ms <= 500 ? "✅" : "❌",
  });

  // Bundle size
  const bundle = measureJsBundleSize();
  // eslint-disable-next-line no-console
  console.log("\n%c📦 Bundle Size:", "font-weight: bold");
  // eslint-disable-next-line no-console
  console.table({
    "Total JS (KB)": bundle.totalKb,
    "Chunks loaded": bundle.entryCount,
    "Budget (KB)": BUNDLE_BUDGETS.initialJs,
    "Within Budget": !bundle.overBudget ? "✅" : "❌",
  });

  if (bundle.entries.length > 0) {
    // eslint-disable-next-line no-console
    console.log("\nTop 10 largest JS chunks:");
    // eslint-disable-next-line no-console
    console.table(bundle.entries);
  }

  // eslint-disable-next-line no-console
  console.groupEnd();
}
