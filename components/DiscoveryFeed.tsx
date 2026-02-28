/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Discovery Feed
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Full-page discovery feed with:
 *   • Card stack with tap-to-like / tap-to-pass (Indian mobile UX)
 *   • Quick filter chips (horizontal scroll)
 *   • "Perfect Match of the Day" banner
 *   • Daily limit counter (profile views + likes)
 *   • Match celebration toast
 *   • Loading skeletons
 *   • Empty states
 *   • Comic book monochrome aesthetic
 *
 * Data layer: lib/firebase/matches.ts
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Loader2,
  SlidersHorizontal,
  RefreshCw,
  Crown,
  Frown,
  ChevronRight,
  X,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { ProfileCard } from "@/components/ProfileCard";
import { ActionButtons } from "@/components/ActionButtons";

import {
  getDiscoverableUsers,
  createInterest,
  passOnProfile,
  getDailyLimitsStatus,
  type DiscoverableUser,
  type DiscoveryFilters,
  type DailyLimitsStatus,
  type MatchServiceError,
} from "@/lib/firebase/matches";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

// ─── Types ───────────────────────────────────────────────────────────────

export interface DiscoveryFeedProps {
  /** Current user UID */
  userId: string;
  /** Whether current user is premium */
  isPremium: boolean;
  /** Called when a new match is created */
  onMatch?: (matchId: string, otherUserName: string) => void;
}

interface FilterChip {
  id: string;
  label: string;
  filterKey: keyof DiscoveryFilters;
  filterValue: string | boolean;
}

// ─── Filter chips ────────────────────────────────────────────────────────

const FILTER_CHIPS: FilterChip[] = [
  {
    id: "verified",
    label: "Verified Only",
    filterKey: "verifiedOnly",
    filterValue: true,
  },
  {
    id: "marriage",
    label: "Marriage",
    filterKey: "intent",
    filterValue: "marriage-soon",
  },
  {
    id: "serious",
    label: "Serious",
    filterKey: "intent",
    filterValue: "serious-relationship",
  },
  {
    id: "veg",
    label: "Vegetarian",
    filterKey: "diet",
    filterValue: "vegetarian",
  },
];

// ─── Skeleton ────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000000]">
      <div className="h-56 bg-[#E0E0E0] animate-pulse" />
      <div className="p-4 border-t-2 border-black space-y-3">
        <div className="h-4 w-2/3 bg-[#E0E0E0] animate-pulse" />
        <div className="h-3 w-1/2 bg-[#E0E0E0] animate-pulse" />
        <div className="flex gap-2">
          <div className="h-5 w-20 bg-[#E0E0E0] animate-pulse" />
          <div className="h-5 w-24 bg-[#E0E0E0] animate-pulse" />
        </div>
        <div className="h-8 w-full bg-[#E0E0E0] animate-pulse mt-4" />
      </div>
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────

function EmptyState({
  isLimitReached,
  onRefresh,
}: {
  isLimitReached: boolean;
  onRefresh: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center px-6 py-16 text-center"
    >
      <div className="w-16 h-16 flex items-center justify-center border-2 border-black bg-[#F8F8F8] shadow-[4px_4px_0px_#000000] mb-6">
        {isLimitReached ? (
          <Crown className="w-7 h-7 text-black" strokeWidth={2} />
        ) : (
          <Frown className="w-7 h-7 text-[#9E9E9E]" strokeWidth={2} />
        )}
      </div>

      <h3 className="text-sm font-bold text-black uppercase tracking-wider mb-2">
        {isLimitReached ? "Daily Limit Reached" : "No More Profiles"}
      </h3>

      <p className="text-xs text-[#9E9E9E] max-w-[240px] mb-6 leading-relaxed">
        {isLimitReached
          ? "You've viewed all available profiles for today. Come back tomorrow or upgrade to Premium for unlimited discovery!"
          : "We've run out of profiles matching your filters. Try adjusting your filters or check back later."}
      </p>

      {!isLimitReached && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onRefresh}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5",
            "text-xs font-bold uppercase tracking-wider",
            "bg-white text-black border-[3px] border-black",
            "shadow-[4px_4px_0px_#000000]",
            "hover:bg-black hover:text-white",
            "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000]",
            "transition-all duration-150 cursor-pointer",
          )}
        >
          <RefreshCw className="w-3.5 h-3.5" strokeWidth={2.5} />
          Refresh
        </motion.button>
      )}
    </motion.div>
  );
}

// ─── Match celebration toast ─────────────────────────────────────────────

