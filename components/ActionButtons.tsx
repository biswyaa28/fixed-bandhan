/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Action Buttons (Like / Pass / Special Interest)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Comic book / 8-bit aesthetic — thick borders, hard shadows, no gradients.
 * Includes: Pass, Like, Special Interest (star), and Undo buttons.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, Star, RotateCcw, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

// ─── Types ───────────────────────────────────────────────────────────────

export interface ActionButtonsProps {
  /** Called when user taps Pass */
  onPass: () => void;
  /** Called when user taps Like */
  onLike: () => void;
  /** Called when user taps Special Interest */
  onSpecialInterest: () => void;
  /** Called when user taps Undo */
  onUndo?: () => void;
  /** Whether the undo button should be visible */
  canUndo?: boolean;
  /** Whether an action is currently in progress */
  isLoading?: boolean;
  /** Which action is loading */
  loadingAction?: "like" | "pass" | "special" | null;
  /** Whether special interest is available today */
  specialInterestAvailable?: boolean;
  /** Remaining special interests today */
  specialInterestRemaining?: number;
  /** Remaining likes today */
  likesRemaining?: number;
  /** Whether all buttons should be disabled */
  disabled?: boolean;
}

// ─── Main Component ──────────────────────────────────────────────────────

export function ActionButtons({
  onPass,
  onLike,
  onSpecialInterest,
  onUndo,
  canUndo = false,
  isLoading = false,
  loadingAction = null,
  specialInterestAvailable = true,
  specialInterestRemaining,
  likesRemaining,
  disabled = false,
}: ActionButtonsProps) {
  const isDisabled = disabled || isLoading;

  return (
    <div className="flex items-center justify-center gap-3 px-4 py-3">
      {/* ── Undo ── */}
      <AnimatePresence>
        {canUndo && onUndo && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <ActionButton
              icon={<RotateCcw className="w-4 h-4" strokeWidth={2.5} />}
              onClick={onUndo}
              disabled={isDisabled}
              size="sm"
              variant="secondary"
              ariaLabel="Undo last action"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Pass ── */}
      <ActionButton
        icon={
          loadingAction === "pass" ? (
            <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2.5} />
          ) : (
            <X className="w-5 h-5" strokeWidth={3} />
          )
        }
        onClick={onPass}
        disabled={isDisabled}
        size="md"
        variant="secondary"
        ariaLabel="Pass on this profile"
      />

      {/* ── Like ── */}
      <div className="relative">
        <ActionButton
          icon={
            loadingAction === "like" ? (
              <Loader2 className="w-6 h-6 animate-spin" strokeWidth={2.5} />
            ) : (
              <Heart className="w-6 h-6" strokeWidth={2.5} />
            )
          }
          onClick={onLike}
          disabled={isDisabled}
          size="lg"
          variant="primary"
          ariaLabel="Like this profile"
        />
        {/* Remaining badge */}
        {likesRemaining !== undefined && likesRemaining <= 3 && (
          <span
            className={cn(
              "absolute -top-1 -right-1 min-w-[18px] h-[18px]",
              "flex items-center justify-center",
              "text-[9px] font-bold leading-none",
              "bg-white text-black border-2 border-black",
              "px-1",
            )}
          >
            {likesRemaining}
          </span>
        )}
      </div>

      {/* ── Special Interest ── */}
      <div className="relative">
        <ActionButton
          icon={
            loadingAction === "special" ? (
              <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2.5} />
            ) : (
              <Star
                className="w-5 h-5"
                strokeWidth={2.5}
                fill={specialInterestAvailable ? "currentColor" : "none"}
              />
            )
          }
          onClick={onSpecialInterest}
          disabled={isDisabled || !specialInterestAvailable}
          size="md"
          variant="accent"
          ariaLabel={
            specialInterestAvailable
              ? "Send Special Interest"
              : "Special Interest used today"
          }
        />
        {/* Counter badge */}
        {specialInterestRemaining !== undefined && (
          <span
            className={cn(
              "absolute -top-1 -right-1 min-w-[18px] h-[18px]",
              "flex items-center justify-center",
              "text-[9px] font-bold leading-none",
              "border-2 border-black px-1",
              specialInterestRemaining > 0
                ? "bg-[#424242] text-white"
                : "bg-[#E0E0E0] text-[#9E9E9E]",
            )}
          >
            {specialInterestRemaining}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Individual Action Button ────────────────────────────────────────────

interface ActionButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  size: "sm" | "md" | "lg";
  variant: "primary" | "secondary" | "accent";
  ariaLabel: string;
}

const SIZE_MAP = {
  sm: "w-10 h-10",
  md: "w-12 h-12",
  lg: "w-14 h-14",
} as const;

const VARIANT_MAP = {
  primary: {
    base: "bg-black text-white border-black",
    hover: "hover:bg-[#424242]",
    shadow: "shadow-[3px_3px_0px_#000000]",
    hoverShadow: "hover:shadow-[2px_2px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px]",
    disabled: "bg-[#E0E0E0] text-[#9E9E9E] border-[#9E9E9E]",
  },
  secondary: {
    base: "bg-white text-[#424242] border-black",
    hover: "hover:bg-[#F8F8F8]",
    shadow: "shadow-[3px_3px_0px_#000000]",
    hoverShadow: "hover:shadow-[2px_2px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px]",
    disabled: "bg-[#F8F8F8] text-[#9E9E9E] border-[#9E9E9E]",
  },
  accent: {
    base: "bg-[#424242] text-white border-black",
    hover: "hover:bg-[#212121]",
    shadow: "shadow-[3px_3px_0px_#000000]",
    hoverShadow: "hover:shadow-[2px_2px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px]",
    disabled: "bg-[#E0E0E0] text-[#9E9E9E] border-[#9E9E9E]",
  },
};

function ActionButton({
  icon,
  onClick,
  disabled = false,
  size,
  variant,
  ariaLabel,
}: ActionButtonProps) {
  const v = VARIANT_MAP[variant];

  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.92 }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        "flex items-center justify-center",
        "border-[3px] rounded-none outline-none",
        "transition-all duration-150 cursor-pointer",
        SIZE_MAP[size],
        disabled
          ? cn(v.disabled, "cursor-not-allowed shadow-none")
          : cn(v.base, v.hover, v.shadow, v.hoverShadow),
      )}
    >
      {icon}
    </motion.button>
  );
}

