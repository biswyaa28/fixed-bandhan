/**
 * Bandhan AI — Special Interest Button (Super Like equivalent)
 * Limited to 1/day free, unlimited premium. Star icon with pulse.
 */
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Crown } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) { return twMerge(clsx(c)); }

export interface SpecialInterestButtonProps {
  profileId: string;
  remaining: number;
  onSend: (profileId: string) => boolean;
  isPremium?: boolean;
  className?: string;
}

export function SpecialInterestButton({
  profileId,
  remaining,
  onSend,
  isPremium = false,
  className,
}: SpecialInterestButtonProps) {
  const [sent, setSent] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const canSend = isPremium || remaining > 0;

  const handleTap = () => {
    if (sent) return;
    if (!canSend) {
      setShowUpgrade(true);
      return;
    }
    const success = onSend(profileId);
    if (success) setSent(true);
  };

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)}>
      <motion.button
        onClick={handleTap}
        whileTap={canSend && !sent ? { scale: 0.92 } : undefined}
        disabled={sent}
        className={cn(
          "w-12 h-12 flex items-center justify-center",
          "border-[3px] border-black cursor-pointer",
          "transition-[transform,box-shadow,background,color] duration-150",
          sent
            ? "bg-black text-white shadow-none"
            : canSend
              ? "bg-white text-black shadow-[4px_4px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000]"
              : "bg-[#E0E0E0] text-[#9E9E9E] border-[#9E9E9E] cursor-default",
        )}
        aria-label={sent ? "Special interest sent" : "Send special interest"}
      >
        <Star
          className={cn("w-5 h-5", sent && "fill-current")}
          strokeWidth={2.5}
        />
      </motion.button>

      {/* Pulse animation on send */}
      <AnimatePresence>
        {sent && (
          <motion.div
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 2.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, repeat: 2 }}
            className="absolute inset-0 border-[3px] border-black pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Counter */}
      {!sent && (
        <span className="mt-1 text-[9px] font-pixel font-bold text-[#9E9E9E] leading-none">
          {isPremium ? "∞" : `${remaining}/1`}
        </span>
      )}
      {sent && (
        <span className="mt-1 text-[9px] font-pixel font-bold text-black leading-none uppercase">
          ✓ Sent
        </span>
      )}

      {/* Upgrade prompt */}
      <AnimatePresence>
        {showUpgrade && !canSend && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute -top-16 left-1/2 -translate-x-1/2 px-3 py-2 bg-white border-2 border-black shadow-[2px_2px_0px_#000000] whitespace-nowrap z-10"
          >
            <div className="flex items-center gap-1 text-[10px] font-heading font-bold text-black uppercase">
              <Crown className="w-3 h-3" strokeWidth={2.5} />
              Go Premium for unlimited
            </div>
            <div className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-black" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SpecialInterestButton;
