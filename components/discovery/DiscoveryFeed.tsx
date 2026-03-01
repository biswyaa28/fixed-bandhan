/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Discovery Feed Container
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Orchestrates the full discovery experience:
 *   1. Daily limit counter (sticky header)
 *   2. "Perfect Match of the Day" card (gold border)
 *   3. Quick Filters (horizontal scroll)
 *   4. Suggested Matches (vertical card list)
 *   5. Fixed Action Buttons at bottom
 *
 * State management:
 *   • Current profile index for action buttons
 *   • Daily limit tracking (persisted in localStorage)
 *   • Filter state (passed to QuickFilters)
 *   • Loading / empty states
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Crown, RotateCcw, Heart } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { type DiscoveryProfile, ProfileCard, ProfileCardSkeleton } from "./ProfileCard";
import { PerfectMatchCard } from "./PerfectMatchCard";
import { QuickFilters } from "./QuickFilters";
import { ActionButtons } from "./ActionButtons";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_PROFILES: DiscoveryProfile[] = [
  {
    id: "1",
    name: "Priya Sharma",
    age: 26,
    city: "Mumbai",
    verificationLevel: "gold",
    intent: "Marriage Soon",
    compatibility: 94,
    education: "IIM Ahmedabad",
    bio: "Product Manager who loves travel, reading, and chai. Looking for someone who values both career and family.",
    initials: "PS",
    gradientFrom: "#EDE9FE",
    gradientTo: "#DDD6FE",
    isBlurred: true,
  },
  {
    id: "2",
    name: "Ananya Iyer",
    age: 25,
    city: "Chennai",
    verificationLevel: "silver",
    intent: "Serious",
    compatibility: 87,
    education: "Anna University",
    bio: "Doctor who loves classical music and long walks. Looking for someone kind and family-oriented.",
    initials: "AI",
    gradientFrom: "#FFE4EA",
    gradientTo: "#FECDD8",
    isBlurred: true,
  },
  {
    id: "3",
    name: "Sneha Patel",
    age: 27,
    city: "Ahmedabad",
    verificationLevel: "gold",
    intent: "Marriage Soon",
    compatibility: 82,
    education: "NIT Surathkal",
    bio: "Entrepreneur running a D2C brand. Family values matter most to me alongside individual growth.",
    initials: "SP",
    gradientFrom: "#FEF3C7",
    gradientTo: "#FDE68A",
    isBlurred: true,
  },
  {
    id: "4",
    name: "Kavya Nair",
    age: 24,
    city: "Kochi",
    verificationLevel: "bronze",
    intent: "Serious",
    compatibility: 78,
    education: "Cochin University",
    bio: "Teacher and poet. I believe every relationship is built on friendship first.",
    initials: "KN",
    gradientFrom: "#DCFCE7",
    gradientTo: "#BBF7D0",
    isBlurred: true,
  },
  {
    id: "5",
    name: "Riya Gupta",
    age: 26,
    city: "Delhi",
    verificationLevel: "silver",
    intent: "Marriage Soon",
    compatibility: 75,
    education: "Delhi University",
    bio: "Fashion designer with a love for art history. Looking for someone who appreciates culture.",
    initials: "RG",
    gradientFrom: "#E0F2FE",
    gradientTo: "#BAE6FD",
    isBlurred: true,
  },
];

const PERFECT_MATCH = MOCK_PROFILES[0]!;
const PERFECT_REASONS = [
  "Both value family & career equally",
  "Same city preference: Mumbai",
  "Shared interest: Travel & reading",
];

const DAILY_LIMIT = 5;
const STORAGE_KEY = "bandhan_daily_limit";

// ─────────────────────────────────────────────────────────────────────────────
// Daily limit persistence
// ─────────────────────────────────────────────────────────────────────────────

function getDailyUsed(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    const { date, used } = JSON.parse(raw);
    // Reset if it's a new day
    const today = new Date().toISOString().slice(0, 10);
    if (date !== today) return 0;
    return typeof used === "number" ? used : 0;
  } catch {
    return 0;
  }
}

