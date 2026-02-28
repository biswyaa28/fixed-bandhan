/**
 * Bandhan AI — Message Status / Read Receipts
 * Pure presentational component for delivery/read states.
 * Re-exports TypingIndicator from ChatBubble for convenience.
 */

"use client";

import { motion } from "framer-motion";
import { Check, CheckCheck, Clock } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

export type DeliveryStatus = "sending" | "sent" | "delivered" | "read" | "failed";

export interface MessageStatusProps {
  status: DeliveryStatus;
  timestamp?: string;
  showTooltip?: boolean;
  className?: string;
}

const STATUS_CONFIG: Record<DeliveryStatus, {
  icon: "clock" | "check" | "checkcheck";
  color: string;
  label: string;
}> = {
  sending: { icon: "clock", color: "text-[#9E9E9E]", label: "Sending..." },
  sent: { icon: "check", color: "text-[#9E9E9E]", label: "Sent" },
  delivered: { icon: "checkcheck", color: "text-[#9E9E9E]", label: "Delivered" },
  read: { icon: "checkcheck", color: "text-black", label: "Read" },
  failed: { icon: "clock", color: "text-black", label: "Failed" },
};

export function MessageStatus({
  status,
  timestamp,
  showTooltip = false,
  className,
}: MessageStatusProps) {
  const config = STATUS_CONFIG[status];

  const formatTime = (iso?: string) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "";
    }
  };

  const renderIcon = () => {
    switch (config.icon) {
      case "clock":
        return status === "sending" ? (
          <span className="inline-block w-3 h-3 bg-[#9E9E9E] animate-pixel-spin" />
        ) : (
          <Clock className="w-3.5 h-3.5" strokeWidth={2.5} />
        );
      case "check":
        return <Check className="w-3.5 h-3.5" strokeWidth={2.5} />;
      case "checkcheck":
        return <CheckCheck className="w-3.5 h-3.5" strokeWidth={2.5} />;
    }
  };

  return (
    <span
      className={cn("inline-flex items-center gap-1", config.color, className)}
      title={showTooltip ? `${config.label}${timestamp ? ` at ${formatTime(timestamp)}` : ""}` : undefined}
      aria-label={config.label}
    >
      {renderIcon()}
      {status === "failed" && (
        <span className="text-[9px] font-bold uppercase">!</span>
      )}
    </span>
  );
}

/** Standalone typing indicator with name */
export function TypingStatus({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className={cn("flex items-center gap-2 px-4 py-2", className)}
    >
      {/* Bouncing dots */}
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 bg-[#9E9E9E] border border-black"
            animate={{ y: [0, -3, 0] }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              delay: i * 0.12,
              ease: "linear",
            }}
          />
        ))}
      </div>
      <span className="text-[11px] text-[#9E9E9E] font-heading font-bold uppercase tracking-wider">
        {name} is typing...
      </span>
    </motion.div>
  );
}

export default MessageStatus;
