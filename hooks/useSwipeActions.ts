/**
 * Bandhan AI — Swipe/Tap Action Hooks
 * Gesture detection for tap-to-like, hold-to-view, X-to-pass.
 * Includes undo, daily limits, and special interest tracking.
 */

"use client";

import { useState, useCallback, useRef, useEffect } from "react";

// ─── Types ───────────────────────────────────────────────────────────────
export type ActionType = "like" | "pass" | "special" | "undo";

export interface SwipeAction {
  profileId: string;
  action: ActionType;
  timestamp: number;
}

export interface UseSwipeActionsReturn {
  actions: SwipeAction[];
  lastAction: SwipeAction | null;
  like: (profileId: string) => void;
  pass: (profileId: string) => void;
  specialInterest: (profileId: string) => boolean;
  undo: () => SwipeAction | null;
  canUndo: boolean;
  specialInterestRemaining: number;
  dailyLikesRemaining: number;
  resetDailyLimits: () => void;
}

// ─── Storage Keys ────────────────────────────────────────────────────────
const ACTIONS_KEY = "bandhan-swipe-actions";
const LIMITS_KEY = "bandhan-daily-limits";

function getTodayKey(): string {
  return new Date().toISOString().split("T")[0];
}

interface DailyLimits {
  date: string;
  likes: number;
  specialInterests: number;
}

function loadLimits(): DailyLimits {
  try {
    const stored = localStorage.getItem(LIMITS_KEY);
    const limits: DailyLimits = stored ? JSON.parse(stored) : null;
    if (limits && limits.date === getTodayKey()) return limits;
    return { date: getTodayKey(), likes: 0, specialInterests: 0 };
  } catch {
    return { date: getTodayKey(), likes: 0, specialInterests: 0 };
  }
}

function saveLimits(limits: DailyLimits): void {
  try {
    localStorage.setItem(LIMITS_KEY, JSON.stringify(limits));
  } catch {
    /* ignore */
  }
}

// ─── Constants ───────────────────────────────────────────────────────────
const MAX_DAILY_LIKES = 25;
const MAX_DAILY_SPECIAL = 1; // 1 per day for free users

// ─── Hook ────────────────────────────────────────────────────────────────
export function useSwipeActions(): UseSwipeActionsReturn {
  const [actions, setActions] = useState<SwipeAction[]>([]);
  const [limits, setLimits] = useState<DailyLimits>({
    date: getTodayKey(),
    likes: 0,
    specialInterests: 0,
  });
  const undoStackRef = useRef<SwipeAction[]>([]);

  // Hydrate limits from localStorage on client mount (SSR-safe)
  useEffect(() => {
    setLimits(loadLimits());
  }, []);

  const addAction = useCallback((profileId: string, action: ActionType) => {
    const entry: SwipeAction = { profileId, action, timestamp: Date.now() };
    setActions((prev) => [...prev, entry]);
    undoStackRef.current.push(entry);
    return entry;
  }, []);

  const like = useCallback(
    (profileId: string) => {
      if (limits.likes >= MAX_DAILY_LIKES) return;
      addAction(profileId, "like");
      const newLimits = { ...limits, likes: limits.likes + 1 };
      setLimits(newLimits);
      saveLimits(newLimits);
    },
    [limits, addAction],
  );

  const pass = useCallback(
    (profileId: string) => {
      addAction(profileId, "pass");
    },
    [addAction],
  );

  const specialInterest = useCallback(
    (profileId: string): boolean => {
      if (limits.specialInterests >= MAX_DAILY_SPECIAL) return false;
      addAction(profileId, "special");
      const newLimits = {
        ...limits,
        specialInterests: limits.specialInterests + 1,
      };
      setLimits(newLimits);
      saveLimits(newLimits);
      return true;
    },
    [limits, addAction],
  );

  const undo = useCallback((): SwipeAction | null => {
    const last = undoStackRef.current.pop();
    if (!last) return null;

    setActions((prev) => prev.filter((a) => a !== last));

    // Restore limit counts
    if (last.action === "like") {
      const newLimits = { ...limits, likes: Math.max(0, limits.likes - 1) };
      setLimits(newLimits);
      saveLimits(newLimits);
    } else if (last.action === "special") {
      const newLimits = {
        ...limits,
        specialInterests: Math.max(0, limits.specialInterests - 1),
      };
      setLimits(newLimits);
      saveLimits(newLimits);
    }

    return last;
  }, [limits]);

  const resetDailyLimits = useCallback(() => {
    const newLimits: DailyLimits = {
      date: getTodayKey(),
      likes: 0,
      specialInterests: 0,
    };
    setLimits(newLimits);
    saveLimits(newLimits);
  }, []);

  return {
    actions,
    lastAction: actions.length > 0 ? actions[actions.length - 1] : null,
    like,
    pass,
    specialInterest,
    undo,
    canUndo: undoStackRef.current.length > 0,
    specialInterestRemaining: MAX_DAILY_SPECIAL - limits.specialInterests,
    dailyLikesRemaining: MAX_DAILY_LIKES - limits.likes,
    resetDailyLimits,
  };
}
