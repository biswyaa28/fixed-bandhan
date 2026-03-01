/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Success Tracker Modal ("Did You Meet?")
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Appears after 7 days of chatting. Three-step flow:
 *   Step 1: "Did you meet this person?" — 4 emoji response buttons
 *   Step 2: Optional comment field
 *   Step 3: Thank you / celebration
 *
 * Response options:
 *   😊 "Yes, it went great!"
 *   😐 "Yes, but not compatible"
 *   👍 "Not yet, but planning"
 *   ✋ "No, and won't meet"
 *
 * Comic-book aesthetic: 4px black border, black header, hard shadow.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

// ─── Types ───────────────────────────────────────────────────────────────

export type MeetingStatus = "great" | "not-compatible" | "planning" | "no";

export interface SuccessTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchName: string;
  matchId: string;
  onSubmit?: (matchId: string, status: MeetingStatus, comment: string) => void;
}

// ─── Response Options ────────────────────────────────────────────────────

const OPTIONS: {
  id: MeetingStatus;
  emoji: string;
  labelEn: string;
  labelHi: string;
}[] = [
  { id: "great", emoji: "😊", labelEn: "Yes, it went great!", labelHi: "हाँ, बहुत अच्छा रहा!" },
  { id: "not-compatible", emoji: "😐", labelEn: "Yes, but not compatible", labelHi: "हाँ, लेकिन मेल नहीं खाया" },
  { id: "planning", emoji: "👍", labelEn: "Not yet, but planning to", labelHi: "अभी नहीं, पर मिलने वाले हैं" },
  { id: "no", emoji: "✋", labelEn: "No, and won't meet", labelHi: "नहीं, और नहीं मिलेंगे" },
];

// ─── Component ───────────────────────────────────────────────────────────

