/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Experiment ↔ Analytics Integration
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Bridges the experiment service with the existing Umami analytics layer.
 * Computes per-experiment results from locally stored events.
 *
 * In production, these aggregations would come from a Firestore collection
 * or Umami API; this module provides the same interface from localStorage
 * so everything works in demo mode.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  getAllEvents,
  getEventsByName,
  type AnalyticsEvent,
} from "@/lib/analytics";

import {
  getAllExperiments,
  evaluateSignificance,
  type Experiment,
  type ExperimentResult,
  type SignificanceResult,
} from "./experiment-service";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ExperimentReport {
  experiment: Experiment;
  results: VariantReport[];
  significance: SignificanceResult | null;
  /** Days the experiment has been running */
  daysRunning: number;
  /** Total sample across all variants */
  totalSample: number;
  isReady: boolean; // Enough samples + enough days
}

export interface VariantReport {
  variantId: string;
  variantName: string;
  exposures: number;
  conversions: number;
  conversionRate: number;
  /** Secondary metric values: { metric_name: count } */
  secondaryMetrics: Record<string, number>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Event Extraction
// ─────────────────────────────────────────────────────────────────────────────

function getExposureEvents(experimentId: string): AnalyticsEvent[] {
  return getEventsByName("ab_test_exposure").filter(
    (e) => (e.properties as any)?.test_id === experimentId,
  );
}

function getConversionEvents(experimentId: string, metricName: string): AnalyticsEvent[] {
  return getEventsByName("ab_test_conversion").filter(
    (e) =>
      (e.properties as any)?.test_id === experimentId &&
      (e.properties as any)?.metric === metricName,
  );
}

function countByVariant(events: AnalyticsEvent[]): Record<string, number> {
  const counts: Record<string, number> = {};
  events.forEach((e) => {
    const variant = (e.properties as any)?.variant || "unknown";
    counts[variant] = (counts[variant] || 0) + 1;
  });
  return counts;
}

// ─────────────────────────────────────────────────────────────────────────────
// Report Generation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a full report for a single experiment.
 */
export function getExperimentReport(experiment: Experiment): ExperimentReport {
  const exposureEvents = getExposureEvents(experiment.id);
  const conversionEvents = getConversionEvents(experiment.id, experiment.primaryMetric);

  const exposuresByVariant = countByVariant(exposureEvents);
  const conversionsByVariant = countByVariant(conversionEvents);

  // Build per-variant report
  const results: VariantReport[] = experiment.variants.map((v) => {
    const exposures = exposuresByVariant[v.id] || 0;
    const conversions = conversionsByVariant[v.id] || 0;
    const conversionRate = exposures > 0 ? (conversions / exposures) * 100 : 0;

    // Secondary metrics
    const secondaryMetrics: Record<string, number> = {};
    for (const metric of experiment.secondaryMetrics) {
      const metricEvents = getConversionEvents(experiment.id, metric);
      const byVariant = countByVariant(metricEvents);
      secondaryMetrics[metric] = byVariant[v.id] || 0;
    }

    return {
      variantId: v.id,
      variantName: v.name,
      exposures,
      conversions,
      conversionRate: Math.round(conversionRate * 100) / 100,
      secondaryMetrics,
    };
  });

  // Days running
  const startMs = new Date(experiment.startDate).getTime();
  const endMs = experiment.endDate ? new Date(experiment.endDate).getTime() : Date.now();
  const daysRunning = Math.max(1, Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)));

  const totalSample = results.reduce((sum, r) => sum + r.exposures, 0);

  // Statistical significance (control vs first treatment)
  let significance: SignificanceResult | null = null;
  if (results.length >= 2) {
    const controlResult: ExperimentResult = {
      experimentId: experiment.id,
      variantId: results[0].variantId,
      sampleSize: results[0].exposures,
      conversions: results[0].conversions,
      conversionRate: results[0].conversionRate,
    };

    // Compare control against each treatment, pick best
    for (let i = 1; i < results.length; i++) {
      const treatmentResult: ExperimentResult = {
        experimentId: experiment.id,
        variantId: results[i].variantId,
        sampleSize: results[i].exposures,
        conversions: results[i].conversions,
        conversionRate: results[i].conversionRate,
      };
      const sig = evaluateSignificance(controlResult, treatmentResult);
      if (!significance || sig.confidence > significance.confidence) {
        significance = sig;
      }
    }
  }

  const allMeetMinSample = results.every((r) => r.exposures >= experiment.minSamplePerVariant);
  const isReady = allMeetMinSample && daysRunning >= 7;

  return {
    experiment,
    results,
    significance,
    daysRunning,
    totalSample,
    isReady,
  };
}

/**
 * Generate reports for ALL experiments.
 */
export function getAllExperimentReports(): ExperimentReport[] {
  return getAllExperiments().map(getExperimentReport);
}

/**
 * Get only running experiments' reports.
 */
export function getRunningExperimentReports(): ExperimentReport[] {
  return getAllExperimentReports().filter((r) => r.experiment.status === "running");
}

/**
 * Get experiments that have reached significance.
 */
export function getReadyToShipExperiments(): ExperimentReport[] {
  return getAllExperimentReports().filter(
    (r) => r.isReady && r.significance?.isSignificant,
  );
}

/**
 * Summary stats across all experiments.
 */
export function getExperimentsSummary(): {
  total: number;
  running: number;
  completed: number;
  significantWins: number;
  totalExposures: number;
} {
  const all = getAllExperimentReports();
  return {
    total: all.length,
    running: all.filter((r) => r.experiment.status === "running").length,
    completed: all.filter((r) => r.experiment.status === "completed").length,
    significantWins: all.filter((r) => r.significance?.isSignificant && r.significance.lift > 0).length,
    totalExposures: all.reduce((sum, r) => sum + r.totalSample, 0),
  };
}
