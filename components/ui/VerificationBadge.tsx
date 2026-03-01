/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Verification Badge (UI Kit Version)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Compact, reusable verification badge with the specific colour requirements:
 *
 *   • Bronze: #CD7F32 text + border  — Phone verified
 *   • Silver: #C0C0C0 text + border  — ID verified (DigiLocker)
 *   • Gold:   #FFD700 text + border  — Premium verified + **pulse animation**
 *
 * Sizes (8px grid):
 *   sm  → 16×16 inline badge
 *   md  → 24×24 card badge
 *   lg  → 32×32 profile header badge
 *
 * All borders 2px. Hard shadows only. No rounded corners.
 *
 * This is the /ui/ version — a thin, focused component without tooltips
 * or translations. For the full-featured version with tooltips and Hindi
 * support, see `components/VerificationBadge.tsx`.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { Shield, ShieldCheck, Star } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

// ─── Types ───────────────────────────────────────────────────────────────

export type VerificationTier = "bronze" | "silver" | "gold";

export interface VerificationBadgeProps {
  tier: VerificationTier;
  /** sm=16px inline, md=24px card, lg=32px header */
  size?: "sm" | "md" | "lg";
  /** Show the tier label text next to the icon (e.g. "Gold Verified") */
  showLabel?: boolean;
  className?: string;
}

// ─── Config ──────────────────────────────────────────────────────────────

const TIER_CONFIG = {
  bronze: {
    Icon: Shield,
    letter: "B",
    label: "Phone Verified",
    /** Border + text colour */
    color: "#CD7F32",
    bg: "#FDF4E8",
    iconFill: "none",
  },
  silver: {
    Icon: Shield,
    letter: "S",
    label: "ID Verified",
    color: "#C0C0C0",
    bg: "#F5F5F5",
    iconFill: "none",
  },
  gold: {
    Icon: ShieldCheck,
    letter: "G",
    label: "Gold Verified",
    color: "#FFD700",
    bg: "#FFFEF0",
    iconFill: "none",
  },
} as const;

const SIZE_MAP = {
  sm: {
    box: "w-4 h-4",
    fontSize: "text-[6px]",
    border: "border-[1.5px]",
    iconSize: "w-2.5 h-2.5",
    labelSize: "text-[7px]",
    gap: "gap-1",
    padding: "px-1 py-0.5",
  },
  md: {
    box: "w-6 h-6",
    fontSize: "text-[8px]",
    border: "border-[2px]",
    iconSize: "w-3 h-3",
    labelSize: "text-[8px]",
    gap: "gap-1",
    padding: "px-1.5 py-0.5",
  },
  lg: {
    box: "w-8 h-8",
    fontSize: "text-[10px]",
    border: "border-[2px]",
    iconSize: "w-3.5 h-3.5",
    labelSize: "text-[9px]",
    gap: "gap-1.5",
    padding: "px-2 py-1",
  },
} as const;

// ─── Component ───────────────────────────────────────────────────────────

export function VerificationBadge({
  tier,
  size = "md",
  showLabel = false,
  className,
}: VerificationBadgeProps) {
  const cfg = TIER_CONFIG[tier];
  const s = SIZE_MAP[size];
  const isGold = tier === "gold";

  // Icon-only badge (default)
  if (!showLabel) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center",
          "font-heading font-bold leading-none select-none",
          s.box,
          s.border,
          s.fontSize,
          // Gold gets the pulse animation
          isGold && "perfect-match-pulse",
          className,
        )}
        style={{
          backgroundColor: cfg.bg,
          borderColor: cfg.color,
          color: cfg.color,
        }}
        aria-label={cfg.label}
        role="img"
      >
        {cfg.letter}
      </span>
    );
  }

  // Badge with label
  return (
    <span
      className={cn(
        "inline-flex items-center",
        s.border,
        s.gap,
        s.padding,
        isGold && "perfect-match-pulse",
        className,
      )}
      style={{
        backgroundColor: cfg.bg,
        borderColor: cfg.color,
      }}
      aria-label={cfg.label}
      role="img"
    >
      <cfg.Icon
        className={cn(s.iconSize)}
        strokeWidth={2.5}
        style={{ color: cfg.color }}
      />
      <span
        className={cn(
          "font-heading font-bold uppercase tracking-wider leading-none",
          s.labelSize,
        )}
        style={{ color: cfg.color }}
      >
        {cfg.label}
      </span>
    </span>
  );
}

export default VerificationBadge;
