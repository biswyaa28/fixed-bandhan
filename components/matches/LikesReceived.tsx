/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Likes Received (Tab 2)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Three sections:
 *   1. "⭐ Special Interests (N)" — star badge, priority display
 *   2. "💎 Premium Interests (N)" — rose/diamond badge
 *   3. "❤️ Regular Likes (N)" — standard likes
 *
 * Each card:
 *   • Blurred photo (CSS blur(8px) + Lock overlay) until mutual like
 *   • Name (first name or "???"), age, city
 *   • Compatibility %, verification badge
 *   • "Like Back" button → creates mutual match
 *   • "Pass" button → dismisses
 *
 * Comic-book aesthetic: 2px black borders, hard shadows, monochromatic.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Heart,
  X,
  Lock,
  Star,
  Diamond,
  Shield,
  ShieldCheck,
  Clock,
  Crown,
} from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { type InterestType, SpecialInterestBadge } from "./SpecialInterestBadge";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface LikeProfile {
  id: string;
  name: string;
  age: number;
  city: string;
  initials: string;
  gradientFrom: string;
  gradientTo: string;
  verificationLevel: "bronze" | "silver" | "gold";
  compatibility: number;
  likedAt: string;
  interestType: InterestType;
  /** Optional appreciation message */
  appreciationMessage?: string;
}

export interface LikesReceivedProps {
  likes: LikeProfile[];
  isLoading?: boolean;
  onLikeBack?: (profileId: string) => void;
  onPass?: (profileId: string) => void;
  className?: string;
}

// ─── Verification badge ──────────────────────────────────────────────────────

const VERIF = {
  bronze: { bg: "bg-[#E0E0E0]", letter: "B", Icon: Shield },
  silver: { bg: "bg-[#9E9E9E]", letter: "S", Icon: Shield },
  gold: { bg: "bg-[#424242] text-white", letter: "G", Icon: ShieldCheck },
} as const;

function MiniBadge({ level }: { level: "bronze" | "silver" | "gold" }) {
  const v = VERIF[level];
  return (
    <span
      className={cn(
        "inline-flex h-4 w-4 items-center justify-center border border-black text-[6px] font-bold",
        v.bg,
      )}
      aria-label={`${level} verified`}
    >
      {v.letter}
    </span>
  );
}

// ─── Like Card ───────────────────────────────────────────────────────────────

