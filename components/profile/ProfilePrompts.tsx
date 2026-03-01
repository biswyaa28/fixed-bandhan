/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Profile Prompts ("Life Story" Section)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 6 Indian-relevant prompts with answers. Each prompt card has:
 *   • Question in bold heading font
 *   • Answer text (or "Tap to add" placeholder)
 *   • Pencil edit button
 *
 * Comic-book aesthetic: 2px black border, dashed dividers, 8px grid.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { Pencil, Plus, MessageCircle } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ProfilePrompt {
  id: string;
  question: string;
  answer: string | null;
}

export interface ProfilePromptsProps {
  prompts: ProfilePrompt[];
  onEditPrompt?: (promptId: string) => void;
  className?: string;
}

// ─── Default Prompts ─────────────────────────────────────────────────────────

export const DEFAULT_PROMPTS: ProfilePrompt[] = [
  {
    id: "spontaneous",
    question: "The most spontaneous thing I've done…",
    answer: "Booked a solo trip to Ladakh at midnight and left the next morning!",
  },
  {
    id: "weekend",
    question: "My ideal weekend involves…",
    answer: "Morning chai with a book, afternoon cooking experiments, evening walk by the sea.",
  },
  {
    id: "geekout",
    question: "I geek out on…",
    answer: null, // Unanswered — shows placeholder
  },
  {
    id: "family",
    question: "My family would describe me as…",
    answer: "The responsible one who also makes everyone laugh at family dinners.",
  },
  {
    id: "partner",
    question: "Looking for a partner who…",
    answer: null,
  },
  {
    id: "nonneg",
    question: "My non-negotiables in life are…",
    answer: "Honesty, family time, and at least one adventure every year.",
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export function ProfilePrompts({
  prompts,
  onEditPrompt,
  className,
}: ProfilePromptsProps) {
  const answered = prompts.filter((p) => p.answer).length;
  const total = prompts.length;

  return (
    <section className={cn("", className)} aria-label="Life story prompts">
      {/* Section header */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <h2 className="text-[10px] font-heading font-bold text-[#9E9E9E] uppercase tracking-widest m-0">
            Life Story
          </h2>
          <span className="px-1.5 py-0.5 bg-[#E0E0E0] border border-black text-[7px] font-bold text-black">
            {answered}/{total}
          </span>
        </div>
        <MessageCircle className="w-3.5 h-3.5 text-[#9E9E9E]" strokeWidth={2} />
      </div>

      {/* Prompt cards */}
      <div className="mx-4 space-y-0">
        {prompts.map((prompt, i) => {
          const hasAnswer = !!prompt.answer;
          const isLast = i === prompts.length - 1;
          return (
            <div
              key={prompt.id}
              className={cn(
                "bg-white border-[2px] border-black px-3 py-3",
                i === 0 && "shadow-[4px_4px_0px_#000000]",
                i > 0 && "border-t-0",
                !isLast && "",
              )}
            >
              {/* Question */}
              <p className="text-[10px] font-heading font-bold text-[#9E9E9E] uppercase tracking-wider m-0 mb-1">
                {prompt.question}
              </p>

              {/* Answer or placeholder */}
              <div className="flex items-start justify-between gap-2">
                {hasAnswer ? (
                  <p className="text-xs text-[#212121] leading-relaxed m-0 flex-1">
                    {prompt.answer}
                  </p>
                ) : (
                  <button
                    onClick={() => onEditPrompt?.(prompt.id)}
                    className={cn(
                      "flex items-center gap-1.5 text-xs text-[#9E9E9E] italic cursor-pointer",
                      "hover:text-[#424242] transition-colors duration-100",
                    )}
                  >
                    <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                    Tap to add your answer
                  </button>
                )}

                {/* Edit button */}
                {hasAnswer && (
                  <button
                    onClick={() => onEditPrompt?.(prompt.id)}
                    className={cn(
                      "flex items-center gap-0.5 flex-shrink-0",
                      "text-[8px] font-heading font-bold text-black uppercase tracking-wider cursor-pointer",
                      "hover:underline",
                    )}
                    aria-label={`Edit answer for: ${prompt.question}`}
                  >
                    <Pencil className="w-2.5 h-2.5" strokeWidth={2} />
                    Edit
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default ProfilePrompts;
