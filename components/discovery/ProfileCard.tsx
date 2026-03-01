/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Discovery Profile Card
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Single profile card in the discovery feed.
 *
 * Comic-book aesthetic:
 *   • 2px black border, 4px 4px hard shadow
 *   • Off-white (#F8F8F8) background
 *   • Blurred avatar placeholder (initials in block)
 *   • Bold heading font, 8px grid spacing
 *   • Long-press triggers "Appreciate" callback
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useRef, useCallback } from "react";
import { MapPin, GraduationCap, Shield, ShieldCheck, Lock, Heart } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface DiscoveryProfile {
  id: string;
  name: string;
  age: number;
  city: string;
  verificationLevel: "bronze" | "silver" | "gold";
  intent: string;
  compatibility: number;
  education: string;
  bio: string;
  initials: string;
  gradientFrom: string;
  gradientTo: string;
  isBlurred: boolean;
}

export interface ProfileCardProps {
  profile: DiscoveryProfile;
  /** Tap card → open detail modal */
  onTap?: (profile: DiscoveryProfile) => void;
  /** Long-press → open appreciate modal */
  onLongPress?: (profile: DiscoveryProfile) => void;
  /** True when this is the "active" card under the action buttons */
  isActive?: boolean;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Verification badge config
// ─────────────────────────────────────────────────────────────────────────────

const VERIF = {
  bronze: {
    bg: "bg-[#E0E0E0]",
    text: "text-black",
    letter: "B",
    label: "Phone Verified",
    Icon: Shield,
  },
  silver: {
    bg: "bg-[#9E9E9E]",
    text: "text-black",
    letter: "S",
    label: "ID Verified",
    Icon: Shield,
  },
  gold: {
    bg: "bg-[#424242]",
    text: "text-white",
    letter: "G",
    label: "Gold Verified",
    Icon: ShieldCheck,
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function ProfileCard({
  profile,
  onTap,
  onLongPress,
  isActive = false,
  className,
}: ProfileCardProps) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);

  // ── Long-press detection (500ms) ──
  const handlePointerDown = useCallback(() => {
    didLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      // Haptic feedback
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(30);
      }
      onLongPress?.(profile);
    }, 500);
  }, [profile, onLongPress]);

  const handlePointerUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleClick = useCallback(() => {
    if (didLongPress.current) return; // ignore tap after long-press
    onTap?.(profile);
  }, [profile, onTap]);

  const verif = VERIF[profile.verificationLevel];

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <article
      role="listitem"
      className={cn(
        "relative cursor-pointer select-none border-[2px] border-black bg-[#F8F8F8]",
        "shadow-[4px_4px_0px_#000000]",
        "transition-[transform,box-shadow] duration-150",
        "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000]",
        "active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        isActive && "ring-2 ring-black ring-offset-2",
        className,
      )}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onTap?.(profile);
        }
      }}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      aria-label={`${profile.name}, ${profile.age}, ${profile.city}. ${profile.compatibility}% match. Tap to view.`}
    >
      {/* ── Avatar / Photo Area ── */}
      <div
        className="relative h-44 overflow-hidden border-b-[2px] border-black"
        style={{
          background: `linear-gradient(135deg, ${profile.gradientFrom}, ${profile.gradientTo})`,
        }}
      >
        {/* Initials block */}
        <div className="flex h-full w-full flex-col items-center justify-center gap-2">
          <div className="flex h-16 w-16 items-center justify-center border-[2px] border-black bg-white shadow-[2px_2px_0px_#000000]">
            <span className="select-none font-heading text-xl font-bold leading-none text-black">
              {profile.initials}
            </span>
          </div>
          {profile.isBlurred && (
            <div className="flex items-center gap-1 border-[2px] border-black bg-white px-2 py-1">
              <Lock className="h-3 w-3 text-black" strokeWidth={2.5} />
              <span className="text-[8px] font-bold uppercase tracking-wider text-black">
                Photo locked
              </span>
            </div>
          )}
        </div>

        {/* Top-left: Verification badge */}
        <div className="absolute left-2 top-2">
          <div
            className={cn(
              "flex items-center gap-1 border-[2px] border-black px-1.5 py-0.5",
              verif.bg,
            )}
          >
            <verif.Icon className={cn("h-3 w-3", verif.text)} strokeWidth={2.5} />
            <span
              className={cn("text-[8px] font-bold uppercase tracking-wider", verif.text)}
            >
              {verif.label}
            </span>
          </div>
        </div>

        {/* Top-right: Compatibility score */}
        <div className="absolute right-2 top-2">
          <div className="flex items-center gap-1 border-[2px] border-black bg-black px-2 py-1 text-white">
            <Heart className="h-3 w-3" strokeWidth={2.5} />
            <span className="text-[10px] font-bold leading-none">
              {profile.compatibility}%
            </span>
          </div>
        </div>
      </div>

      {/* ── Card Body ── */}
      <div className="p-4">
        {/* Name + Age + City */}
        <div className="mb-2 flex items-start justify-between gap-2">
          <div>
            <h3 className="m-0 p-0 font-heading text-base font-bold leading-tight text-black">
              {profile.name}, {profile.age}
            </h3>
            <div className="mt-0.5 flex items-center gap-1">
              <MapPin className="h-3 w-3 text-[#9E9E9E]" strokeWidth={2} />
              <span className="text-xs text-[#424242]">{profile.city}</span>
            </div>
          </div>
        </div>

        {/* Intent tag */}
        <div className="mb-2 flex items-center gap-2">
          <span className="border-[2px] border-black bg-white px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-black">
            {profile.intent}
          </span>
          <div className="flex items-center gap-1">
            <GraduationCap className="h-3 w-3 text-[#9E9E9E]" strokeWidth={2} />
            <span className="text-[10px] text-[#9E9E9E]">{profile.education}</span>
          </div>
        </div>

        {/* Bio */}
        <p className="m-0 line-clamp-2 text-xs leading-relaxed text-[#424242]">
          {profile.bio}
        </p>

        {/* Long-press hint */}
        <p className="m-0 mt-2 text-[8px] uppercase tracking-wider text-[#9E9E9E]">
          Tap to view · Hold to appreciate
        </p>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────────────────────

export function ProfileCardSkeleton() {
  return (
    <div
      className="border-[2px] border-[#E0E0E0] bg-[#F8F8F8] shadow-[4px_4px_0px_#E0E0E0]"
      role="status"
      aria-label="Loading profile"
    >
      <div className="h-44 border-b-[2px] border-[#E0E0E0] shimmer-bg" />
      <div className="space-y-2 p-4">
        <div className="h-5 w-40 shimmer-bg" />
        <div className="h-3 w-24 shimmer-bg" />
        <div className="flex gap-2">
          <div className="h-4 w-20 shimmer-bg" />
          <div className="h-4 w-28 shimmer-bg" />
        </div>
        <div className="h-3 w-full shimmer-bg" />
        <div className="h-3 w-3/4 shimmer-bg" />
      </div>
    </div>
  );
}

export default ProfileCard;
