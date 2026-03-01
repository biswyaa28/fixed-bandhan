/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Matches / Likes Tab Switcher
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Two-tab header: "Matches" | "Likes Received"
 * Active tab: black underline animation (2px, slides left/right).
 *
 * Comic-book aesthetic: 2px borders, uppercase heading font, monochromatic.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { motion } from "framer-motion";
import { Users, Heart } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type MatchesTabId = "matches" | "likes";

export interface MatchesTabsProps {
  activeTab: MatchesTabId;
  onTabChange: (tab: MatchesTabId) => void;
  matchCount?: number;
  likesCount?: number;
  className?: string;
}

// ─── Tabs config ─────────────────────────────────────────────────────────────

const TABS: { id: MatchesTabId; label: string; Icon: typeof Users }[] = [
  { id: "matches", label: "Matches", Icon: Users },
  { id: "likes", label: "Likes Received", Icon: Heart },
];

// ─── Component ───────────────────────────────────────────────────────────────

export function MatchesTabs({
  activeTab,
  onTabChange,
  matchCount,
  likesCount,
  className,
}: MatchesTabsProps) {
  const haptic = () => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(8);
    }
  };

  return (
    <div
      className={cn(
        "bg-white border-b-[2px] border-black",
        className,
      )}
      role="tablist"
      aria-label="Matches navigation"
    >
      <div className="max-w-lg mx-auto flex">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = tab.id === "matches" ? matchCount : likesCount;
          const Icon = tab.Icon;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => {
                haptic();
                onTabChange(tab.id);
              }}
              className={cn(
                "relative flex-1 flex items-center justify-center gap-1.5",
                "py-3 px-2 cursor-pointer",
                "transition-colors duration-100",
                isActive ? "text-black" : "text-[#9E9E9E] hover:text-[#424242]",
              )}
            >
              <Icon
                className={cn("w-3.5 h-3.5", isActive ? "text-black" : "text-[#9E9E9E]")}
                strokeWidth={2}
              />
              <span
                className={cn(
                  "text-[10px] font-heading font-bold uppercase tracking-widest",
                )}
              >
                {tab.label}
              </span>
              {typeof count === "number" && count > 0 && (
                <span
                  className={cn(
                    "min-w-[16px] h-4 px-1 flex items-center justify-center",
                    "text-[7px] font-bold leading-none",
                    "border-[2px]",
                    isActive
                      ? "bg-black text-white border-black"
                      : "bg-[#E0E0E0] text-[#424242] border-[#E0E0E0]",
                  )}
                >
                  {count > 99 ? "99+" : count}
                </span>
              )}

              {/* Active underline indicator */}
              {isActive && (
                <motion.div
                  layoutId="matches-tab-indicator"
                  className="absolute bottom-0 left-2 right-2 h-[2px] bg-black"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default MatchesTabs;