function setDailyUsed(used: number) {
  if (typeof window === "undefined") return;
  const today = new Date().toISOString().slice(0, 10);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, used }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

export interface DiscoveryFeedProps {
  /** Called when user taps on a profile card (open detail modal) */
  onProfileTap?: (profile: DiscoveryProfile) => void;
  /** Called when user long-presses (open appreciate modal) */
  onProfileLongPress?: (profile: DiscoveryProfile) => void;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function DiscoveryFeed({
  onProfileTap,
  onProfileLongPress,
  className,
}: DiscoveryFeedProps) {
  const [profiles, setProfiles] = useState<DiscoveryProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dailyUsed, setDailyUsedState] = useState(0);
  const [likedName, setLikedName] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const remaining = DAILY_LIMIT - dailyUsed;
  const limitReached = remaining <= 0;
  const currentProfile = profiles[currentIndex] ?? null;
  const isEmpty = !isLoading && profiles.length === 0;
  const isExhausted = !isLoading && currentIndex >= profiles.length;

  // ── Initial load ──
  useEffect(() => {
    const used = getDailyUsed();
    setDailyUsedState(used);

    const timer = setTimeout(() => {
      setProfiles(MOCK_PROFILES);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // ── Like ──
  const handleLike = useCallback(() => {
    if (!currentProfile || limitReached) return;
    setLikedName(currentProfile.name);
    const newUsed = dailyUsed + 1;
    setDailyUsedState(newUsed);
    setDailyUsed(newUsed);
    setCurrentIndex((i) => i + 1);

    setTimeout(() => setLikedName(null), 2500);
  }, [currentProfile, dailyUsed, limitReached]);

  // ── Pass ──
  const handlePass = useCallback(() => {
    if (!currentProfile) return;
    setCurrentIndex((i) => i + 1);
  }, [currentProfile]);

  // ── Appreciate ──
  const handleAppreciate = useCallback(() => {
    if (!currentProfile) return;
    onProfileLongPress?.(currentProfile);
  }, [currentProfile, onProfileLongPress]);

  // ── Reset (demo) ──
  const handleReset = useCallback(() => {
    setProfiles(MOCK_PROFILES);
    setCurrentIndex(0);
    setDailyUsedState(0);
    setDailyUsed(0);
  }, []);

  return (
    <div className={cn("relative", className)}>
      {/* ═══════════════════════════════════════════════════════════════
          1. STICKY HEADER — Daily Limit Counter
         ═══════════════════════════════════════════════════════════════ */}
      <div className="sticky top-[63px] z-30 border-b-[2px] border-black bg-white px-4 py-2">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <div>
            <h1 className="m-0 font-heading text-base font-bold uppercase tracking-wide text-black">
              Discover
            </h1>
            <p className="m-0 text-[10px] text-[#9E9E9E]">
              {profiles.length - currentIndex} profiles to review
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Daily counter */}
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5">
                {Array.from({ length: DAILY_LIMIT }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-3 w-2",
                      i < dailyUsed ? "bg-black" : "bg-[#E0E0E0]",
                      "border border-black",
                    )}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <span className="text-[10px] font-bold tabular-nums text-[#424242]">
                {remaining}/{DAILY_LIMIT}
              </span>
            </div>
            {limitReached && (
              <Link
                href="/premium"
                className="flex items-center gap-0.5 border-[2px] border-black bg-black px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-white no-underline"
              >
                <Crown className="h-3 w-3" strokeWidth={2.5} />
                Upgrade
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          FEED CONTENT
         ═══════════════════════════════════════════════════════════════ */}
      <div className="mx-auto max-w-lg space-y-4 px-4 py-4 pb-36">
        {/* ── 2. Perfect Match of the Day ── */}
        <PerfectMatchCard
          profile={isLoading ? null : PERFECT_MATCH}
          reasons={PERFECT_REASONS}
          onTap={(p) => onProfileTap?.(p)}
          isLoading={isLoading}
        />

        {/* ── 3. Quick Filters ── */}
        <QuickFilters onFiltersChange={setActiveFilters} className="-mx-4" />

        {/* ── Active filters label ── */}
        {activeFilters.length > 0 && (
          <p className="m-0 px-1 text-[10px] uppercase tracking-widest text-[#9E9E9E]">
            Showing {activeFilters.length} filter{activeFilters.length !== 1 ? "s" : ""}
          </p>
        )}

        {/* ── 4. Suggested Matches — Card Stack ── */}
        <div>
          <h2 className="m-0 mb-3 px-1 font-heading text-xs font-bold uppercase tracking-widest text-[#9E9E9E]">
            Suggested Matches
          </h2>

          {isLoading ? (
            /* Skeleton state */
            <div className="space-y-4">
              <ProfileCardSkeleton />
              <ProfileCardSkeleton />
            </div>
          ) : isExhausted || isEmpty ? (
            /* Empty / exhausted state */
            <EmptyState onReset={handleReset} limitReached={limitReached} />
          ) : (
            /* Profile cards */
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {profiles.slice(currentIndex, currentIndex + 3).map((profile, i) => (
                  <motion.div
                    key={profile.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16, scale: 0.97 }}
                    transition={{ duration: 0.2, delay: i * 0.05 }}
                  >
                    <ProfileCard
                      profile={profile}
                      isActive={i === 0}
                      onTap={(p) => onProfileTap?.(p)}
                      onLongPress={(p) => onProfileLongPress?.(p)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          5. FIXED ACTION BUTTONS
         ═══════════════════════════════════════════════════════════════ */}
      {!isLoading && !isExhausted && !isEmpty && (
        <ActionButtons
          onPass={handlePass}
          onLike={handleLike}
          onAppreciate={handleAppreciate}
          disabled={!currentProfile}
          limitReached={limitReached}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════════
          LIKE TOAST
         ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {likedName && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            className={cn(
              "fixed bottom-36 left-1/2 z-50 -translate-x-1/2 lg:bottom-20",
              "flex items-center gap-2 px-4 py-2",
              "border-[2px] border-black bg-black text-white",
              "shadow-[4px_4px_0px_#000000]",
            )}
          >
            <Heart className="h-4 w-4" strokeWidth={2.5} />
            <span className="font-heading text-xs font-bold">You liked {likedName}!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Empty / Exhausted State
// ─────────────────────────────────────────────────────────────────────────────

function EmptyState({
  onReset,
  limitReached,
}: {
  onReset: () => void;
  limitReached: boolean;
}) {
  return (
    <div className="px-6 py-12 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center border-[2px] border-black bg-[#F8F8F8] shadow-[4px_4px_0px_#000000]">
        <Heart className="h-7 w-7 text-[#9E9E9E]" strokeWidth={1.5} />
      </div>
      <h3 className="mb-1 font-heading text-sm font-bold uppercase text-black">
        {limitReached ? "Daily Limit Reached" : "All Caught Up!"}
      </h3>
      <p className="mx-auto mb-6 max-w-xs text-xs text-[#9E9E9E]">
        {limitReached
          ? "Upgrade to Premium for unlimited profiles, or check back tomorrow."
          : "You've reviewed all profiles for today. Come back tomorrow for new suggestions!"}
      </p>
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={onReset}
          className={cn(
            "flex items-center gap-2 px-4 py-2",
            "border-[2px] border-black bg-white text-black",
            "shadow-[3px_3px_0px_#000000]",
            "font-heading text-[10px] font-bold uppercase tracking-wider",
            "cursor-pointer",
            "hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000000]",
            "transition-all duration-100",
          )}
        >
          <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
          Reset (Demo)
        </button>
        {limitReached && (
          <Link
            href="/premium"
            className={cn(
              "flex items-center gap-2 px-4 py-2",
              "border-[2px] border-black bg-black text-white",
              "shadow-[3px_3px_0px_#000000]",
              "font-heading text-[10px] font-bold uppercase tracking-wider",
              "no-underline",
              "hover:bg-[#424242]",
              "transition-colors duration-100",
            )}
          >
            <Crown className="h-3.5 w-3.5" strokeWidth={2} />
            Upgrade to Premium
          </Link>
        )}
      </div>
    </div>
  );
}

export default DiscoveryFeed;
