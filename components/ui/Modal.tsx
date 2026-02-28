"use client";

import { type ReactNode, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

// ─── Types ───────────────────────────────────────────────────────────────
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showClose?: boolean;
  closeOnBackdrop?: boolean;
  footer?: ReactNode;
  className?: string;
}

const sizeMap = {
  sm: "max-w-[360px]",
  md: "max-w-[500px]",
  lg: "max-w-[600px]",
  xl: "max-w-[720px]",
  full: "max-w-[calc(100vw-32px)] max-h-[calc(100vh-32px)]",
};

// ─── Component ───────────────────────────────────────────────────────────
export function Modal({
  isOpen,
  onClose,
  children,
  title,
  description,
  size = "md",
  showClose = true,
  closeOnBackdrop = true,
  footer,
  className,
}: ModalProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop: rgba(0,0,0,0.8) with halftone */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/80"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "8px 8px",
            }}
            onClick={closeOnBackdrop ? onClose : undefined}
            aria-hidden="true"
          />

          {/* Content: 4px border, 0px radius, 8px shadow */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={cn(
              "relative w-[90%]",
              sizeMap[size],
              "bg-white",
              "border-4 border-black",
              "shadow-[8px_8px_0px_#000000]",
              "overflow-hidden",
              className,
            )}
          >
            {/* Header: black bar with white text */}
            {(title || showClose) && (
              <div className="flex items-center justify-between px-6 py-4 bg-black text-white border-b-2 border-black">
                <div>
                  {title && (
                    <h2 className="text-sm font-heading font-bold uppercase tracking-wider m-0">
                      {title}
                    </h2>
                  )}
                </div>
                {showClose && (
                  <button
                    onClick={onClose}
                    className={cn(
                      "w-8 h-8 bg-white text-black border-2 border-white",
                      "flex items-center justify-center font-bold",
                      "hover:bg-[#E0E0E0]",
                      "focus-visible:shadow-[0_0_0_3px_#000000,0_0_0_6px_#FFFFFF]",
                    )}
                    aria-label="Close dialog"
                  >
                    <X className="w-4 h-4" strokeWidth={3} />
                  </button>
                )}
              </div>
            )}

            {/* Description */}
            {description && (
              <div className="px-8 pt-6">
                <p className="text-sm text-[#424242] pb-4 border-b border-[#E0E0E0] m-0">
                  {description}
                </p>
              </div>
            )}

            {/* Body: 32px padding */}
            <div className="px-8 py-6">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="px-8 py-6 border-t-2 border-black flex items-center justify-end gap-4">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default Modal;
