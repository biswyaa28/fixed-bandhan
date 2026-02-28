/**
 * Bandhan AI — Daily Picks (Curated Match Carousel)
 * Horizontal swipeable carousel of top daily recommendations.
 * Refreshes at midnight IST. Max 5 cards visible.
 */

"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Calendar, ChevronLeft, ChevronRight, Heart, X as XIcon,
  MapPin, Shield, Sparkles, Crown,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

// ─── Types ───────────────────────────────────────────────────────────────
export interface DailyPick {
  id: string;
  name: string;
  age: number;
  city: string;
  imageUrl?: string;
  compatibility: number;
  verificationLevel: "bronze" | "silver" | "gold";
  reason?: string;
  reasonHi?: string;
}

export interface DailyPicksProps {
  picks?: DailyPick[];
  onLike?: (id: string) => void;
  onSkip?: (id: string) => void;
  onViewProfile?: (id: string) => void;
  onViewAll?: () => void;
  isPremium?: boolean;
  language?: "en" | "hi";
  className?: string;
}

// Mock daily picks
const MOCK_PICKS: DailyPick[] = [
  { id: "dp1", name: "Ananya S.", age: 26, city: "Mumbai", compatibility: 92, verificationLevel: "gold", reason: "Shared values & location", reasonHi: "साझा मूल्य और स्थान" },
  { id: "dp2", name: "Priya M.", age: 28, city: "Delhi", compatibility: 87, verificationLevel: "silver", reason: "Similar life goals", reasonHi: "समान जीवन लक्ष्य" },
  { id: "dp3", name: "Meera K.", age: 25, city: "Bangalore", compatibility: 84, verificationLevel: "gold", reason: "Compatible lifestyle", reasonHi: "संगत जीवनशैली" },
  { id: "dp4", name: "Sneha R.", age: 27, city: "Pune", compatibility: 81, verificationLevel: "bronze", reason: "Education match", reasonHi: "शिक्षा मिलान" },
  { id: "dp5", name: "Ritu P.", age: 29, city: "Jaipur", compatibility: 78, verificationLevel: "silver", reason: "Family values align", reasonHi: "पारिवारिक मूल्य" },
];

const BADGE_BG: Record<string, string> = {
  bronze: "bg-[#E0E0E0] text-black",
  silver: "bg-[#9E9E9E] text-black",
  gold: "bg-[#424242] text-white",
};

export function DailyPicks({
  picks: picksProp,
  onLike,
  onSkip,
  onViewProfile,
  onViewAll,
  isPremium = false,
  language = "en",
  className,
}: DailyPicksProps) {
  const picks = picksProp || MOCK_PICKS;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visiblePicks = picks.filter((p) => !dismissed.has(p.id));

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const amount = direction === "left" ? -200 : 200;
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  const handleSkip = (id: string) => {
    setDismissed((prev) => new Set(prev).add(id));
    onSkip?.(id);
  };

  if (visiblePicks.length === 0) return null;

  return (
    <div className={cn("", className)}>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black text-white border-2 border-black flex items-center justify-center">
            <Calendar className="w-4 h-4" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm font-heading font-bold text-black uppercase tracking-wide m-0 leading-tight">
              {language === "en" ? "Today's Top Matches" : "आज के शीर्ष मैच"}
            </p>
            <p className="text-[10px] text-[#9E9E9E] m-0 mt-0.5 leading-tight">
              {language === "en" ? "Curated just for you" : "सिर्फ़ आपके लिए"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll("left")}
            className="w-8 h-8 border-2 border-black bg-white flex items-center justify-center cursor-pointer hover:bg-[#F8F8F8]"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-8 h-8 border-2 border-black bg-white flex items-center justify-center cursor-pointer hover:bg-[#F8F8F8]"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* ── Carousel ── */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
      >
        {visiblePicks.map((pick) => (
          <motion.div
            key={pick.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex-shrink-0 w-[200px] border-2 border-black bg-white shadow-[4px_4px_0px_#000000] overflow-hidden"
          >
            {/* Image / placeholder */}
            <div className="relative h-[160px] bg-[#E0E0E0] overflow-hidden">
              {pick.imageUrl ? (
                <img
                  src={pick.imageUrl}
                  alt={pick.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#F8F8F8]">
                  <span className="text-3xl font-heading font-bold text-[#E0E0E0]">
                    {pick.name[0]}
                  </span>
                </div>
              )}

              {/* Recommended badge */}
              <div className="absolute top-2 left-2 px-2 py-1 bg-black text-white border-2 border-black text-[8px] font-pixel font-bold uppercase flex items-center gap-1 leading-none">
                <Sparkles className="w-2.5 h-2.5" strokeWidth={2.5} />
                Pick
              </div>

              {/* Compatibility score */}
              <div className="absolute top-2 right-2 px-1.5 py-1 bg-white text-black border-2 border-black text-[9px] font-pixel font-bold leading-none">
                {pick.compatibility}%
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <div className="flex items-center gap-1 mb-1">
                <span className="text-xs font-heading font-bold text-black uppercase leading-tight">
                  {pick.name}, {pick.age}
                </span>
                <div
                  className={cn(
                    "w-4 h-4 flex items-center justify-center border-[1.5px] border-black text-[6px] font-pixel font-bold leading-none",
                    BADGE_BG[pick.verificationLevel],
                  )}
                >
                  {pick.verificationLevel[0].toUpperCase()}
                </div>
              </div>
              <p className="text-[10px] text-[#9E9E9E] m-0 flex items-center gap-1 leading-tight">
                <MapPin className="w-2.5 h-2.5" strokeWidth={2} />
                {pick.city}
              </p>

              {/* Reason (premium only) */}
              {isPremium && pick.reason && (
                <p className="text-[9px] text-[#424242] mt-1 m-0 italic leading-tight">
                  {language === "en" ? pick.reason : pick.reasonHi}
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => handleSkip(pick.id)}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-2 border-2 border-black bg-white text-black text-[10px] font-heading font-bold uppercase cursor-pointer hover:bg-[#F8F8F8]"
                >
                  <XIcon className="w-3 h-3" strokeWidth={2.5} />
                  Skip
                </button>
                <button
                  onClick={() => onLike?.(pick.id)}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-2 border-2 border-black bg-black text-white text-[10px] font-heading font-bold uppercase cursor-pointer shadow-[2px_2px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000] transition-[transform,box-shadow] duration-150"
                >
                  <Heart className="w-3 h-3" strokeWidth={2.5} />
                  Like
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* View All */}
      {onViewAll && (
        <button
          onClick={onViewAll}
          className="w-full mt-3 py-2 border-2 border-dashed border-black bg-transparent text-xs font-heading font-bold uppercase text-[#424242] cursor-pointer hover:bg-[#F8F8F8] flex items-center justify-center gap-2"
        >
          {language === "en" ? "View All Recommendations" : "सभी सिफ़ारिशें देखें"}
          <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
      )}
    </div>
  );
}

export default DailyPicks;
