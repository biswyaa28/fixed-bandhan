"use client";

import {
  forwardRef,
  useState,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

// ─── Types ───────────────────────────────────────────────────────────────
export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  label?: string;
  hint?: string;
  error?: string;
  success?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  success?: string;
  fullWidth?: boolean;
}

// ─── Size Map (8px grid aligned padding) ─────────────────────────────────
const sizeMap = {
  sm: { input: "px-3 py-2 text-sm", label: "text-body-xs", icon: "w-4 h-4" }, // 12px 8px
  md: { input: "px-4 py-3 text-base", label: "text-body-sm", icon: "w-4 h-4" }, // 16px 12px
  lg: { input: "px-4 py-4 text-base", label: "text-base", icon: "w-5 h-5" }, // 16px 16px
};

// ─── Input Component ─────────────────────────────────────────────────────
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      hint,
      error,
      success,
      leftIcon,
      rightIcon,
      size = "md",
      fullWidth = true,
      type,
      disabled,
      className,
      id,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const isPassword = type === "password";
    const inputId =
      id || props.name || label?.toLowerCase().replace(/\s/g, "-");
    const s = sizeMap[size];

    const hasError = !!error;
    const hasSuccess = !!success;

    return (
      <div className={cn(fullWidth ? "w-full" : "inline-block", className)}>
        {/* Label: 14px, mb 8px */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "block mb-2 font-heading font-bold text-[#424242] uppercase tracking-wide",
              s.label,
            )}
          >
            {label}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative">
          {/* Left icon: 8px gap from edge */}
          {leftIcon && (
            <div
              className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 text-[#424242] pointer-events-none",
                isFocused && "text-black",
              )}
            >
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={isPassword && showPassword ? "text" : type}
            disabled={disabled}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            className={cn(
              // Base
              "w-full rounded-[4px]",
              "bg-white text-[#212121]",
              "placeholder:text-[#9E9E9E] placeholder:italic",
              "outline-none",
              // Border: 2px marker style
              "border-2 border-black",
              "shadow-[2px_2px_0px_#000000]",
              // Focus: double outline (3px white gap + 3px black)
              "focus:shadow-[0_0_0_3px_#FFFFFF,0_0_0_6px_#000000]",
              // Error: dashed border
              hasError &&
                "border-dashed shadow-[0_0_0_3px_#FFFFFF,0_0_0_6px_#000000]",
              // Size
              s.input,
              // Icons padding (8px grid: left icon = 40px offset)
              leftIcon && "pl-10",
              (rightIcon || isPassword || hasError || hasSuccess) && "pr-10",
              // Disabled
              disabled &&
                "bg-[#F8F8F8] border-dashed border-[#9E9E9E] text-[#9E9E9E] cursor-not-allowed shadow-none",
            )}
            {...props}
          />

          {/* Right icon / password toggle */}
          {isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#424242] hover:text-black p-0 border-none bg-transparent cursor-pointer"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className={s.icon} strokeWidth={2} />
              ) : (
                <Eye className={s.icon} strokeWidth={2} />
              )}
            </button>
          ) : rightIcon ? (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#424242] pointer-events-none">
              {rightIcon}
            </div>
          ) : null}

          {/* Status icons */}
          {hasError && !rightIcon && !isPassword && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <AlertCircle
                className={cn(s.icon, "text-black")}
                strokeWidth={2.5}
              />
            </div>
          )}
          {hasSuccess && !hasError && !rightIcon && !isPassword && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <CheckCircle2
                className={cn(s.icon, "text-[#424242]")}
                strokeWidth={2.5}
              />
            </div>
          )}
        </div>

        {/* Helper text: 12px, mt 8px */}
        <AnimatePresence mode="wait">
          {hasError && (
            <motion.p
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-2 text-xs text-black font-bold flex items-center gap-1 uppercase"
            >
              <span aria-hidden="true">⚡</span>
              {error}
            </motion.p>
          )}
          {hasSuccess && !hasError && (
            <motion.p
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-2 text-xs text-[#424242] font-bold flex items-center gap-1"
            >
              <CheckCircle2 className="w-3 h-3" strokeWidth={2.5} />
              {success}
            </motion.p>
          )}
          {hint && !hasError && !hasSuccess && (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-xs text-[#9E9E9E]"
            >
              {hint}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  },
);

Input.displayName = "Input";

// ─── Textarea Component ──────────────────────────────────────────────────
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      hint,
      error,
      success,
      fullWidth = true,
      disabled,
      className,
      id,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputId =
      id || props.name || label?.toLowerCase().replace(/\s/g, "-");
    const hasError = !!error;
    const hasSuccess = !!success;

    return (
      <div className={cn(fullWidth ? "w-full" : "inline-block", className)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block mb-2 text-body-sm font-heading font-bold text-[#424242] uppercase tracking-wide"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={inputId}
          disabled={disabled}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className={cn(
            "w-full rounded-[4px] min-h-[104px] resize-y",
            "bg-white text-[#212121]",
            "placeholder:text-[#9E9E9E] placeholder:italic",
            "outline-none px-4 py-3 text-base",
            "border-2 border-black shadow-[2px_2px_0px_#000000]",
            "focus:shadow-[0_0_0_3px_#FFFFFF,0_0_0_6px_#000000]",
            hasError && "border-dashed",
            disabled &&
              "bg-[#F8F8F8] border-dashed border-[#9E9E9E] text-[#9E9E9E] cursor-not-allowed shadow-none",
          )}
          {...props}
        />

        <AnimatePresence mode="wait">
          {hasError && (
            <motion.p
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-2 text-xs text-black font-bold flex items-center gap-1 uppercase"
            >
              <span aria-hidden="true">⚡</span> {error}
            </motion.p>
          )}
          {hasSuccess && !hasError && (
            <motion.p
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-2 text-xs text-[#424242] font-bold flex items-center gap-1"
            >
              <CheckCircle2 className="w-3 h-3" strokeWidth={2.5} /> {success}
            </motion.p>
          )}
          {hint && !hasError && !hasSuccess && (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-xs text-[#9E9E9E]"
            >
              {hint}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
export default Input;
