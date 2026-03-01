/**
 * Bandhan AI — Privacy Module (barrel export)
 */
export {
  getLocalConsent,
  setLocalConsent,
  updateConsent,
  acceptAll,
  rejectOptional,
  withdrawAll,
  hasConsentFor,
  hasResponded,
  getActivePurposes,
  getConsentSummary,
  PURPOSE_LABELS,
  CURRENT_POLICY_VERSION,
  type ConsentPurpose,
  type ConsentRecord,
  type ConsentLogEntry,
} from "./consent-manager";

export {
  buildUserDataExport,
  downloadDataExport,
  estimateExportSize,
  type UserDataExport,
  type DataExportMetadata,
  type DataProcessorInfo,
} from "./data-export";

export {
  createDeletionRequest,
  cancelDeletionRequest,
  isCoolingOffExpired,
  getCoolingOffDaysRemaining,
  getDeletionPlan,
  clearAllLocalData,
  COOLING_OFF_DAYS,
  DELETION_REASONS,
  type DeletionStatus,
  type DeletionReason,
  type DeletionRequest,
  type DeletionStep,
} from "./data-deletion";

export {
  RETENTION_RULES,
  cleanupLocalAnalytics,
  checkAccountInactivity,
  getRetentionSummary,
  type RetentionRule,
  type RetentionStats,
} from "./retention-policy";
