/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Typing Indicator (Comic Book Style)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Shows "[Name] is typing…" with three bouncing square dots.
 * 8-bit aesthetic: square dots, stepped animation, monochromatic.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

export interface TypingIndicatorProps {
  /** Name of the person typing */
  name?: string;
  /** Whether to show the indicator */
  visible?: boolean;
  className?: string;
}

export function TypingIndicator({
  name,
  visible = true,
  className,
}: TypingIndicatorProps) {
  if (!visible) return null;

  return (
    <div
      className={cn("flex items-center gap-2 px-1 py-1", className)}
      role="status"
      aria-live="polite"
      aria-label={name ? `${name} is typing` : "Someone is typing"}
    >
      {/* Bubble container mimics a received message */}
      <div className="bg-[#F8F8F8] border border-[#E0E0E0] px-3 py-2 inline-flex items-center gap-2">
        {/* Three bouncing dots */}
        <div className="flex items-center gap-[3px]" aria-hidden="true">
          <span className="w-[5px] h-[5px] bg-[#9E9E9E] animate-[typing-bounce_0.8s_ease-in-out_infinite_0ms]" />
          <span className="w-[5px] h-[5px] bg-[#9E9E9E] animate-[typing-bounce_0.8s_ease-in-out_infinite_200ms]" />
          <span className="w-[5px] h-[5px] bg-[#9E9E9E] animate-[typing-bounce_0.8s_ease-in-out_infinite_400ms]" />
        </div>
        {name && (
          <span className="text-[10px] text-[#9E9E9E] font-heading font-bold uppercase tracking-wider">
            {name}
          </span>
        )}
      </div>
    </div>
  );
}

export default TypingIndicator;
