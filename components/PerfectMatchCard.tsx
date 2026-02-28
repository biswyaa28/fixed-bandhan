/**
 * Bandhan AI — Perfect Match Card (Hinge "Most Compatible")
 * Gold-bordered daily curated match with "Why you match" insights.
 */
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, MapPin, Shield, ChevronDown, ChevronUp,
  Heart, Sparkles, Crown,
} from "lucide-react";
import { type PerfectMatch } from "@/lib/perfect-match-algorithm";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) { return twMerge(clsx(c)); }

export interface PerfectMatchCardProps {
  match: PerfectMatch;
  onLike?: (id: string) => void;
  onViewProfile?: (id: string) => void;
  language?: "en" | "hi";
  className?: string;
}

const BADGE_BG: Record<string, string> = {
  bronze: "bg-[#E0E0E0] text-black",
  silver: "bg-[#9E9E9E] text-black",
  gold: "bg-[#424242] text-white",
};

export function PerfectMatchCard({
  match,
  onLike,
  onViewProfile,
  language = "en",
  className,
}: PerfectMatchCardProps) {
  const [showInsights, setShowInsights] = useState(false);
  const { candidate, reasons } = match;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "relative bg-white overflow-hidden",
        // Gold-accent border for perfect match
        "border-[3px] border-black",
        "shadow-[6px_6px_0px_#000000]",
        className,
      )}
    >
      {/* Top badge bar */}
      <div className="px-4 py-2 bg-[#424242] text-white flex items-center gap-2">
        <Star className="w-3.5 h-3.5" strokeWidth={2.5} fill="currentColor" />
        <span className="text-[10px] font-heading font-bold uppercase tracking-wider">
          {language === "en" ? "Perfect Match of the Day" : "आज का परफेक्ट मैच"}
        </span>
        <Sparkles className="w-3 h-3 ml-auto" strokeWidth={2} />
      </div>

      {/* Profile image area */}
      <div className="relative h-[200px] bg-[#E0E0E0] overflow-hidden">
        {candidate.imageUrl ? (
          <img src={candidate.imageUrl} alt={candidate.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#F8F8F8]">
            <span className="text-5xl font-heading font-bold text-[#E0E0E0]">
              {candidate.name[0]}
            </span>
          </div>
        )}

        {/* Compatibility score */}
        <div className="absolute top-3 right-3 px-2 py-1 bg-white text-black border-2 border-black shadow-[2px_2px_0px_#000000] text-xs font-pixel font-bold leading-none">
          {candidate.compatibility}%
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-heading font-bold text-black uppercase m-0 leading-tight">
            {candidate.name}, {candidate.age}
          </h3>
          <div
            className={cn(
              "w-4 h-4 flex items-center justify-center border-[1.5px] border-black text-[6px] font-pixel font-bold leading-none",
              BADGE_BG[candidate.verificationLevel],
            )}
          >
            {candidate.verificationLevel[0].toUpperCase()}
          </div>
        </div>
        <p className="text-[11px] text-[#9E9E9E] m-0 flex items-center gap-1">
          <MapPin className="w-3 h-3" strokeWidth={2} /> {candidate.city}
        </p>

        {candidate.bio && (
          <p className="text-xs text-[#424242] mt-2 m-0 leading-normal line-clamp-2">
            {candidate.bio}
          </p>
        )}

        {/* Why you match — accordion */}
        <button
          onClick={() => setShowInsights(!showInsights)}
          className="w-full mt-3 flex items-center justify-between px-3 py-2 border-2 border-dashed border-black bg-[#F8F8F8] text-left cursor-pointer"
        >
          <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-[#424242]">
            {language === "en" ? "Why You Match" : "आप क्यों मैच करते हैं"}
          </span>
          {showInsights ? (
            <ChevronUp className="w-3.5 h-3.5 text-[#424242]" strokeWidth={2} />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-[#424242]" strokeWidth={2} />
          )}
        </button>

        <AnimatePresence>
          {showInsights && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="pt-2 space-y-2">
                {reasons.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 px-1">
                    <div className="w-1.5 h-1.5 bg-black mt-1.5 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] font-heading font-bold text-black uppercase">
                        {language === "en" ? r.factor : r.factorHi}
                      </span>
                      <p className="text-[10px] text-[#9E9E9E] m-0 leading-normal">
                        {language === "en" ? r.description : r.descriptionHi}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={() => onViewProfile?.(candidate.id)}
            className="flex-1 py-2.5 border-2 border-black bg-transparent text-xs font-heading font-bold uppercase text-[#424242] cursor-pointer hover:bg-[#F8F8F8]"
          >
            {language === "en" ? "View Profile" : "प्रोफ़ाइल देखें"}
          </button>
          <button
            onClick={() => onLike?.(candidate.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5",
              "border-[3px] border-black bg-black text-white",
              "text-xs font-heading font-bold uppercase cursor-pointer",
              "shadow-[4px_4px_0px_#000000]",
              "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000]",
              "transition-[transform,box-shadow] duration-150",
            )}
          >
            <Heart className="w-3.5 h-3.5" strokeWidth={2.5} />
            {language === "en" ? "Like" : "पसंद"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default PerfectMatchCard;
