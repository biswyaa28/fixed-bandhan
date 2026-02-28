/**
 * Bandhan AI — Appreciate Menu (Hinge "Comment on Specifics")
 * Long-press context menu to send appreciation with a message.
 */
"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Send, X, MessageCircle } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) { return twMerge(clsx(c)); }

export interface AppreciateMenuProps {
  /** What element is being appreciated */
  targetLabel: string;
  /** Callback on send */
  onSend: (message: string) => void;
  /** Callback to cancel */
  onClose: () => void;
  /** Is the menu open */
  isOpen: boolean;
  language?: "en" | "hi";
  className?: string;
}

const QUICK_MESSAGES_EN = [
  "Love this! 😊",
  "This really resonates with me",
  "We have this in common!",
  "Great taste! 👏",
];

const QUICK_MESSAGES_HI = [
  "बहुत अच्छा! 😊",
  "यह मुझसे बहुत मिलता है",
  "यह हमारे बीच समान है!",
  "बेहतरीन पसंद! 👏",
];

export function AppreciateMenu({
  targetLabel,
  onSend,
  onClose,
  isOpen,
  language = "en",
  className,
}: AppreciateMenuProps) {
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const quickMessages = language === "en" ? QUICK_MESSAGES_EN : QUICK_MESSAGES_HI;

  const handleSend = () => {
    const text = message.trim();
    if (!text) return;
    onSend(text);
    setMessage("");
  };

  const handleQuick = (text: string) => {
    onSend(text);
    setMessage("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[80]"
            onClick={onClose}
          />

          {/* Menu */}
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "fixed bottom-4 left-4 right-4 z-[85] max-w-[400px] mx-auto",
              "bg-white border-4 border-black shadow-[6px_6px_0px_#000000]",
              className,
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-black text-white">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4" strokeWidth={2.5} fill="currentColor" />
                <span className="text-[10px] font-heading font-bold uppercase tracking-wider">
                  {language === "en" ? "Appreciate This" : "इसकी प्रशंसा करें"}
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-6 h-6 bg-white text-black flex items-center justify-center cursor-pointer"
                aria-label="Close"
              >
                <X className="w-3.5 h-3.5" strokeWidth={3} />
              </button>
            </div>

            <div className="px-4 py-3">
              {/* Target label */}
              <p className="text-[10px] text-[#9E9E9E] m-0 mb-2 uppercase font-heading font-bold tracking-wider">
                {language === "en" ? "Appreciating:" : "प्रशंसा:"} {targetLabel}
              </p>

              {/* Quick messages */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {quickMessages.map((msg, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuick(msg)}
                    className="px-3 py-1.5 text-[11px] font-bold text-[#424242] bg-[#F8F8F8] border-2 border-black cursor-pointer hover:bg-black hover:text-white transition-colors duration-150"
                  >
                    {msg}
                  </button>
                ))}
              </div>

              {/* Custom message */}
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, 100))}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={language === "en" ? "Write something specific..." : "कुछ विशिष्ट लिखें..."}
                  className="flex-1 px-3 py-2 text-sm border-2 border-black bg-white text-[#212121] placeholder:text-[#9E9E9E] placeholder:italic outline-none focus:shadow-[0_0_0_3px_#FFFFFF,0_0_0_6px_#000000]"
                  maxLength={100}
                  autoFocus
                />
                <button
                  onClick={handleSend}
                  disabled={!message.trim()}
                  className={cn(
                    "w-10 h-10 flex items-center justify-center border-[3px] border-black cursor-pointer",
                    message.trim()
                      ? "bg-black text-white shadow-[2px_2px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000]"
                      : "bg-[#E0E0E0] text-[#9E9E9E] border-[#9E9E9E] cursor-default",
                    "transition-[transform,box-shadow] duration-150",
                  )}
                  aria-label="Send appreciation"
                >
                  <Send className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>
              <p className="text-[9px] text-[#9E9E9E] m-0 mt-1 text-right">{message.length}/100</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/** Hook for long-press detection (returns isPressed + handlers) */
export function useLongPress(onLongPress: () => void, delay = 500) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const onStart = useCallback(() => {
    timerRef.current = setTimeout(onLongPress, delay);
  }, [onLongPress, delay]);
  const onEnd = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);
  return { onMouseDown: onStart, onMouseUp: onEnd, onMouseLeave: onEnd, onTouchStart: onStart, onTouchEnd: onEnd };
}

export default AppreciateMenu;
