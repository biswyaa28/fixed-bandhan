/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Perfect Match of the Day Card
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Gold-bordered (#FFD700) card with a CSS pulse animation.
 * Sits at the top of the discovery feed.
 *
 * Comic-book aesthetic:
 *   • 3px gold border with pulsing glow
 *   • White background, hard black inner shadow
 *   • Blocky layout, bold fonts, 8px grid
 *   • Star icon, "PERFECT MATCH" heading
 *   • Shows top 3 compatibility factors
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { Star, Heart, MapPin, ShieldCheck, Sparkles, ChevronRight } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { DiscoveryProfile } from "./ProfileCard";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

export interface PerfectMatchCardProps {
  profile: DiscoveryProfile | null;
  /** Top 3 reasons for matching */
  reasons?: string[];
  /** Called when the card is tapped */
  onTap?: (profile: DiscoveryProfile) => void;
  /** Loading state */
  isLoading?: boolean;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function PerfectMatchCard({
  profile,
  reasons = [],
  onTap,
  isLoading,
  className,
}: PerfectMatchCardProps) {
  // ── Loading skeleton ──
  if (isLoading || !profile) {
    return (
      <div
        className={cn(
          "border-[3px] border-[#E0E0E0] bg-white p-5",
          "shadow-[4px_4px_0px_#E0E0E0]",
          className,
        )}
        role="status"
        aria-label="Loading perfect match"
      >
        <div className="mb-3 flex items-center gap-2">
          <div className="h-5 w-5 shimmer-bg" />
          <div className="h-4 w-36 shimmer-bg" />
        </div>
        <div className="flex gap-4">
          <div className="h-20 w-20 flex-shrink-0 shimmer-bg" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-32 shimmer-bg" />
            <div className="h-3 w-20 shimmer-bg" />
            <div className="h-3 w-full shimmer-bg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <article
      role="listitem"
      className={cn(
        "relative cursor-pointer select-none bg-white",
        // 3px gold border with pulse animation
        "border-[3px] border-[#FFD700]",
        "shadow-[4px_4px_0px_#000000]",
        // Hover: pixel-shift
        "transition-[transform,box-shadow] duration-150",
        "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000]",
        "active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        // Gold pulse animation class (defined in globals.css below)
        "perfect-match-pulse",
        className,
      )}
      onClick={() => onTap?.(profile)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onTap?.(profile);
        }
      }}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      aria-label={`Perfect match: ${profile.name}, ${profile.age}. ${profile.compatibility}% compatible. Tap to view.`}
    >
      {/* ── Header strip ── */}
      <div className="flex items-center gap-2 border-b-[2px] border-[#FFD700] bg-[#FFFEF5] px-4 py-2">
        <Star className="h-4 w-4 text-[#FFD700]" strokeWidth={2.5} fill="#FFD700" />
        <span className="font-heading text-[10px] font-bold uppercase tracking-widest text-black">
          Perfect Match of the Day
        </span>
        <Sparkles className="ml-auto h-3 w-3 text-[#FFD700]" strokeWidth={2} />
      </div>

      {/* ── Body ── */}
      <div className="flex gap-4 p-4">
        {/* Mini avatar */}
        <div
          className="flex h-20 w-20 flex-shrink-0 items-center justify-center border-[2px] border-black shadow-[2px_2px_0px_#000000]"
          style={{
            background: `linear-gradient(135deg, ${profile.gradientFrom}, ${profile.gradientTo})`,
          }}
        >
          <span className="select-none font-heading text-lg font-bold text-black">
            {profile.initials}
          </span>
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <h3 className="m-0 truncate font-heading text-sm font-bold leading-tight text-black">
              {profile.name}, {profile.age}
            </h3>
          </div>

          <div className="mb-2 flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              <MapPin className="h-3 w-3 text-[#9E9E9E]" strokeWidth={2} />
              <span className="text-[10px] text-[#424242]">{profile.city}</span>
            </div>
            <span className="text-[10px] text-[#9E9E9E]">·</span>
            <div className="flex items-center gap-0.5">
              <ShieldCheck className="h-3 w-3 text-[#9E9E9E]" strokeWidth={2} />
              <span className="text-[10px] capitalize text-[#424242]">
                {profile.verificationLevel}
              </span>
            </div>
          </div>

          {/* Compatibility score */}
          <div className="mb-2 flex items-center gap-1.5">
            <div className="flex items-center gap-1 border-[2px] border-black bg-black px-2 py-0.5 text-white">
              <Heart className="h-3 w-3" strokeWidth={2.5} />
              <span className="text-[10px] font-bold">
                {profile.compatibility}% Match
              </span>
            </div>
          </div>

          {/* Reasons (top 3 compatibility factors) */}
          {reasons.length > 0 && (
            <div className="space-y-0.5">
              {reasons.slice(0, 3).map((reason, i) => (
                <div key={i} className="flex items-center gap-1">
                  <span className="h-1 w-1 flex-shrink-0 bg-[#FFD700]" />
                  <span className="truncate text-[10px] text-[#424242]">{reason}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chevron */}
        <div className="flex items-center self-center">
          <ChevronRight className="h-5 w-5 text-[#9E9E9E]" strokeWidth={2} />
        </div>
      </div>
    </article>
  );
}

export default PerfectMatchCard;
