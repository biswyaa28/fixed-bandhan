/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Profile Completion Progress Bar
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Horizontal progress bar with:
 *   • Black fill on light gray (#E0E0E0) background
 *   • Halftone-style fill pattern
 *   • Percentage in bold comic font
 *   • Tap to expand → shows missing items list
 *   • 100% → comic "POW!" flash animation
 *
 * Comic-book aesthetic: 2px black border, hard shadow, 8px grid.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, AlertCircle } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ProfileItem {
  id: string;
  label: string;
  completed: boolean;
}

export interface ProfileProgressProps {
  items: ProfileItem[];
  className?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ProfileProgress({ items, className }: ProfileProgressProps) {
  const [expanded, setExpanded] = useState(false);
  const [showPow, setShowPow] = useState(false);

  const completed = items.filter((i) => i.completed).length;
  const total = items.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isComplete = pct >= 100;
  const missing = items.filter((i) => !i.completed);

  const handleTap = () => {
    if (isComplete && !showPow) {
      setShowPow(true);
      setTimeout(() => setShowPow(false), 1200);
    } else {
      setExpanded((p) => !p);
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* ── Main bar card ── */}
      <button
        onClick={handleTap}
        aria-expanded={expanded}
        aria-label={`Profile ${pct}% complete. ${missing.length} items remaining. Tap for details.`}
        className={cn(
          "w-full text-left cursor-pointer",
          "bg-white border-[2px] border-black",
          "shadow-[4px_4px_0px_#000000]",
          "px-4 py-3",
          "transition-all duration-100",
          "hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_#000000]",
          "active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        )}
      >
        {/* Label row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-heading font-bold text-[#9E9E9E] uppercase tracking-widest">
              Profile Completion
            </span>
            {!isComplete && (
              <AlertCircle className="w-3 h-3 text-[#9E9E9E]" strokeWidth={2} />
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-heading font-bold text-black tabular-nums leading-none">
              {pct}%
            </span>
            <ChevronDown
              className={cn(
                "w-3.5 h-3.5 text-[#9E9E9E] transition-transform duration-200",
                expanded && "rotate-180",
              )}
              strokeWidth={2}
            />
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative h-3 bg-[#E0E0E0] border-[2px] border-black overflow-hidden">
          {/* Halftone fill */}
          <div
            className="absolute inset-y-0 left-0 bg-black transition-[width] duration-500 ease-out"
            style={{ width: `${pct}%` }}
          >
            {/* Halftone dot pattern overlay */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #fff 1px, transparent 1px)",
                backgroundSize: "4px 4px",
              }}
            />
          </div>
        </div>

        {/* Hint text */}
        <p className="text-[8px] text-[#9E9E9E] mt-1 m-0 uppercase tracking-wider">
          {isComplete
            ? "Profile complete! Tap for confetti 🎉"
            : `Add ${missing.length} more item${missing.length !== 1 ? "s" : ""} for better matches`}
        </p>
      </button>

      {/* ── Expanded: missing items list ── */}
      <AnimatePresence>
        {expanded && !isComplete && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-[#F8F8F8] border-[2px] border-t-0 border-black px-4 py-3 space-y-1.5">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-4 h-4 border-[2px] border-black flex items-center justify-center flex-shrink-0",
                      item.completed ? "bg-black" : "bg-white",
                    )}
                  >
                    {item.completed && (
                      <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs",
                      item.completed
                        ? "text-[#9E9E9E] line-through"
                        : "text-[#212121] font-bold",
                    )}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── "POW!" animation at 100% ── */}
      <AnimatePresence>
        {showPow && (
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
          >
            <div
              className={cn(
                "px-6 py-3 bg-white border-[3px] border-black",
                "shadow-[6px_6px_0px_#000000]",
                "animate-comic-flash",
              )}
            >
              <span className="text-3xl font-heading font-bold text-black uppercase tracking-wider select-none">
                POW! 💥
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ProfileProgress;
