/**
 * Bandhan AI — Premium Interest Button (Hinge "Roses" equivalent)
 * 1/week free, unlimited premium. Gold-highlighted profile effect.
 */
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Star } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) { return twMerge(clsx(c)); }

export interface PremiumInterestButtonProps {
  profileId: string;
  remaining: number;
  isPremium?: boolean;
  onSend?: (profileId: string) => void;
  onUpgrade?: () => void;
  className?: string;
}

export function PremiumInterestButton({
  profileId,
  remaining,
  isPremium = false,
  onSend,
  onUpgrade,
  className,
}: PremiumInterestButtonProps) {
  const [sent, setSent] = useState(false);
  const canSend = isPremium || remaining > 0;

  const handleTap = () => {
    if (sent) return;
    if (!canSend) {
      onUpgrade?.();
      return;
    }
    onSend?.(profileId);
    setSent(true);
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
            ? "bg-[#424242] text-white shadow-none"
            : canSend
              ? "bg-[#424242] text-white shadow-[4px_4px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000]"
              : "bg-[#E0E0E0] text-[#9E9E9E] border-[#9E9E9E] cursor-default",
        )}
        aria-label={sent ? "Premium interest sent" : "Send premium interest"}
      >
        <Crown className={cn("w-5 h-5", sent && "fill-current")} strokeWidth={2.5} />
      </motion.button>

      {/* Petal-fall animation on send */}
      <AnimatePresence>
        {sent && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 1, y: -8, x: (i - 3) * 6, rotate: 0 }}
                animate={{ opacity: 0, y: 40, x: (i - 3) * 12, rotate: 180 + i * 30 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, delay: i * 0.08 }}
                className="absolute top-0 w-2 h-2 bg-[#424242] border border-black pointer-events-none"
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Counter */}
      <span className="mt-1 text-[9px] font-pixel font-bold text-[#9E9E9E] leading-none">
        {sent ? "✓ Sent" : isPremium ? "∞" : `${remaining}/wk`}
      </span>
    </div>
  );
}

export default PremiumInterestButton;