export function SuccessTrackerModal({
  isOpen,
  onClose,
  matchName,
  matchId,
  onSubmit,
}: SuccessTrackerModalProps) {
  const [step, setStep] = useState<"question" | "comment" | "done">("question");
  const [selected, setSelected] = useState<MeetingStatus | null>(null);
  const [comment, setComment] = useState("");

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setStep("question");
      setSelected(null);
      setComment("");
    }
  }, [isOpen]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [isOpen]);

  const handleSelect = useCallback((status: MeetingStatus) => {
    setSelected(status);
    setStep("comment");
  }, []);

  const handleSubmit = useCallback(() => {
    if (selected) onSubmit?.(matchId, selected, comment);
    setStep("done");
  }, [selected, matchId, comment, onSubmit]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "8px 8px",
            }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-label="Success Tracker"
            className="relative w-[90%] max-w-[400px] bg-white border-4 border-black shadow-[8px_8px_0px_#000000] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-black text-white border-b-[2px] border-black">
              <span className="text-xs font-heading font-bold uppercase tracking-wider">
                Success Tracker
              </span>
              <button
                onClick={onClose}
                className="w-6 h-6 bg-white text-black flex items-center justify-center cursor-pointer border-none"
                aria-label="Close"
              >
                <X className="w-3.5 h-3.5" strokeWidth={3} />
              </button>
            </div>

            <div className="px-5 py-5">
              <AnimatePresence mode="wait">
                {/* ── Step 1: Question ───────────────────────── */}
                {step === "question" && (
                  <motion.div
                    key="question"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                  >
                    <h3 className="text-sm font-heading font-bold text-black m-0 mb-0.5">
                      Did you meet {matchName} in real life?
                    </h3>
                    <p className="text-[10px] text-[#9E9E9E] m-0 mb-1">
                      क्या आप {matchName} से असल ज़िंदगी में मिले?
                    </p>
                    <p className="text-[9px] text-[#9E9E9E] m-0 mb-4 border-b border-dashed border-[#E0E0E0] pb-3">
                      Your feedback helps improve matches for everyone
                    </p>

                    <div className="space-y-2">
                      {OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => handleSelect(opt.id)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 text-left",
                            "border-[2px] border-black bg-white cursor-pointer",
                            "shadow-[2px_2px_0px_#000000]",
                            "hover:bg-[#F8F8F8]",
                            "hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000]",
                            "transition-[transform,box-shadow] duration-150",
                          )}
                        >
                          <span className="text-2xl leading-none">{opt.emoji}</span>
                          <div className="flex-1">
                            <span className="text-xs font-heading font-bold text-black uppercase block">
                              {opt.labelEn}
                            </span>
                            <span className="text-[9px] text-[#9E9E9E] font-hindi">
                              {opt.labelHi}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={onClose}
                      className="w-full mt-3 py-2 text-[10px] font-heading font-bold uppercase text-[#9E9E9E] bg-transparent border-none cursor-pointer hover:text-black transition-colors"
                    >
                      Skip for now · अभी छोड़ें
                    </button>
                  </motion.div>
                )}

                {/* ── Step 2: Comment ────────────────────────── */}
                {step === "comment" && (
                  <motion.div
                    key="comment"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                  >
                    {/* Selected option recap */}
                    {selected && (
                      <div className="flex items-center gap-2 px-3 py-2 border-[2px] border-black bg-[#F8F8F8] mb-3">
                        <span className="text-lg leading-none">
                          {OPTIONS.find((o) => o.id === selected)?.emoji}
                        </span>
                        <span className="text-[10px] font-heading font-bold text-black uppercase">
                          {OPTIONS.find((o) => o.id === selected)?.labelEn}
                        </span>
                      </div>
                    )}

                    <h3 className="text-sm font-heading font-bold text-black m-0 mb-1">
                      Want to share more?
                    </h3>
                    <p className="text-[9px] text-[#9E9E9E] m-0 mb-3">
                      Optional — कुछ और बताना चाहेंगे?
                    </p>

                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value.slice(0, 200))}
                      placeholder="How did it go? (Optional)"
                      className={cn(
                        "w-full min-h-[80px] p-3 text-sm text-[#212121]",
                        "border-[2px] border-black bg-white",
                        "placeholder:text-[#9E9E9E] placeholder:italic",
                        "outline-none resize-none",
                        "focus:shadow-[0_0_0_3px_#FFFFFF,0_0_0_6px_#000000]",
                      )}
                      maxLength={200}
                    />
                    <p className="text-[8px] text-[#9E9E9E] m-0 mt-1 text-right">{comment.length}/200</p>

                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => setStep("question")}
                        className="flex-1 py-2.5 border-[2px] border-black text-[10px] font-heading font-bold uppercase tracking-wider cursor-pointer bg-white hover:bg-[#F8F8F8] transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleSubmit}
                        className={cn(
                          "flex-[2] py-2.5",
                          "border-[3px] border-black bg-black text-white",
                          "shadow-[4px_4px_0px_#000000]",
                          "text-[10px] font-heading font-bold uppercase tracking-wider cursor-pointer",
                          "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000]",
                          "transition-[transform,box-shadow] duration-150",
                        )}
                      >
                        Submit Feedback
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── Step 3: Done ───────────────────────────── */}
                {step === "done" && (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-4"
                  >
                    {selected === "great" && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        className="w-16 h-16 mx-auto mb-4 bg-[#F8F8F8] border-[2px] border-black flex items-center justify-center shadow-[4px_4px_0px_#000000]"
                      >
                        <Sparkles className="w-8 h-8 text-[#424242]" strokeWidth={1.5} />
                      </motion.div>
                    )}

                    {selected !== "great" && (
                      <div className="text-4xl mb-4">
                        {OPTIONS.find((o) => o.id === selected)?.emoji ?? "🙏"}
                      </div>
                    )}

                    <h3 className="text-base font-heading font-bold text-black uppercase m-0">
                      Thank you!
                    </h3>
                    <p className="text-[10px] text-[#9E9E9E] m-0 mt-1">धन्यवाद!</p>

                    <p className="text-xs text-[#424242] m-0 mt-2 max-w-[260px] mx-auto">
                      {selected === "great"
                        ? "We're so happy for you! 🎉 Your success story inspires others."
                        : "Your feedback helps us improve matching for everyone."}
                    </p>

                    <button
                      onClick={onClose}
                      className={cn(
                        "mt-4 px-8 py-2.5",
                        "border-[3px] border-black bg-black text-white",
                        "shadow-[4px_4px_0px_#000000]",
                        "text-xs font-heading font-bold uppercase tracking-wider cursor-pointer",
                        "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000]",
                        "transition-[transform,box-shadow] duration-150",
                      )}
                    >
                      Done
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default SuccessTrackerModal;