// ─── Compact inline version (for card footers) ───────────────────────────

export function ActionButtonsCompact({
  onPass,
  onLike,
  disabled,
}: {
  onPass: () => void;
  onLike: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <motion.button
        whileTap={disabled ? undefined : { scale: 0.93 }}
        onClick={onPass}
        disabled={disabled}
        className={cn(
          "flex-1 flex items-center justify-center gap-1.5 py-2.5",
          "text-xs font-bold uppercase tracking-wider",
          "border-2 border-black bg-white text-black",
          "shadow-[2px_2px_0px_#000000]",
          "transition-all duration-150 cursor-pointer",
          "hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000]",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <X className="w-3.5 h-3.5" strokeWidth={3} />
        Pass
      </motion.button>

      <motion.button
        whileTap={disabled ? undefined : { scale: 0.93 }}
        onClick={onLike}
        disabled={disabled}
        className={cn(
          "flex-1 flex items-center justify-center gap-1.5 py-2.5",
          "text-xs font-bold uppercase tracking-wider",
          "border-2 border-black bg-black text-white",
          "shadow-[2px_2px_0px_#424242]",
          "transition-all duration-150 cursor-pointer",
          "hover:bg-[#424242]",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <Heart className="w-3.5 h-3.5" strokeWidth={2.5} />
        Like
      </motion.button>
    </div>
  );
}

export default ActionButtons;
