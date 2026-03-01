/**
 * Bandhan AI — Moderation Module (barrel export)
 */
export {
  moderateText,
  isTextBlocked,
  hasViolations,
  getRejectionMessage,
  moderateProfile,
  type ModerationAction,
  type ModerationResult,
  type ModerationViolation,
  type ProfileModerationResult,
} from "./text-moderation";

export {
  moderateImage,
  validateImageFile,
  stripExifMetadata,
  type ImageModerationAction,
  type ImageCheckResult,
} from "./image-moderation";

export {
  createStrike,
  getActiveStrikes,
  processNewStrike,
  processInstantBan,
  isInstantBanViolation,
  createReport,
  calculateReportPriority,
  getReportReasonLabel,
  createAppeal,
  resolveAppeal,
  moderationActionToStrike,
  createDefaultModerationState,
  getEnforcementMessage,
  type StrikeLevel,
  type EnforcementAction,
  type Strike,
  type UserModerationState,
  type ModerationLogEntry,
  type Appeal,
  type AppealStatus,
} from "./report-handler";