function LikeCard({
  profile,
  onLikeBack,
  onPass,
}: {
  profile: LikeProfile;
  onLikeBack: () => void;
  onPass: () => void;
}) {
  const [dismissed, setDismissed] = useState(false);
  const [matched, setMatched] = useState(false);

  const handleLikeBack = useCallback(() => {
    setMatched(true);
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(15);
    onLikeBack();
    // Match toast disappears in parent
  }, [onLikeBack]);

  const handlePass = useCallback(() => {
    setDismissed(true);
    setTimeout(() => onPass(), 300);
  }, [onPass]);

  if (dismissed) return null;

  const isSpecial = profile.interestType === "special";
  const isPremium = profile.interestType === "premium";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: matched ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "mx-4 mb-3 border-[2px] bg-white",
        "shadow-[4px_4px_0px_#000000]",
        "transition-all duration-100",
        "hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_#000000]",
        isSpecial ? "border-[#FFD700]" : isPremium ? "border-[#EF476F]" : "border-black",
      )}
    >
      <div className="flex gap-3 p-3">
        {/* Blurred avatar */}
        <div className="relative flex-shrink-0">
          <div
            className="flex h-16 w-16 items-center justify-center overflow-hidden border-[2px] border-black"
            style={{
              background: `linear-gradient(135deg, ${profile.gradientFrom}, ${profile.gradientTo})`,
            }}
          >
            <span
              className="select-none font-heading text-xl font-bold leading-none text-black"
              style={{ filter: "blur(8px)" }}
            >
              {profile.initials}
            </span>
          </div>
          {/* Lock overlay */}
          <div className="absolute inset-0 flex items-center justify-center border-[2px] border-black bg-white/30">
            <Lock className="h-4 w-4 text-black" strokeWidth={2.5} />
          </div>
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          {/* Badge */}
          <div className="mb-1">
            <SpecialInterestBadge type={profile.interestType} size="sm" />
          </div>

          {/* Name + badge */}
          <div className="mb-0.5 flex items-center gap-1">
            <span className="truncate font-heading text-sm font-bold text-[#212121]">
              {profile.name}, {profile.age}
            </span>
            <MiniBadge level={profile.verificationLevel} />
          </div>

          {/* City + time */}
          <div className="mb-1 flex items-center gap-2">
            <span className="text-[8px] uppercase tracking-wider text-[#9E9E9E]">
              {profile.city}
            </span>
            <span className="text-[8px] text-[#9E9E9E]">·</span>
            <span className="flex items-center gap-0.5 text-[8px] text-[#9E9E9E]">
              <Clock className="h-2.5 w-2.5" strokeWidth={2} />
              {profile.likedAt}
            </span>
          </div>

          {/* Compatibility */}
          <span className="inline-flex items-center gap-0.5 border border-black bg-black px-1.5 py-0.5 text-[7px] font-bold text-white">
            <Heart className="h-2.5 w-2.5" strokeWidth={2.5} />
            {profile.compatibility}% Match
          </span>
        </div>
      </div>

      {/* Appreciation message */}
      {profile.appreciationMessage && (
        <div className="mx-3 mb-2 border border-dashed border-[#E0E0E0] bg-[#F8F8F8] px-2 py-1.5">
          <p className="m-0 text-[10px] italic leading-snug text-[#424242]">
            &quot;{profile.appreciationMessage}&quot;
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex border-t-[2px] border-black">
        {/* Pass */}
        <button
          onClick={handlePass}
          disabled={matched}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 py-2.5",
            "cursor-pointer border-r border-black bg-white",
            "font-heading text-[9px] font-bold uppercase tracking-wider text-[#9E9E9E]",
            "transition-colors duration-100 hover:bg-[#F8F8F8]",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
          aria-label={`Pass on ${profile.name}`}
        >
          <X className="h-3.5 w-3.5" strokeWidth={2} />
          Pass
        </button>
        {/* Like Back */}
        <button
          onClick={handleLikeBack}
          disabled={matched}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 py-2.5",
            "cursor-pointer bg-black text-white",
            "font-heading text-[9px] font-bold uppercase tracking-wider",
            "transition-colors duration-100 hover:bg-[#424242]",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
          aria-label={`Like back ${profile.name}`}
        >
          <Heart className="h-3.5 w-3.5" strokeWidth={2.5} />
          {matched ? "Matched!" : "Like Back"}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Section Header ──────────────────────────────────────────────────────────

function SectionLabel({
  emoji,
  title,
  count,
}: {
  emoji: string;
  title: string;
  count: number;
}) {
  if (count === 0) return null;
  return (
    <div className="flex items-center gap-2 border-b-[2px] border-black bg-[#F8F8F8] px-4 py-2">
      <span className="text-sm" aria-hidden="true">
        {emoji}
      </span>
      <h3 className="m-0 font-heading text-[10px] font-bold uppercase tracking-widest text-black">
        {title}
      </h3>
      <span className="bg-black px-1.5 py-0.5 text-[7px] font-bold text-white">
        {count}
      </span>
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="px-8 py-16 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center border-[2px] border-black bg-[#F8F8F8] shadow-[4px_4px_0px_#000000]">
        <Star className="h-7 w-7 text-[#9E9E9E]" strokeWidth={1.5} />
      </div>
      <h3 className="mb-1 font-heading text-sm font-bold uppercase text-black">
        No Likes Yet
      </h3>
      <p className="m-0 mx-auto mb-4 max-w-xs text-xs text-[#9E9E9E]">
        Complete your profile to get noticed! Add photos and answer Life Story prompts.
      </p>
      <Link
        href="/profile"
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2 no-underline",
          "border-[2px] border-black bg-black text-white",
          "shadow-[3px_3px_0px_#000000]",
          "font-heading text-[10px] font-bold uppercase tracking-wider",
          "transition-colors duration-100 hover:bg-[#424242]",
        )}
      >
        Complete Profile
      </Link>
    </div>
  );
}

// ─── Premium Upsell ──────────────────────────────────────────────────────────

