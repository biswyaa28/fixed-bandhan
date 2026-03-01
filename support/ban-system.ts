/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — User Ban/Unban System
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Three-strike system with appeals.
 *
 * Strike 1 → Warning (in-app + email)
 * Strike 2 → 7-day suspension
 * Strike 3 → Permanent ban (appeal within 30 days)
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type BanStatus = "active" | "warned" | "suspended" | "banned";
export type BanReason =
  | "fake_profile"
  | "harassment"
  | "spam"
  | "inappropriate_content"
  | "hate_speech"
  | "underage"
  | "scam"
  | "multiple_accounts"
  | "other";

export interface UserBanRecord {
  userId: string;
  status: BanStatus;
  strikes: Strike[];
  currentSuspensionEnd: string | null;
  bannedAt: string | null;
  appealStatus: "none" | "pending" | "approved" | "denied";
  appealMessage: string | null;
  appealedAt: string | null;
  updatedAt: string;
}

export interface Strike {
  id: string;
  reason: BanReason;
  description: string;
  moderatorId: string;
  /** Evidence: report IDs or content references */
  evidence: string[];
  action: "warning" | "suspension_7d" | "permanent_ban";
  createdAt: string;
}

// ─── Storage ─────────────────────────────────────────────────────────────

const BAN_RECORDS_KEY = "bandhan_ban_records";

function loadRecords(): Record<string, UserBanRecord> {
  if (typeof localStorage === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(BAN_RECORDS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveRecords(records: Record<string, UserBanRecord>): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(BAN_RECORDS_KEY, JSON.stringify(records));
}

// ─── Public API ──────────────────────────────────────────────────────────

/**
 * Get a user's ban record. Returns null if no record exists (clean user).
 */
export function getBanRecord(userId: string): UserBanRecord | null {
  const records = loadRecords();
  return records[userId] || null;
}

/**
 * Check if a user can access the app.
 */
export function canUserAccess(userId: string): { allowed: boolean; reason: string | null } {
  const record = getBanRecord(userId);
  if (!record) return { allowed: true, reason: null };

  if (record.status === "banned") {
    return { allowed: false, reason: "Your account has been permanently suspended. You may appeal at appeal@bandhan.ai within 30 days." };
  }

  if (record.status === "suspended" && record.currentSuspensionEnd) {
    const endDate = new Date(record.currentSuspensionEnd);
    if (endDate > new Date()) {
      const daysLeft = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return { allowed: false, reason: `Your account is suspended for ${daysLeft} more day(s). Reason: ${record.strikes[record.strikes.length - 1]?.reason || "policy violation"}.` };
    }
    // Suspension expired — reactivate
    record.status = "warned";
    record.currentSuspensionEnd = null;
    record.updatedAt = new Date().toISOString();
    const records = loadRecords();
    records[userId] = record;
    saveRecords(records);
  }

  return { allowed: true, reason: null };
}

/**
 * Issue a strike against a user.
 * Automatically escalates: warning → suspension → ban based on strike count.
 */
export function issueStrike(
  userId: string,
  reason: BanReason,
  description: string,
  moderatorId: string,
  evidence: string[] = [],
): UserBanRecord {
  const records = loadRecords();
  let record = records[userId] || {
    userId,
    status: "active" as BanStatus,
    strikes: [],
    currentSuspensionEnd: null,
    bannedAt: null,
    appealStatus: "none" as const,
    appealMessage: null,
    appealedAt: null,
    updatedAt: new Date().toISOString(),
  };

  const strikeCount = record.strikes.length + 1;
  let action: Strike["action"];

  // Immediate ban for severe violations regardless of strike count
  const severeBan = reason === "underage" || reason === "scam";
  if (severeBan) {
    action = "permanent_ban";
  } else if (strikeCount >= 3) {
    action = "permanent_ban";
  } else if (strikeCount === 2) {
    action = "suspension_7d";
  } else {
    action = "warning";
  }

  const strike: Strike = {
    id: `STR-${Date.now().toString(36)}`,
    reason,
    description,
    moderatorId,
    evidence,
    action,
    createdAt: new Date().toISOString(),
  };

  record.strikes.push(strike);
  record.updatedAt = new Date().toISOString();

  switch (action) {
    case "warning":
      record.status = "warned";
      break;
    case "suspension_7d":
      record.status = "suspended";
      record.currentSuspensionEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      break;
    case "permanent_ban":
      record.status = "banned";
      record.bannedAt = new Date().toISOString();
      break;
  }

  records[userId] = record;
  saveRecords(records);
  return record;
}

/**
 * Submit an appeal for a banned user.
 */
export function submitAppeal(userId: string, message: string): UserBanRecord | null {
  const records = loadRecords();
  const record = records[userId];
  if (!record || record.status !== "banned") return null;

  // Check 30-day appeal window
  if (record.bannedAt) {
    const banDate = new Date(record.bannedAt);
    const daysSinceBan = (Date.now() - banDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceBan > 30) return null; // Appeal window closed
  }

  record.appealStatus = "pending";
  record.appealMessage = message;
  record.appealedAt = new Date().toISOString();
  record.updatedAt = new Date().toISOString();

  records[userId] = record;
  saveRecords(records);
  return record;
}

/**
 * Resolve an appeal (admin action).
 */
export function resolveAppeal(
  userId: string,
  approved: boolean,
  moderatorId: string,
): UserBanRecord | null {
  const records = loadRecords();
  const record = records[userId];
  if (!record || record.appealStatus !== "pending") return null;

  record.appealStatus = approved ? "approved" : "denied";
  record.updatedAt = new Date().toISOString();

  if (approved) {
    record.status = "warned";
    record.bannedAt = null;
    record.currentSuspensionEnd = null;
    // Keep strikes on record but allow access
  }

  records[userId] = record;
  saveRecords(records);
  return record;
}

/**
 * Manually unban a user (admin override).
 */
export function unbanUser(userId: string): UserBanRecord | null {
  const records = loadRecords();
  const record = records[userId];
  if (!record) return null;

  record.status = "active";
  record.bannedAt = null;
  record.currentSuspensionEnd = null;
  record.appealStatus = "none";
  record.updatedAt = new Date().toISOString();

  records[userId] = record;
  saveRecords(records);
  return record;
}

/**
 * Get all banned/suspended users (admin view).
 */
export function getModeratedUsers(filter?: BanStatus): UserBanRecord[] {
  const records = loadRecords();
  let list = Object.values(records);
  if (filter) list = list.filter((r) => r.status === filter);
  return list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
