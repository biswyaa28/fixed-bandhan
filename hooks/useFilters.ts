/**
 * Bandhan AI — Quick Filters Hook
 * Toggle-friendly filter state management.
 * Persists active filters to localStorage across sessions.
 */

"use client";

import { useState, useCallback, useEffect } from "react";

export interface FilterOption {
  id: string;
  label: string;
  labelHi: string;
  icon: string; // Lucide icon name
  category: string;
}

export const FILTER_OPTIONS: FilterOption[] = [
  {
    id: "verified",
    label: "Verified Only",
    labelHi: "केवल सत्यापित",
    icon: "ShieldCheck",
    category: "trust",
  },
  {
    id: "same-city",
    label: "Same City",
    labelHi: "एक ही शहर",
    icon: "MapPin",
    category: "location",
  },
  {
    id: "marriage",
    label: "Marriage Intent",
    labelHi: "विवाह का इरादा",
    icon: "Heart",
    category: "intent",
  },
  {
    id: "vegetarian",
    label: "Vegetarian",
    labelHi: "शाकाहारी",
    icon: "Leaf",
    category: "lifestyle",
  },
  {
    id: "college",
    label: "College Alumni",
    labelHi: "कॉलेज एलुमनी",
    icon: "GraduationCap",
    category: "education",
  },
  {
    id: "age-25-30",
    label: "Age 25-30",
    labelHi: "आयु 25-30",
    icon: "Calendar",
    category: "age",
  },
  {
    id: "age-30-35",
    label: "Age 30-35",
    labelHi: "आयु 30-35",
    icon: "Calendar",
    category: "age",
  },
  {
    id: "non-smoker",
    label: "Non-Smoker",
    labelHi: "धूम्रपान नहीं",
    icon: "Ban",
    category: "lifestyle",
  },
];

const STORAGE_KEY = "bandhan-quick-filters";

export interface UseFiltersReturn {
  activeFilters: Set<string>;
  filterOptions: FilterOption[];
  activeCount: number;
  toggleFilter: (id: string) => void;
  isActive: (id: string) => boolean;
  clearAll: () => void;
}

export function useFilters(): UseFiltersReturn {
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());

  // Hydrate from localStorage on client mount (SSR-safe)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setActiveFilters(new Set(JSON.parse(stored)));
    } catch {
      /* ignore */
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...activeFilters]));
    } catch {
      /* ignore */
    }
  }, [activeFilters]);

  const toggleFilter = useCallback((id: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const isActive = useCallback(
    (id: string) => activeFilters.has(id),
    [activeFilters],
  );

  const clearAll = useCallback(() => {
    setActiveFilters(new Set());
  }, []);

  return {
    activeFilters,
    filterOptions: FILTER_OPTIONS,
    activeCount: activeFilters.size,
    toggleFilter,
    isActive,
    clearAll,
  };
}
