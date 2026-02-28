/**
 * Bandhan AI — Respectful Initiation Toggle (Bumble-style)
 * Women message first option with 48-hour timer.
 */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Clock, Info } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) { return twMerge(clsx(c)); }

export interface RespectfulInitiationToggleProps {
  enabled?: boolean;
  onToggle?: (enabled: boolean) => void;
  language?: "en" | "hi";
  className?: string;
}

export function RespectfulInitiationToggle({
  enabled: initialEnabled = false,
  onToggle,
  language = "en",
  className,
}: RespectfulInitiationToggleProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [showInfo, setShowInfo] = useState(false);

  const handleToggle = () => {
    const next = !enabled;
    setEnabled(next);
    onToggle?.(next);
  };

  return (
    <div className={cn("border-2 border-black bg-white shadow-[2px_2px_0px_#000000]", className)}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#F8F8F8] border-b-2 border-black">
        <Shield className="w-4 h-4 text-[#424242]" strokeWidth={2.5} />
        <span className="text-xs font-heading font-bold text-black uppercase tracking-wider">
          {language === "en" ? "Respectful Initiation" : "सम्मानजनक शुरुआत"}
        </span>
      </div>

      {/* Toggle Row */}
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex-1 mr-4">
          <p className="text-sm font-bold text-black m-0 leading-tight">
            {language === "en" ? "Women message first" : "महिला पहले संदेश भेजें"}
          </p>
          <p className="text-xs text-[#9E9E9E] m-0 mt-1 leading-normal">
            {language === "en"
              ? "Matches expire in 48 hours if no message"
              : "अगर कोई संदेश नहीं तो 48 घंटे में मैच समाप्त"}
          </p>
        </div>

        {/* Toggle switch */}
        <button
          role="switch"
          aria-checked={enabled}
          onClick={handleToggle}
          className={cn(
            "relative w-12 h-7 border-2 border-black cursor-pointer flex-shrink-0",
            "transition-colors duration-150",
            enabled ? "bg-black" : "bg-[#E0E0E0]",
          )}
        >
          <motion.div
            className="absolute top-[2px] w-5 h-5 bg-white border-2 border-black"
            animate={{ left: enabled ? 22 : 2 }}
            transition={{ duration: 0.15 }}
          />
        </button>
      </div>

      {/* Info section */}
      {enabled && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="overflow-hidden"
        >
          <div className="px-4 pb-4 border-t border-dashed border-[#E0E0E0] pt-3 space-y-2">
            <div className="flex items-start gap-2">
              <Clock className="w-3.5 h-3.5 text-[#424242] mt-0.5 flex-shrink-0" strokeWidth={2} />
              <p className="text-xs text-[#424242] m-0 leading-normal">
                {language === "en"
                  ? "Women have 48 hours to send the first message. One free extension available per match."
                  : "महिलाओं के पास पहला संदेश भेजने के लिए 48 घंटे हैं। प्रति मैच एक मुफ्त एक्सटेंशन उपलब्ध।"}
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-[#424242] mt-0.5 flex-shrink-0" strokeWidth={2} />
              <p className="text-xs text-[#424242] m-0 leading-normal">
                {language === "en"
                  ? "This creates a safer, more respectful environment. Men can still show interest with likes."
                  : "यह एक सुरक्षित, अधिक सम्मानजनक वातावरण बनाता है। पुरुष अभी भी लाइक से रुचि दिखा सकते हैं।"}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default RespectfulInitiationToggle;
