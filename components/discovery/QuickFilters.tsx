/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Quick Filters (Horizontal Scroll Chips)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Scrollable row of filter chips at the top of the discovery feed.
 *
 * Comic-book aesthetic:
 *   • Active: black bg + white text + 2px border
 *   • Inactive: white bg + black text + 2px border + hard shadow
 *   • Icons: Lucide React, 2px stroke
 *   • No rounded corners (4px max)
 *   • Horizontal scroll with hidden scrollbar
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useCallback } from "react";
import {
  ShieldCheck,
  MapPin,
  Calendar,
  Leaf,
  GraduationCap,
  Heart,
  X,
  type LucideIcon,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface FilterOption {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface QuickFiltersProps {
  /** Called whenever the active filter set changes */
  onFiltersChange?: (activeIds: string[]) => void;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Default Filters
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_FILTERS: FilterOption[] = [
  { id: "verified", label: "Verified Only", icon: ShieldCheck },
  { id: "same-city", label: "Same City", icon: MapPin },
  { id: "age-25-30", label: "Age 25–30", icon: Calendar },
  { id: "vegetarian", label: "Vegetarian", icon: Leaf },
  { id: "marriage", label: "Marriage Intent", icon: Heart },
  { id: "alumni", label: "College Alumni", icon: GraduationCap },
];

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function QuickFilters({ onFiltersChange, className }: QuickFiltersProps) {
  const [activeIds, setActiveIds] = useState<Set<string>>(new Set());

  const toggleFilter = useCallback(
    (id: string) => {
      setActiveIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        onFiltersChange?.(Array.from(next));
        return next;
      });
      // Haptic
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(8);
      }
    },
    [onFiltersChange],
  );

  const clearAll = useCallback(() => {
    setActiveIds(new Set());
    onFiltersChange?.([]);
  }, [onFiltersChange]);

  const hasActive = activeIds.size > 0;

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide px-4 py-2">
        {/* Active count + clear button */}
        {hasActive && (
          <button
            onClick={clearAll}
            className={cn(
              "flex items-center gap-1 px-2 py-1.5 flex-shrink-0",
              "bg-black text-white border-[2px] border-black",
              "text-[10px] font-heading font-bold uppercase tracking-wider",
              "cursor-pointer transition-colors duration-100",
              "hover:bg-[#424242]",
            )}
            aria-label={`${activeIds.size} filters active. Clear all.`}
          >
            <X className="w-3 h-3" strokeWidth={2.5} />
            <span>{activeIds.size}</span>
          </button>
        )}

        {/* Filter chips */}
        {DEFAULT_FILTERS.map((filter) => {
          const active = activeIds.has(filter.id);
          const Icon = filter.icon;
          return (
            <button
              key={filter.id}
              onClick={() => toggleFilter(filter.id)}
              aria-pressed={active}
              aria-label={`${filter.label} filter ${active ? "active" : "inactive"}`}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1.5 flex-shrink-0",
                "border-[2px] border-black",
                "text-[10px] font-heading font-bold uppercase tracking-wider",
                "cursor-pointer transition-all duration-100",
                "whitespace-nowrap",
                active
                  ? "bg-black text-white shadow-none translate-x-[2px] translate-y-[2px]"
                  : "bg-white text-black shadow-[2px_2px_0px_#000000] hover:bg-[#F8F8F8]",
              )}
            >
              <Icon className="w-3.5 h-3.5" strokeWidth={2} />
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default QuickFilters;
