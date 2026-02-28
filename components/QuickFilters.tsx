/**
 * Bandhan AI — Quick Filters
 * Horizontal scrollable filter chips for discovery feed.
 * Comic book style: thick borders, hard shadows, monochrome.
 */

"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  MapPin,
  Heart,
  Leaf,
  GraduationCap,
  Calendar,
  Ban,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { useFilters } from "@/hooks/useFilters";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

const ICON_MAP: Record<
  string,
  React.ComponentType<{ className?: string; strokeWidth?: number }>
> = {
  ShieldCheck,
  MapPin,
  Heart,
  Leaf,
  GraduationCap,
  Calendar,
  Ban,
};

export interface QuickFiltersProps {
  className?: string;
}

export function QuickFilters({ className }: QuickFiltersProps) {
  const { filterOptions, activeCount, toggleFilter, isActive, clearAll } =
    useFilters();
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className={cn("relative", className)}>
      {/* ── Scroll Container ── */}
      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1 px-1"
        role="group"
        aria-label="Quick filters"
      >
        {/* Filter icon + count badge */}
        <div className="flex-shrink-0 flex items-center gap-2 pr-2 border-r-2 border-black mr-1">
          <div className="w-8 h-8 flex items-center justify-center border-2 border-black bg-white">
            <SlidersHorizontal
              className="w-4 h-4 text-black"
              strokeWidth={2.5}
            />
          </div>
          {activeCount > 0 && (
            <span className="text-[10px] font-pixel font-bold text-black leading-none">
              {activeCount}
            </span>
          )}
        </div>

        {/* Filter chips */}
        {filterOptions.map((filter) => {
          const active = isActive(filter.id);
          const Icon = ICON_MAP[filter.icon];

          return (
            <motion.button
              key={filter.id}
              onClick={() => toggleFilter(filter.id)}
              whileTap={{ scale: 0.96 }}
              className={cn(
                "flex-shrink-0 inline-flex items-center gap-2",
                "px-3 py-2 rounded-[4px]",
                "font-heading font-bold text-xs uppercase tracking-wide",
                "border-2 border-black cursor-pointer",
                "transition-[transform,box-shadow,background,color] duration-150",
                active
                  ? "bg-black text-white shadow-none"
                  : "bg-white text-black shadow-[2px_2px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000]",
              )}
              aria-pressed={active}
            >
              {Icon && <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />}
              <span className="whitespace-nowrap">{filter.label}</span>
            </motion.button>
          );
        })}

        {/* Clear all button */}
        {activeCount > 0 && (
          <motion.button
            onClick={clearAll}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn(
              "flex-shrink-0 inline-flex items-center gap-1",
              "px-3 py-2 rounded-[4px]",
              "font-heading font-bold text-xs uppercase",
              "border-2 border-dashed border-black bg-transparent text-[#424242]",
              "cursor-pointer hover:bg-[#F8F8F8]",
            )}
            aria-label="Clear all filters"
          >
            <X className="w-3.5 h-3.5" strokeWidth={2.5} />
            Clear
          </motion.button>
        )}
      </div>
    </div>
  );
}

export default QuickFilters;