function MatchToast({
  name,
  onDismiss,
}: {
  name: string;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ y: 80, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 80, opacity: 0, scale: 0.9 }}
      className={cn(
        "fixed bottom-28 left-1/2 -translate-x-1/2 z-50",
        "flex items-center gap-3 px-6 py-4",
        "bg-black text-white border-[3px] border-white",
        "shadow-[6px_6px_0px_#000000]",
      )}
    >
      <Heart className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} fill="white" />
      <span className="text-sm font-bold uppercase tracking-wider">
        Matched with {name}!
      </span>
      <button
        onClick={onDismiss}
        className="ml-2 bg-transparent border-none cursor-pointer text-white p-0"
      >
        <X className="w-4 h-4" strokeWidth={2.5} />
      </button>
    </motion.div>
  );
}

// ─── Daily limits bar ────────────────────────────────────────────────────

function LimitsBar({ limits }: { limits: DailyLimitsStatus }) {
  const profilePct = Math.min(
    100,
    (limits.profilesViewed / limits.profilesLimit) * 100,
  );

  return (
    <div className="px-4 py-2 bg-[#F8F8F8] border-2 border-black border-t-0">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9px] font-bold text-[#9E9E9E] uppercase tracking-wider">
          Profiles today
        </span>
        <span className="text-[10px] font-bold text-black">
          {limits.profilesViewed}/{limits.profilesLimit}
        </span>
      </div>
      <div className="w-full h-1.5 bg-[#E0E0E0] border border-black">
        <div
          className="h-full bg-black transition-all duration-300"
          style={{ width: `${profilePct}%` }}
        />
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════

export function DiscoveryFeed({
  userId,
  isPremium,
  onMatch,
}: DiscoveryFeedProps) {
  // ── State ──
  const [users, setUsers] = useState<DiscoverableUser[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState<
    "like" | "pass" | "special" | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [matchToast, setMatchToast] = useState<string | null>(null);
  const [limits, setLimits] = useState<DailyLimitsStatus | null>(null);
  const [undoStack, setUndoStack] = useState<number[]>([]);
  const loadedRef = useRef(false);

  // ── Current user being viewed ──
  const currentUser = users[currentIndex] ?? null;
  const hasMore = currentIndex < users.length;

  // ── Build filters from active chips ──
  const buildFilters = useCallback((): DiscoveryFilters => {
    const filters: DiscoveryFilters = {};
    for (const chipId of activeFilters) {
      const chip = FILTER_CHIPS.find((c) => c.id === chipId);
      if (!chip) continue;
      (filters as any)[chip.filterKey] = chip.filterValue;
    }
    return filters;
  }, [activeFilters]);

  // ── Load discovery feed ──
  const loadFeed = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsLimitReached(false);

    try {
      const filters = buildFilters();
      const results = await getDiscoverableUsers(userId, filters);
      setUsers(results);
      setCurrentIndex(0);
      setUndoStack([]);
      setLimits(getDailyLimitsStatus(isPremium));
    } catch (err) {
      const e = err as MatchServiceError;
      if (e.code === "match/profiles-limit") {
        setIsLimitReached(true);
      } else {
        setError(e.en ?? "Failed to load profiles.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId, isPremium, buildFilters]);

  // ── Initial load ──
  useEffect(() => {
    if (!loadedRef.current) {
      loadedRef.current = true;
      loadFeed();
    }
  }, [loadFeed]);

  // ── Reload when filters change ──
  useEffect(() => {
    if (loadedRef.current) {
      loadFeed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilters]);

  // ── Advance to next card ──
  const advance = useCallback(() => {
    setCurrentIndex((i) => i + 1);
    setLimits(getDailyLimitsStatus(isPremium));
  }, [isPremium]);

  // ── Handle Like ──
  const handleLike = useCallback(async () => {
    if (!currentUser) return;
    setLoadingAction("like");
    try {
      const result = await createInterest(userId, currentUser.user.uid, "like");
      if (result.isMatch) {
        setMatchToast(currentUser.user.name);
        onMatch?.(result.matchId!, currentUser.user.name);
      }
      setUndoStack((prev) => [...prev, currentIndex]);
      advance();
    } catch (err) {
      const e = err as MatchServiceError;
      setError(e.en ?? "Failed to send like.");
    } finally {
      setLoadingAction(null);
    }
  }, [currentUser, userId, currentIndex, advance, onMatch]);

  // ── Handle Pass ──
  const handlePass = useCallback(async () => {
    if (!currentUser) return;
    setLoadingAction("pass");
    try {
      await passOnProfile(userId, currentUser.user.uid);
      setUndoStack((prev) => [...prev, currentIndex]);
      advance();
    } catch {
      // Non-fatal
    } finally {
      setLoadingAction(null);
    }
  }, [currentUser, userId, currentIndex, advance]);

  // ── Handle Special Interest ──
  const handleSpecialInterest = useCallback(async () => {
    if (!currentUser) return;
    setLoadingAction("special");
    try {
      const result = await createInterest(
        userId,
        currentUser.user.uid,
        "special",
      );
      if (result.isMatch) {
        setMatchToast(currentUser.user.name);
        onMatch?.(result.matchId!, currentUser.user.name);
      }
      setUndoStack((prev) => [...prev, currentIndex]);
      advance();
    } catch (err) {
      const e = err as MatchServiceError;
      setError(e.en ?? "Failed to send Special Interest.");
    } finally {
      setLoadingAction(null);
    }
  }, [currentUser, userId, currentIndex, advance, onMatch]);

  // ── Handle Undo ──
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const prevIndex = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setCurrentIndex(prevIndex);
  }, [undoStack]);

  // ── Toggle filter chip ──
  const toggleFilter = useCallback((chipId: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(chipId)) {
        next.delete(chipId);
      } else {
        // If toggling an intent filter, remove other intent filters
        const chip = FILTER_CHIPS.find((c) => c.id === chipId);
        if (chip?.filterKey === "intent") {
          FILTER_CHIPS.filter((c) => c.filterKey === "intent").forEach((c) =>
            next.delete(c.id),
          );
        }
        next.add(chipId);
      }
      return next;
    });
  }, []);

  // ── Render ──

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* ── Filter chips ── */}
      <div className="px-4 py-3 border-2 border-black bg-white shadow-[4px_4px_0px_#000000] mb-0">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5">
          <SlidersHorizontal
            className="w-4 h-4 text-[#9E9E9E] flex-shrink-0"
            strokeWidth={2.5}
          />
          {FILTER_CHIPS.map((chip) => {
            const isActive = activeFilters.has(chip.id);
            return (
              <button
                key={chip.id}
                onClick={() => toggleFilter(chip.id)}
                className={cn(
                  "flex-shrink-0 px-3 py-1.5",
                  "text-[10px] font-bold uppercase tracking-wider",
                  "border-2 border-black cursor-pointer whitespace-nowrap",
                  "transition-all duration-100",
                  isActive
                    ? "bg-black text-white shadow-[2px_2px_0px_#000000]"
                    : "bg-white text-black hover:bg-[#F8F8F8]",
                )}
              >
                {chip.label}
              </button>
            );
          })}
          {activeFilters.size > 0 && (
            <button
              onClick={() => setActiveFilters(new Set())}
              className="flex-shrink-0 text-[9px] font-bold text-[#9E9E9E] hover:text-black bg-transparent border-none cursor-pointer uppercase tracking-wider px-1"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Daily limits bar ── */}
      {limits && <LimitsBar limits={limits} />}

      {/* ── Error banner ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 bg-white border-2 border-dashed border-black flex items-center justify-between gap-2 mt-4">
              <p className="text-xs text-[#212121] font-medium">{error}</p>
              <button
                onClick={() => setError(null)}
                className="bg-transparent border-none cursor-pointer p-0 flex-shrink-0"
              >
                <X className="w-3.5 h-3.5 text-[#9E9E9E]" strokeWidth={2.5} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Loading state ── */}
      {isLoading && (
        <div className="mt-4 space-y-4">
          <CardSkeleton />
        </div>
      )}

      {/* ── Empty / limit reached state ── */}
      {!isLoading && (!hasMore || isLimitReached) && (
        <EmptyState isLimitReached={isLimitReached} onRefresh={loadFeed} />
      )}

      {/* ── Card stack ── */}
      {!isLoading && hasMore && !isLimitReached && currentUser && (
        <div className="mt-4">
          <AnimatePresence mode="wait">
            <ProfileCard
              key={currentUser.user.uid}
              user={currentUser.user}
              compatibility={currentUser.compatibility}
              compatibilityReasons={currentUser.compatibilityReasons}
              isPerfectMatch={currentUser.isPerfectMatch}
            >
              {/* Action buttons embedded in card footer */}
              <ActionButtons
                onPass={handlePass}
                onLike={handleLike}
                onSpecialInterest={handleSpecialInterest}
                onUndo={handleUndo}
                canUndo={undoStack.length > 0}
                isLoading={loadingAction !== null}
                loadingAction={loadingAction}
                specialInterestAvailable={
                  (limits?.specialInterestUsed ?? 0) <
                  (limits?.specialInterestLimit ?? 1)
                }
                specialInterestRemaining={
                  (limits?.specialInterestLimit ?? 1) -
                  (limits?.specialInterestUsed ?? 0)
                }
                likesRemaining={
                  (limits?.likesLimit ?? 5) - (limits?.likesUsed ?? 0)
                }
              />
            </ProfileCard>
          </AnimatePresence>

          {/* ── Remaining count ── */}
          <div className="mt-3 flex items-center justify-center">
            <span className="text-[9px] font-bold text-[#9E9E9E] uppercase tracking-wider">
              {users.length - currentIndex - 1} more profile
              {users.length - currentIndex - 1 !== 1 ? "s" : ""} today
            </span>
          </div>
        </div>
      )}

      {/* ── Match toast ── */}
      <AnimatePresence>
        {matchToast && (
          <MatchToast name={matchToast} onDismiss={() => setMatchToast(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default DiscoveryFeed;
