/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Floating Safety Button
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Pure red (#EF476F) shield icon, fixed bottom-right, with pulse animation.
 * Opens a safety action sheet: Block, Report, Share My Date, Emergency SOS.
 *
 * Comic-book aesthetic: hard shadow, thick border, monochrome except red.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  Ban,
  Flag,
  Share2,
  Phone,
  X,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

export interface SafetyButtonProps {
  /** Name of the other person (for report/block labels) */
  otherPersonName?: string;
  onBlock?: () => void;
  onReport?: () => void;
  onShareDate?: () => void;
  onEmergencySOS?: () => void;
  className?: string;
}

export function SafetyButton({
  otherPersonName = "this person",
  onBlock,
  onReport,
  onShareDate,
  onEmergencySOS,
  className,
}: SafetyButtonProps) {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => {
    setOpen((p) => !p);
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(15);
    }
  }, []);

  const handleAction = useCallback(
    (action: (() => void) | undefined) => {
      setOpen(false);
      action?.();
    },
    [],
  );

  const actions = [
    {
      icon: Ban,
      label: `Block ${otherPersonName}`,
      desc: "They won't be able to contact you",
      action: onBlock,
    },
    {
      icon: Flag,
      label: "Report Profile",
      desc: "Fake profile, harassment, spam",
      action: onReport,
    },
    {
      icon: Share2,
      label: "Share My Date",
      desc: "Share meeting details with a friend",
      action: onShareDate,
    },
    {
      icon: Phone,
      label: "Emergency SOS",
      desc: "Call Women Helpline: 1091",
      action: onEmergencySOS,
    },
  ];

  return (
    <>
      {/* ── FAB ── */}
      <button
        onClick={toggle}
        aria-label="Safety options"
        aria-expanded={open}
        className={cn(
          "fixed z-40",
          "bottom-24 right-4 lg:bottom-8",
          "w-12 h-12 min-w-[48px] min-h-[48px]",
          "flex items-center justify-center",
          // Red with thick black border + hard shadow
          "bg-[#EF476F] border-[2px] border-black",
          "shadow-[3px_3px_0px_#000000]",
          // Pulse animation
          "safety-pulse-btn",
          "cursor-pointer",
          "transition-[transform,box-shadow] duration-100",
          "hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000000]",
          "active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
          className,
        )}
      >
        <Shield className="w-5 h-5 text-white" strokeWidth={2.5} />
      </button>

      {/* ── Action Sheet ── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/70 z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-[3px] border-[#EF476F] safe-bottom"
              role="dialog"
              aria-modal="true"
              aria-label="Safety options"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b-[2px] border-black">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#EF476F]" strokeWidth={2.5} />
                  <h2 className="text-sm font-heading font-bold text-black uppercase tracking-wide m-0">
                    Safety Center
                  </h2>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 flex items-center justify-center border-[2px] border-black bg-white hover:bg-[#F8F8F8] cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4 text-black" strokeWidth={2.5} />
                </button>
              </div>

              {/* Actions */}
              <div className="p-3 space-y-2">
                {actions.map((a, i) => {
                  const Icon = a.icon;
                  const isEmergency = a.label.includes("Emergency");
                  return (
                    <button
                      key={i}
                      onClick={() => handleAction(a.action)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer",
                        "border-[2px] transition-all duration-100",
                        isEmergency
                          ? "border-[#EF476F] bg-[#FFF0F3] hover:bg-[#FFE0E6]"
                          : "border-black bg-white hover:bg-[#F8F8F8]",
                        "shadow-[2px_2px_0px_#000000]",
                        "hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000]",
                        "active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
                      )}
                    >
                      <div
                        className={cn(
                          "w-9 h-9 flex items-center justify-center border-[2px] border-black flex-shrink-0",
                          isEmergency ? "bg-[#EF476F]" : "bg-white",
                        )}
                      >
                        <Icon
                          className={cn("w-4 h-4", isEmergency ? "text-white" : "text-black")}
                          strokeWidth={2}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "text-sm font-heading font-bold m-0",
                            isEmergency ? "text-[#EF476F]" : "text-[#212121]",
                          )}
                        >
                          {a.label}
                        </p>
                        <p className="text-[10px] text-[#9E9E9E] m-0">{a.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Disclaimer */}
              <p className="text-[8px] text-[#9E9E9E] text-center pb-3 px-4 m-0">
                All reports are reviewed within 24 hours. Your identity is never shared.
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default SafetyButton;
