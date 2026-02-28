/**
 * Bandhan AI — Icebreaker Suggestions
 * Horizontal scrollable conversation starter chips.
 * Shows for first 5 messages in a new conversation.
 * Personalised based on shared profile fields.
 */

"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, RefreshCw } from "lucide-react";
import {
  getPersonalizedQuestions,
  type IcebreakerQuestion,
} from "@/data/icebreaker-questions";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

export interface IcebreakerSuggestionsProps {
  /** Shared profile fields between matched users (for personalization) */
  sharedFields?: string[];
  /** Called when user taps a suggestion */
  onSelect: (text: string) => void;
  /** Number of messages already sent in this conversation */
  messageCount?: number;
  /** Whether to use Hindi text */
  language?: "en" | "hi";
  className?: string;
}

export function IcebreakerSuggestions({
  sharedFields = [],
  onSelect,
  messageCount = 0,
  language = "en",
  className,
}: IcebreakerSuggestionsProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // useMemo MUST be called before any conditional return (Rules of Hooks)
  const sharedFieldsKey = sharedFields.join(",");
  const questions = useMemo(
    () => getPersonalizedQuestions(sharedFields, 5),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sharedFieldsKey, refreshKey],
  );

  const refresh = () => setRefreshKey((k) => k + 1);

  // Hide after 5 messages or if dismissed (after all hooks)
  if (messageCount >= 5 || isDismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        className={cn(
          "border-t-2 border-dashed border-[#E0E0E0] bg-white",
          className,
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <div className="flex items-center gap-2">
            <MessageCircle
              className="w-3.5 h-3.5 text-[#424242]"
              strokeWidth={2.5}
            />
            <span className="text-[10px] font-heading font-bold text-[#424242] uppercase tracking-wider">
              {language === "en" ? "Conversation Starters" : "बातचीत शुरू करें"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={refresh}
              className="p-1 bg-transparent border-none cursor-pointer text-[#9E9E9E] hover:text-black"
              aria-label="Refresh suggestions"
            >
              <RefreshCw className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 bg-transparent border-none cursor-pointer text-[#9E9E9E] hover:text-black"
              aria-label="Hide suggestions"
            >
              <X className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Suggestion chips — horizontal scroll */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide px-4 pb-3 pt-1">
          {questions.map((q) => (
            <motion.button
              key={q.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelect(language === "en" ? q.textEn : q.textHi)}
              className={cn(
                "flex-shrink-0 inline-flex items-center gap-2",
                "px-3 py-2 rounded-[4px]",
                "bg-[#F8F8F8] text-[#212121]",
                "border-2 border-black shadow-[2px_2px_0px_#000000]",
                "text-xs font-bold cursor-pointer whitespace-nowrap",
                "transition-[transform,box-shadow] duration-150",
                "hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000]",
              )}
            >
              <span className="text-sm leading-none">{q.icon}</span>
              <span>{language === "en" ? q.textEn : q.textHi}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default IcebreakerSuggestions;
