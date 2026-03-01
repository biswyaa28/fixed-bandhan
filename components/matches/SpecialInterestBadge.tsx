/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Special Interest / Premium Interest Badge
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Variants:
 *   • special  → Yellow ⭐ star badge
 *   • premium  → Red 🌹 rose badge
 *   • regular  → Black ❤️ heart (no special treatment)
 *
 * Comic-book aesthetic: 2px black border, hard shadow, monochromatic base.
 * Colour exceptions for badges: #FFD700 (gold/star), #EF476F (red/rose).
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { Star, Heart, Diamond } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type InterestType = "regular" | "special" | "premium";

export interface SpecialInterestBadgeProps {
  type: InterestType;
  /** Compact inline size vs standard card badge */
  size?: "sm" | "md";
  className?: string;
}

// ─── Config ──────────────────────────────────────────────────────────────────

const BADGE_CONFIG = {
  regular: {
    Icon: Heart,
    label: "Like",
    bg: "bg-white",
    border: "border-black",
    text: "text-black",
    iconColor: "text-black",
    shadow: "shadow-[2px_2px_0px_#000000]",
  },
  special: {
    Icon: Star,
    label: "Special Interest",
    bg: "bg-[#FFFEF5]",
    border: "border-[#FFD700]",
    text: "text-black",
    iconColor: "text-[#FFD700]",
    shadow: "shadow-[2px_2px_0px_#000000]",
  },
  premium: {
    Icon: Diamond,
    label: "Premium Interest",
    bg: "bg-[#FFF0F3]",
    border: "border-[#EF476F]",
    text: "text-[#EF476F]",
    iconColor: "text-[#EF476F]",
    shadow: "shadow-[2px_2px_0px_#000000]",
  },
} as const;

// ─── Component ───────────────────────────────────────────────────────────────

export function SpecialInterestBadge({
  type,
  size = "sm",
  className,
}: SpecialInterestBadgeProps) {
  const cfg = BADGE_CONFIG[type];
  const Icon = cfg.Icon;
  const isSm = size === "sm";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 border-[2px]",
        cfg.bg,
        cfg.border,
        cfg.shadow,
        isSm ? "px-1.5 py-0.5" : "px-2 py-1",
        className,
      )}
      aria-label={cfg.label}
    >
      <Icon
        className={cn(cfg.iconColor, isSm ? "w-3 h-3" : "w-3.5 h-3.5")}
        strokeWidth={2.5}
        fill={type === "special" ? "#FFD700" : type === "premium" ? "#EF476F" : "none"}
      />
      <span
        className={cn(
          "font-heading font-bold uppercase tracking-wider",
          cfg.text,
          isSm ? "text-[7px]" : "text-[8px]",
        )}
      >
        {cfg.label}
      </span>
    </span>
  );
}

export default SpecialInterestBadge;
