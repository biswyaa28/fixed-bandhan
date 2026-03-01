/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Experiment UI Components
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Declarative React components for running experiments in the UI.
 *
 * Usage:
 *
 *   <ExperimentProvider experimentId="ui_cta_copy" userId={uid}>
 *     <ExperimentVariant variant="control">
 *       <button>❤️ Like</button>
 *     </ExperimentVariant>
 *     <ExperimentVariant variant="variant_a">
 *       <button>✓ Interested</button>
 *     </ExperimentVariant>
 *   </ExperimentProvider>
 *
 *   // Or the simpler hook-based API:
 *   const variant = useExperiment("ui_cta_copy", userId);
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";

import {
  getVariant,
  getVariantValue,
  trackExposure,
  trackConversion,
} from "@/lib/experiments/experiment-service";

import { isFeatureEnabled, useFeatureFlag } from "@/lib/experiments/feature-flags";

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

interface ExperimentContextValue {
  experimentId: string;
  userId: string;
  variantId: string;
}

const ExperimentContext = createContext<ExperimentContextValue | null>(null);

// ─────────────────────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get the assigned variant for an experiment.
 * Automatically tracks exposure on mount.
 *
 * @example
 *   const variant = useExperiment("ui_cta_copy", userId);
 *   // "control" | "variant_a" | "variant_b"
 */
export function useExperiment(experimentId: string, userId: string): string {
  const variantId = useMemo(
    () => getVariant(experimentId, userId),
    [experimentId, userId],
  );

  useEffect(() => {
    trackExposure(experimentId, userId);
  }, [experimentId, userId]);

  return variantId;
}

/**
 * Get the variant value (the payload) for an experiment.
 *
 * @example
 *   const price = useExperimentValue<number>("price_monthly", userId, 499);
 */
export function useExperimentValue<T>(
  experimentId: string,
  userId: string,
  fallback: T,
): T {
  const value = useMemo(
    () => getVariantValue<T>(experimentId, userId, fallback),
    [experimentId, userId, fallback],
  );

  useEffect(() => {
    trackExposure(experimentId, userId);
  }, [experimentId, userId]);

  return value;
}

/**
 * Track a conversion from within a component.
 * Returns a stable callback function.
 */
export function useTrackConversion(experimentId: string, userId: string) {
  return useMemo(
    () => (metricName: string, value?: number) => {
      trackConversion(experimentId, userId, metricName, value);
    },
    [experimentId, userId],
  );
}

/**
 * Hook version of isFeatureEnabled. Tracks exposure automatically.
 *
 * @example
 *   const hasVideoCall = useFlag("video_calls", userId);
 */
export function useFlag(flagId: string, userId: string): boolean {
  return useFeatureFlag(flagId, userId);
}

// ─────────────────────────────────────────────────────────────────────────────
// Declarative Components
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Provider that assigns a variant and makes it available to children.
 */
export function ExperimentProvider({
  experimentId,
  userId,
  children,
}: {
  experimentId: string;
  userId: string;
  children: ReactNode;
}) {
  const variantId = useExperiment(experimentId, userId);

  const value = useMemo(
    () => ({ experimentId, userId, variantId }),
    [experimentId, userId, variantId],
  );

  return (
    <ExperimentContext.Provider value={value}>
      {children}
    </ExperimentContext.Provider>
  );
}

/**
 * Renders children only if the current variant matches.
 * Must be wrapped in <ExperimentProvider>.
 *
 * @example
 *   <ExperimentVariant variant="control">
 *     <OldButton />
 *   </ExperimentVariant>
 *   <ExperimentVariant variant="variant_a">
 *     <NewButton />
 *   </ExperimentVariant>
 */
export function ExperimentVariant({
  variant,
  children,
}: {
  variant: string;
  children: ReactNode;
}) {
  const ctx = useContext(ExperimentContext);
  if (!ctx) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[ExperimentVariant] Must be inside <ExperimentProvider>. Rendering nothing.");
    }
    return null;
  }
  if (ctx.variantId !== variant) return null;
  return <>{children}</>;
}

/**
 * Renders children only if a feature flag is enabled.
 *
 * @example
 *   <FeatureGate flag="video_calls" userId={uid}>
 *     <VideoCallButton />
 *   </FeatureGate>
 */
export function FeatureGate({
  flag,
  userId,
  children,
  fallback = null,
}: {
  flag: string;
  userId: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const enabled = useFlag(flag, userId);
  return <>{enabled ? children : fallback}</>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Debug Overlay (dev only)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A small debug panel that shows all active experiment assignments.
 * Only renders in development mode.
 *
 * Place once in the root layout:
 *   {process.env.NODE_ENV === "development" && <ExperimentDebugOverlay userId={uid} />}
 */
export function ExperimentDebugOverlay({ userId }: { userId: string }) {
  if (process.env.NODE_ENV !== "development") return null;

  const { getUserAssignments } = require("@/lib/experiments/experiment-service");
  const { getAllFlags } = require("@/lib/experiments/feature-flags");
  const assignments = getUserAssignments() as Record<string, { variantId: string }>;
  const flags = (getAllFlags() as { id: string; enabled: boolean; rolloutPercent: number }[]);

  return (
    <div className="fixed bottom-16 right-2 z-[9999] bg-white border-[2px] border-black shadow-[4px_4px_0px_#000] p-3 max-w-[260px] max-h-[300px] overflow-y-auto text-[8px]">
      <p className="font-bold text-[10px] text-[#212121] border-b-[2px] border-black pb-1 mb-2 uppercase tracking-wider">
        🧪 Experiments (dev)
      </p>

      {Object.keys(assignments).length > 0 ? (
        <div className="space-y-1 mb-3">
          {Object.entries(assignments).map(([id, a]) => (
            <div key={id} className="flex items-center justify-between border-b border-dashed border-[#E0E0E0] pb-0.5">
              <span className="text-[#424242] truncate max-w-[140px]">{id}</span>
              <span className="font-bold text-[#212121]">{a.variantId}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[#9E9E9E] mb-2">No assignments yet</p>
      )}

      <p className="font-bold text-[10px] text-[#212121] border-b-[2px] border-black pb-1 mb-2 uppercase tracking-wider">
        🚩 Feature Flags
      </p>
      <div className="space-y-1">
        {flags.map((f: { id: string; enabled: boolean; rolloutPercent: number }) => (
          <div key={f.id} className="flex items-center justify-between">
            <span className="text-[#424242] truncate max-w-[140px]">{f.id}</span>
            <span className={`font-bold ${f.enabled ? "text-[#212121]" : "text-[#E0E0E0]"}`}>
              {f.enabled ? `${f.rolloutPercent}%` : "OFF"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
