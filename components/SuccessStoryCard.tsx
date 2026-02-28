/**
 * Bandhan AI — Success Story Card
 * Social proof testimonial with comic book speech bubble style.
 * Shows 1 success story per ~10 profile views in discovery feed.
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Quote, Heart, ChevronRight, X, Shield } from "lucide-react";
import { type SuccessStory, getRotatedStory } from "@/data/success-stories";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

export interface SuccessStoryCardProps {
  /** View count to determine which story to show */
  viewCount?: number;
  /** Specific story to display (overrides viewCount rotation) */
  story?: SuccessStory;
  /** Called when user taps "Read Story" */
  onReadMore?: (story: SuccessStory) => void;
  /** Called when user dismisses the card */
  onDismiss?: () => void;
  /** Language */
  language?: "en" | "hi";
  className?: string;
}

export function SuccessStoryCard({
  viewCount = 0,
  story: storyProp,
  onReadMore,
  onDismiss,
  language = "en",
  className,
}: SuccessStoryCardProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const story = storyProp || getRotatedStory(viewCount);

  if (isDismissed) return null;

  const quote = language === "en" ? story.quoteEn : story.quoteHi;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={cn(
        "relative bg-white border-[3px] border-black shadow-[4px_4px_0px_#000000]",
        "overflow-hidden",
        className,
      )}
    >
      {/* Dismiss button */}
      {onDismiss && (
        <button
          onClick={() => {
            setIsDismissed(true);
            onDismiss();
          }}
          className="absolute top-2 right-2 z-10 w-6 h-6 flex items-center justify-center bg-white border-2 border-black text-black cursor-pointer hover:bg-[#E0E0E0]"
          aria-label="Dismiss story"
        >
          <X className="w-3 h-3" strokeWidth={3} />
        </button>
      )}

      {/* Top label bar */}
      <div className="px-4 py-2 bg-black text-white flex items-center gap-2">
        <Heart className="w-3.5 h-3.5" strokeWidth={2.5} fill="currentColor" />
        <span className="text-[10px] font-heading font-bold uppercase tracking-wider">
          {language === "en" ? "Success Story" : "सफलता की कहानी"}
        </span>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Speech bubble quote */}
        <div className="relative mb-4 p-4 bg-[#F8F8F8] border-2 border-black">
          <Quote className="w-5 h-5 text-[#9E9E9E] mb-2" strokeWidth={2} />
          <p className="text-sm text-[#212121] leading-relaxed m-0 italic">
            "{quote}"
          </p>
          {/* Tail triangle */}
          <div className="absolute -bottom-[10px] left-6 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-black" />
          <div className="absolute -bottom-[7px] left-[27px] w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-[#F8F8F8]" />
        </div>

        {/* Couple info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Silhouette avatars */}
            <div className="flex -space-x-2">
              <div className="w-8 h-8 bg-[#E0E0E0] border-2 border-black flex items-center justify-center">
                <span className="text-[8px] font-pixel font-bold">{story.nameA[0]}</span>
              </div>
              <div className="w-8 h-8 bg-[#424242] border-2 border-black flex items-center justify-center text-white">
                <span className="text-[8px] font-pixel font-bold">{story.nameB[0]}</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-heading font-bold text-black uppercase m-0 leading-tight">
                {story.nameA} & {story.nameB}
              </p>
              <p className="text-[10px] text-[#9E9E9E] m-0 mt-0.5 leading-tight">
                {story.cityA} → {story.cityB}
              </p>
            </div>
          </div>

          {/* Verification + matched via */}
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <Shield className="w-3 h-3 text-[#424242]" strokeWidth={2.5} />
              <span className="text-[9px] font-bold text-[#424242] uppercase">
                {story.verificationLevel}
              </span>
            </div>
            <p className="text-[9px] text-[#9E9E9E] m-0 mt-0.5">{story.matchedVia}</p>
          </div>
        </div>

        {/* Read more */}
        {onReadMore && (
          <button
            onClick={() => onReadMore(story)}
            className={cn(
              "w-full mt-4 flex items-center justify-center gap-2",
              "px-4 py-2 bg-transparent border-2 border-dashed border-black",
              "text-xs font-heading font-bold uppercase tracking-wide text-[#424242]",
              "cursor-pointer hover:bg-[#F8F8F8]",
            )}
          >
            {language === "en" ? "Read Full Story" : "पूरी कहानी पढ़ें"}
            <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.5} />
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default SuccessStoryCard;
