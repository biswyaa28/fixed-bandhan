"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

/*
 * Button hover pattern (3-stage):
 * Default: 4px shadow
 * Hover:   translate(2px,2px) + 2px shadow (partial press)
 * Active:  translate(2px,2px) + inset shadow (full press)
 */

// ─── Variant Definitions ─────────────────────────────────────────────────
const variants = {
  primary: cn(
    "bg-white text-black",
    "border-[3px] border-black",
    "shadow-[4px_4px_0px_#000000]",
    "hover:bg-black hover:text-white",
    "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000]",
    "active:!translate-x-[2px] active:!translate-y-[2px] active:!shadow-[inset_2px_2px_0px_rgba(0,0,0,0.2)]",
  ),
  secondary: cn(
    "bg-transparent text-black",
    "border-2 border-black",
    "shadow-[4px_4px_0px_#000000]",
    "hover:bg-black hover:text-white",
    "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000]",
    "active:!translate-x-[2px] active:!translate-y-[2px] active:!shadow-[inset_2px_2px_0px_rgba(0,0,0,0.2)]",
  ),
  outline: cn(
    "bg-white text-black",
    "border-2 border-black",
    "shadow-[2px_2px_0px_#000000]",
    "hover:bg-[#F8F8F8]",
    "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none",
    "active:!translate-x-[2px] active:!translate-y-[2px] active:!shadow-[inset_2px_2px_0px_rgba(0,0,0,0.2)]",
  ),
  ghost: cn(
    "bg-transparent text-[#424242]",
    "border-2 border-transparent",
    "hover:border-black hover:bg-[#F8F8F8]",
    "active:bg-[#E0E0E0]",
  ),
  danger: cn(
    "bg-white text-black",
    "border-[3px] border-black",
    "shadow-[4px_4px_0px_#000000]",
    "hover:bg-black hover:text-white",
    "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000]",
    "active:!translate-x-[2px] active:!translate-y-[2px] active:!shadow-[inset_2px_2px_0px_rgba(0,0,0,0.2)]",
  ),
  premium: cn(
    "bg-[#424242] text-white",
    "border-[3px] border-black",
    "shadow-[4px_4px_0px_#000000]",
    "hover:bg-black",
    "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000]",
    "active:!translate-x-[2px] active:!translate-y-[2px] active:!shadow-[inset_2px_2px_0px_rgba(0,0,0,0.2)]",
  ),
} as const;

// Padding: 8px grid aligned. sm=8/16, md=12/24, lg=16/32, xl=16/40
const sizes = {
  sm: "px-4 py-2 text-xs gap-2",
  md: "px-6 py-3 text-sm gap-2",
  lg: "px-8 py-4 text-base gap-2",
  xl: "px-10 py-4 text-lg gap-3",
  icon: "p-3 w-12 h-12", // 48px touch target
  "icon-sm": "p-2 w-8 h-8", // 32px
  "icon-lg": "p-4 w-14 h-14", // 56px
} as const;

// ─── Types ───────────────────────────────────────────────────────────────
export interface ButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children?: ReactNode;
  fullWidth?: boolean;
  "aria-label"?: string;
}

// ─── Component ───────────────────────────────────────────────────────────
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      children,
      fullWidth = false,
      disabled,
      className,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;
    const isIconOnly = size === "icon" || size === "icon-sm" || size === "icon-lg";

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Base
          "relative inline-flex items-center justify-center",
          "font-heading font-bold leading-tight",
          "cursor-pointer select-none uppercase",
          "rounded-[4px]",
          // Smooth transition for hover press-in
          "transition-[transform,box-shadow] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]",
          // Focus: double outline with white gap
          "focus-visible:shadow-[0_0_0_3px_#FFFFFF,0_0_0_6px_#000000] focus-visible:outline-none",
          // Variant
          variants[variant],
          // Size
          sizes[size],
          // Full width
          fullWidth && "w-full",
          // Disabled
          isDisabled &&
            "!translate-x-0 !translate-y-0 !cursor-not-allowed !border-dashed !border-[#9E9E9E] !bg-[#F8F8F8] !text-[#9E9E9E] !shadow-none",
          className,
        )}
        {...props}
      >
        {/* Loading pixel block */}
        {loading && (
          <span
            className="inline-block h-4 w-4 animate-pixel-spin bg-current"
            aria-hidden="true"
          />
        )}

        {/* Left icon */}
        {!loading && leftIcon && (
          <span className="flex flex-shrink-0 items-center">{leftIcon}</span>
        )}

        {/* Children */}
        {!isIconOnly && children && (
          <span className={cn(loading && "opacity-0")}>{children}</span>
        )}
        {isIconOnly && !loading && children}

        {/* Right icon */}
        {!loading && rightIcon && (
          <span className="flex flex-shrink-0 items-center">{rightIcon}</span>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
export default Button;