function PremiumUpsell({ blurredCount }: { blurredCount: number }) {
  if (blurredCount === 0) return null;
  return (
    <div className="mx-4 mb-4 border-[2px] border-dashed border-black bg-[#F8F8F8] px-3 py-3">
      <div className="mb-1 flex items-center gap-2">
        <Crown className="h-4 w-4 text-black" strokeWidth={2} />
        <span className="font-heading text-[10px] font-bold uppercase tracking-widest text-black">
          See who likes you
        </span>
      </div>
      <p className="m-0 mb-2 text-[9px] text-[#9E9E9E]">
        Upgrade to Premium to instantly see unblurred photos of {blurredCount} people who
        liked you.
      </p>
      <Link
        href="/premium"
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 no-underline",
          "border-[2px] border-black bg-black text-white",
          "shadow-[2px_2px_0px_#000000]",
          "font-heading text-[8px] font-bold uppercase tracking-wider",
          "transition-colors duration-100 hover:bg-[#424242]",
        )}
      >
        <Crown className="h-3 w-3" strokeWidth={2} />
        Upgrade
      </Link>
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function LikesSkeleton() {
  return (
    <div className="space-y-3 pt-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="mx-4 border-[2px] border-[#E0E0E0]">
          <div className="flex gap-3 p-3">
            <div className="h-16 w-16 flex-shrink-0 shimmer-bg" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-20 shimmer-bg" />
              <div className="h-4 w-36 shimmer-bg" />
              <div className="h-2 w-24 shimmer-bg" />
              <div className="h-3 w-16 shimmer-bg" />
            </div>
          </div>
          <div className="flex border-t border-[#E0E0E0]">
            <div className="h-10 flex-1 shimmer-bg" />
            <div className="h-10 flex-1 shimmer-bg" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function LikesReceived({
  likes,
  isLoading = false,
  onLikeBack,
  onPass,
  className,
}: LikesReceivedProps) {
  const [matchToast, setMatchToast] = useState<string | null>(null);

  const specialLikes = likes.filter((l) => l.interestType === "special");
  const premiumLikes = likes.filter((l) => l.interestType === "premium");
  const regularLikes = likes.filter((l) => l.interestType === "regular");

  const handleLikeBack = useCallback(
    (profile: LikeProfile) => {
      onLikeBack?.(profile.id);
      setMatchToast(profile.name);
      setTimeout(() => setMatchToast(null), 2500);
    },
    [onLikeBack],
  );

  const handlePass = useCallback(
    (profileId: string) => {
      onPass?.(profileId);
    },
    [onPass],
  );

  if (isLoading) return <LikesSkeleton />;
  if (likes.length === 0) return <EmptyState />;

  return (
    <div className={cn("pb-4", className)}>
      {/* Premium upsell */}
      <div className="pt-3">
        <PremiumUpsell blurredCount={likes.length} />
      </div>

      {/* ── Special Interests ── */}
      {specialLikes.length > 0 && (
        <div>
          <SectionLabel
            emoji="⭐"
            title="Special Interests"
            count={specialLikes.length}
          />
          <div className="pt-3">
            <AnimatePresence>
              {specialLikes.map((l) => (
                <LikeCard
                  key={l.id}
                  profile={l}
                  onLikeBack={() => handleLikeBack(l)}
                  onPass={() => handlePass(l.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ── Premium Interests ── */}
      {premiumLikes.length > 0 && (
        <div>
          <SectionLabel
            emoji="💎"
            title="Premium Interests"
            count={premiumLikes.length}
          />
          <div className="pt-3">
            <AnimatePresence>
              {premiumLikes.map((l) => (
                <LikeCard
                  key={l.id}
                  profile={l}
                  onLikeBack={() => handleLikeBack(l)}
                  onPass={() => handlePass(l.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ── Regular Likes ── */}
      {regularLikes.length > 0 && (
        <div>
          <SectionLabel emoji="❤️" title="Regular Likes" count={regularLikes.length} />
          <div className="pt-3">
            <AnimatePresence>
              {regularLikes.map((l) => (
                <LikeCard
                  key={l.id}
                  profile={l}
                  onLikeBack={() => handleLikeBack(l)}
                  onPass={() => handlePass(l.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ── Match toast ── */}
      <AnimatePresence>
        {matchToast && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            className={cn(
              "fixed bottom-24 left-1/2 z-50 -translate-x-1/2 lg:bottom-8",
              "flex items-center gap-2 px-4 py-2",
              "border-[2px] border-black bg-black text-white",
              "shadow-[4px_4px_0px_#000000]",
            )}
          >
            <Heart className="h-4 w-4" strokeWidth={2.5} />
            <span className="font-heading text-xs font-bold">
              You matched with {matchToast}! 🎉
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LikesReceived;
