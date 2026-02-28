/**
 * Bandhan AI — Profile Completion Progress Bar
 * Comic book style progress tracker with halftone fill.
 * Motivates users to complete profiles for better matches.
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, CheckCircle2, Circle, Sparkles } from "lucide-react";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

export interface ProfileProgressProps {
  onSectionClick?: (sectionKey: string) => void;
  className?: string;
}

export function ProfileProgress({ onSectionClick, className }: ProfileProgressProps) {
  const { percentage, sections, missingFields, nextAction } = useProfileCompletion();
  const [isExpanded, setIsExpanded] = useState(false);
  const isComplete = percentage >= 100;

  return (
    <div
      className={cn(
        "border-2 border-black bg-[#F8F8F8] shadow-[4px_4px_0px_#000000]",
        className,
      )}
    >
      {/* ── Header Row ── */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center justify-between p-4",
          "bg-transparent border-none cursor-pointer text-left",
        )}
        aria-expanded={isExpanded}
        aria-label="Profile completion details"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Percentage badge */}
          <div
            className={cn(
              "flex-shrink-0 w-12 h-12 flex items-center justify-center",
              "border-2 border-black font-heading font-bold text-sm",
              isComplete
                ? "bg-[#424242] text-white"
                : "bg-white text-black",
            )}
          >
            {isComplete ? (
              <Sparkles className="w-5 h-5" strokeWidth={2.5} />
            ) : (
              `${percentage}%`
            )}
          </div>

          {/* Text */}
          <div className="min-w-0">
            <p className="text-sm font-heading font-bold text-black uppercase tracking-wide m-0 leading-tight">
              {isComplete ? "Profile Complete!" : "Complete Your Profile"}
            </p>
            <p className="text-xs text-[#9E9E9E] m-0 mt-1 truncate leading-tight">
              {isComplete
                ? "You're getting the best matches possible"
                : nextAction || `${missingFields.length} sections remaining`}
            </p>
          </div>
        </div>

        {/* Expand arrow */}
        {!isComplete && (
          <div className="flex-shrink-0 ml-2">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-[#424242]" strokeWidth={2} />
            ) : (
              <ChevronDown className="w-5 h-5 text-[#424242]" strokeWidth={2} />
            )}
          </div>
        )}
      </button>

      {/* ── Progress Bar ── */}
      <div className="px-4 pb-4">
        <div className="relative h-4 bg-[#E0E0E0] border-2 border-black overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-black"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)",
              backgroundSize: "4px 4px",
            }}
          />
          {/* Blocky segments overlay */}
          <div className="absolute inset-0 flex">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 border-r border-[rgba(255,255,255,0.2)] last:border-r-0"
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Expanded Section List ── */}
      <AnimatePresence>
        {isExpanded && !isComplete && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-dashed border-black pt-4">
              <div className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.key}
                    onClick={() => onSectionClick?.(section.key)}
                    disabled={section.isComplete}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2",
                      "border-2 bg-transparent cursor-pointer text-left",
                      "transition-[transform,box-shadow] duration-150",
                      section.isComplete
                        ? "border-[#E0E0E0] opacity-60 cursor-default"
                        : "border-black shadow-[2px_2px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000]",
                    )}
                  >
                    {section.isComplete ? (
                      <CheckCircle2 className="w-4 h-4 text-[#424242] flex-shrink-0" strokeWidth={2.5} />
                    ) : (
                      <Circle className="w-4 h-4 text-[#9E9E9E] flex-shrink-0" strokeWidth={2} />
                    )}
                    <span
                      className={cn(
                        "text-xs font-heading font-bold uppercase tracking-wide",
                        section.isComplete ? "text-[#9E9E9E] line-through" : "text-black",
                      )}
                    >
                      {section.label}
                    </span>
                    <span className="ml-auto text-[10px] text-[#9E9E9E] font-bold">
                      +{section.weight}%
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ProfileProgress;
