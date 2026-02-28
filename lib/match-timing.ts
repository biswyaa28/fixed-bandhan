/**
 * Bandhan AI — Match Timing Logic
 * 48-hour time-limit system for "Respectful Initiation" mode.
 * Handles countdowns, extensions, and expiry.
 */

const MS_48H = 48 * 60 * 60 * 1000;
const MS_24H = 24 * 60 * 60 * 1000;
const MS_12H = 12 * 60 * 60 * 1000;
const MS_6H = 6 * 60 * 60 * 1000;

export interface MatchTimer {
  matchId: string;
  matchedAt: number; // epoch ms
  expiresAt: number; // epoch ms
  extended: boolean;
  initiatorGender: "male" | "female" | "other";
  /** Who must message first (null = either) */
  firstMover: "female" | null;
}

/** Create a new timer when a match is formed */
export function createMatchTimer(
  matchId: string,
  initiatorGender: "male" | "female" | "other",
  respectfulMode: boolean,
): MatchTimer {
  const now = Date.now();
  return {
    matchId,
    matchedAt: now,
    expiresAt: now + MS_48H,
    extended: false,
    initiatorGender,
    firstMover: respectfulMode ? "female" : null,
  };
}

/** Remaining time in ms (0 if expired) */
export function getTimeRemaining(timer: MatchTimer): number {
  return Math.max(0, timer.expiresAt - Date.now());
}

/** Format remaining time as human-readable string */
export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return "Expired";
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const h = hours % 24;
    return `${days}d ${h}h`;
  }
  return `${hours}h ${minutes}m`;
}

/** Hindi formatted time */
export function formatTimeRemainingHi(ms: number): string {
  if (ms <= 0) return "समाप्त";
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const h = hours % 24;
    return `${days}दि ${h}घं`;
  }
  return `${hours}घं ${minutes}मि`;
}

/** Extend the timer by another 48 hours (one free extension) */
export function extendTimer(timer: MatchTimer): MatchTimer {
  if (timer.extended) return timer; // already used
  return {
    ...timer,
    expiresAt: timer.expiresAt + MS_48H,
    extended: true,
  };
}

/** Check if timer is expired */
export function isTimerExpired(timer: MatchTimer): boolean {
  return getTimeRemaining(timer) <= 0;
}

/** Check which urgency tier we're in */
export function getUrgencyLevel(
  timer: MatchTimer,
): "none" | "low" | "medium" | "high" | "critical" {
  const remaining = getTimeRemaining(timer);
  if (remaining <= 0) return "critical";
  if (remaining <= MS_6H) return "high";
  if (remaining <= MS_12H) return "medium";
  if (remaining <= MS_24H) return "low";
  return "none";
}

/** Check if the current user can message first */
export function canMessageFirst(
  timer: MatchTimer,
  userGender: "male" | "female" | "other",
): boolean {
  // If no first-mover restriction, anyone can message
  if (!timer.firstMover) return true;
  // If respectful mode is on, only female can message first
  return userGender === timer.firstMover;
}

/** localStorage helpers for timer persistence */
const TIMERS_KEY = "bandhan-match-timers";

export function saveTimers(timers: MatchTimer[]): void {
  try {
    localStorage.setItem(TIMERS_KEY, JSON.stringify(timers));
  } catch { /* ignore */ }
}

export function loadTimers(): MatchTimer[] {
  try {
    const stored = localStorage.getItem(TIMERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}
