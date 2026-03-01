/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Profile Visitors ("Who Viewed Your Profile")
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Horizontal scroll of recent visitors:
 *   • Blurred initials block for non-matches
 *   • Name (first name only) + timestamp
 *   • Privacy toggle: "Hide your visits"
 *   • "See all" button → premium upsell
 *
 * Comic-book aesthetic: 2px border, hard shadow, monochromatic, 8px grid.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  ChevronRight,
  Lock,
  Crown,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ProfileVisitor {
  id: string;
  name: string;
  initials: string;
  gradientFrom: string;
  gradientTo: string;
  timestamp: string;
  /** True if already matched → show unblurred */
  isMatched: boolean;
}

export interface ProfileVisitorsProps {
  visitors: ProfileVisitor[];
  totalCount: number;
  /** Whether user hides their own visits */
  hideMyVisits?: boolean;
  onToggleHideVisits?: (hide: boolean) => void;
  className?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ProfileVisitors({
  visitors,
  totalCount,
  hideMyVisits = false,
  onToggleHideVisits,
  className,
}: ProfileVisitorsProps) {
  const [localHide, setLocalHide] = useState(hideMyVisits);

  const handleToggle = () => {
    const next = !localHide;
    setLocalHide(next);
    onToggleHideVisits?.(next);
  };

  return (
    <section className={cn("", className)} aria-label="Profile visitors">
      {/* Section header */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <h2 className="text-[10px] font-heading font-bold text-[#9E9E9E] uppercase tracking-widest m-0">
            Who Viewed You
          </h2>
          <span className="px-1.5 py-0.5 bg-black text-white border-[2px] border-black text-[7px] font-bold">
            {totalCount}
          </span>
        </div>
        <Link
          href="/premium"
          className="flex items-center gap-0.5 text-[8px] font-heading font-bold text-black uppercase tracking-wider no-underline hover:underline"
        >
          See all
          <ChevronRight className="w-3 h-3" strokeWidth={2} />
        </Link>
      </div>

      {/* Visitors horizontal scroll */}
      <div className="px-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 pb-1">
          {visitors.map((v) => (
            <div
              key={v.id}
              className="flex flex-col items-center gap-1 flex-shrink-0 w-16"
            >
              {/* Avatar */}
              <div className="relative">
                <div
                  className={cn(
                    "w-14 h-14 border-[2px] border-black shadow-[2px_2px_0px_#000000] flex items-center justify-center",
                    !v.isMatched && "overflow-hidden",
                  )}
                  style={{
                    background: `linear-gradient(135deg, ${v.gradientFrom}, ${v.gradientTo})`,
                  }}
                >
                  <span
                    className={cn(
                      "text-base font-heading font-bold text-black select-none leading-none",
                      !v.isMatched && "blur-[4px]",
                    )}
                  >
                    {v.initials}
                  </span>
                </div>
                {!v.isMatched && (
                  <div className="absolute inset-0 border-[2px] border-black flex items-center justify-center bg-white/40">
                    <Lock className="w-4 h-4 text-black" strokeWidth={2} />
                  </div>
                )}
              </div>
              {/* Name */}
              <span
                className={cn(
                  "text-[8px] font-bold uppercase tracking-wider text-center truncate w-full",
                  v.isMatched ? "text-black" : "text-[#9E9E9E]",
                )}
              >
                {v.isMatched ? v.name : "???"}
              </span>
              {/* Timestamp */}
              <span className="text-[7px] text-[#9E9E9E] tracking-wider">
                {v.timestamp}
              </span>
            </div>
          ))}

          {/* "See all" premium card */}
          <Link
            href="/premium"
            className={cn(
              "flex flex-col items-center justify-center gap-1 flex-shrink-0 w-14 h-14",
              "border-[2px] border-dashed border-black bg-[#F8F8F8] no-underline",
              "hover:bg-[#E0E0E0] transition-colors duration-100",
            )}
          >
            <Crown className="w-4 h-4 text-black" strokeWidth={2} />
            <span className="text-[6px] font-bold text-black uppercase tracking-wider">
              Premium
            </span>
          </Link>
        </div>
      </div>

      {/* Privacy toggle */}
      <div className="mx-4 mt-3 mb-1">
        <button
          onClick={handleToggle}
          className={cn(
            "w-full flex items-center justify-between px-3 py-2",
            "border border-dashed border-[#E0E0E0] bg-[#F8F8F8]",
            "cursor-pointer hover:bg-[#E0E0E0] transition-colors duration-100",
          )}
        >
          <div className="flex items-center gap-2">
            {localHide ? (
              <EyeOff className="w-3.5 h-3.5 text-[#9E9E9E]" strokeWidth={2} />
            ) : (
              <Eye className="w-3.5 h-3.5 text-[#424242]" strokeWidth={2} />
            )}
            <span className="text-[10px] text-[#424242]">
              {localHide ? "Your visits are hidden" : "Others can see your visits"}
            </span>
          </div>
          {/* Toggle pill */}
          <div
            className={cn(
              "w-8 h-4 border border-black relative",
              localHide ? "bg-black" : "bg-[#E0E0E0]",
            )}
          >
            <div
              className={cn(
                "absolute top-0 w-3 h-full border-r border-black bg-white transition-[left] duration-150",
                localHide ? "left-[calc(100%-12px)]" : "left-0",
              )}
            />
          </div>
        </button>
      </div>
    </section>
  );
}

export default ProfileVisitors;
