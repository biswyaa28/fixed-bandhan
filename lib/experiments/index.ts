/**
 * Barrel export for lib/experiments/.
 */
export {
  registerExperiments,
  getExperiment,
  getAllExperiments,
  getRunningExperiments,
  getVariant,
  getVariantValue,
  trackExposure,
  trackConversion,
  getUserAssignments,
  overrideVariant,
  clearAssignments,
  evaluateSignificance,
  type Experiment,
  type ExperimentVariant,
  type ExperimentStatus,
  type ExperimentAssignment,
  type ExperimentResult,
  type SignificanceResult,
} from "./experiment-service";

export {
  initFeatureFlags,
  isFeatureEnabled,
  useFeatureFlag,
  getUserFlags,
  getAllFlags,
  type FeatureFlag,
} from "./feature-flags";

export {
  getExperimentReport,
  getAllExperimentReports,
  getRunningExperimentReports,
  getReadyToShipExperiments,
  getExperimentsSummary,
  type ExperimentReport,
  type VariantReport,
} from "./analytics-integration";
