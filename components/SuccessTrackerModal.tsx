/**
 * Bandhan AI — Success Tracker Modal (Hinge "We Met")
 * Appears after 7 days of chatting to track real-world meetings.
 */
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) { return twMerge(clsx(c)); }

export type MeetingStatus = "great" | "not-compatible" | "planning" | "no";

export interface SuccessTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchName: string;
  matchId: string;
  onSubmit?: (matchId: string, status: MeetingStatus, comment: string) => void;
  language?: "en" | "hi";
}

const OPTIONS: { id: MeetingStatus; emoji: string; labelEn: string; labelHi: string; color: string }[] = [
  { id: "great", emoji: "🎉", labelEn: "Yes, it went great!", labelHi: "हाँ, बहुत अच्छा रहा!", color: "hover:bg-[#F8F8F8]" },
  { id: "not-compatible", emoji: "🤷", labelEn: "Yes, but not compatible", labelHi: "हाँ, लेकिन मेल नहीं", color: "hover:bg-[#F8F8F8]" },
  { id: "planning", emoji: "📅", labelEn: "Not yet, but planning to", labelHi: "अभी नहीं, पर मिलेंगे", color: "hover:bg-[#F8F8F8]" },
  { id: "no", emoji: "✋", labelEn: "No, and won't meet", labelHi: "नहीं, और नहीं मिलेंगे", color: "hover:bg-[#F8F8F8]" },
];

export function SuccessTrackerModal({
  isOpen,
  onClose,
  matchName,
  matchId,
  onSubmit,
  language = "en",
}: SuccessTrackerModalProps) {
  const [step, setStep] = useState<"question" | "comment" | "done">("question");
  const [selected, setSelected] = useState<MeetingStatus | null>(null);
  const [comment, setComment] = useState("");

  const handleSelect = (status: MeetingStatus) => {
    setSelected(status);
    setStep("comment");
  };

  const handleSubmit = () => {
    if (selected) onSubmit?.(matchId, selected, comment);
    setStep("done");
  };

  const handleClose = () => {
    setStep("question");
    setSelected(null);
    setComment("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80"
            style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "8px 8px" }}
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            className="relative w-[90%] max-w-[400px] bg-white border-4 border-black shadow-[8px_8px_0px_#000000] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 bg-black text-white">
              <span className="text-xs font-heading font-bold uppercase tracking-wider">
                {language === "en" ? "Success Tracker" : "सफलता ट्रैकर"}
              </span>
              <button onClick={handleClose} className="w-6 h-6 bg-white text-black flex items-center justify-center cursor-pointer" aria-label="Close">
                <X className="w-3.5 h-3.5" strokeWidth={3} />
              </button>
            </div>

            <div className="px-6 py-6">
              {/* Step: Question */}
              {step === "question" && (
                <div>
                  <p className="text-sm font-bold text-black m-0 mb-1">
                    {language === "en"
                      ? `Did you meet ${matchName} in real life?`
                      : `क्या आप ${matchName} से असल ज़िंदगी में मिले?`}
                  </p>
                  <p className="text-xs text-[#9E9E9E] m-0 mb-4">
                    {language === "en"
                      ? "Your feedback helps improve matches for everyone"
                      : "आपकी प्रतिक्रिया सभी के लिए मैच बेहतर बनाती है"}
                  </p>

                  <div className="space-y-2">
                    {OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => handleSelect(opt.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 text-left",
                          "border-2 border-black bg-white cursor-pointer",
                          "shadow-[2px_2px_0px_#000000]",
                          "hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000]",
                          "transition-[transform,box-shadow] duration-150",
                        )}
                      >
                        <span className="text-xl leading-none">{opt.emoji}</span>
                        <span className="text-xs font-heading font-bold text-black uppercase">
                          {language === "en" ? opt.labelEn : opt.labelHi}
                        </span>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleClose}
                    className="w-full mt-3 text-[10px] font-heading font-bold uppercase text-[#9E9E9E] bg-transparent border-none cursor-pointer hover:text-black"
                  >
                    {language === "en" ? "Skip for now" : "अभी छोड़ें"}
                  </button>
                </div>
              )}

              {/* Step: Comment */}
              {step === "comment" && (
                <div>
                  <p className="text-sm font-bold text-black m-0 mb-3">
                    {language === "en" ? "Want to share more?" : "कुछ और बताना चाहेंगे?"}
                  </p>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value.slice(0, 200))}
                    placeholder={language === "en" ? "Optional: How did it go?" : "वैकल्पिक: कैसा रहा?"}
                    className="w-full min-h-[80px] p-3 border-2 border-black text-sm text-[#212121] placeholder:text-[#9E9E9E] placeholder:italic outline-none focus:shadow-[0_0_0_3px_#FFFFFF,0_0_0_6px_#000000] resize-none"
                    maxLength={200}
                  />
                  <div className="flex items-center gap-2 mt-3">
                    <button onClick={() => setStep("question")} className="flex-1 py-2.5 border-2 border-black text-xs font-heading font-bold uppercase cursor-pointer hover:bg-[#F8F8F8]">
                      {language === "en" ? "Back" : "वापस"}
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="flex-1 py-2.5 border-[3px] border-black bg-black text-white text-xs font-heading font-bold uppercase cursor-pointer shadow-[4px_4px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000] transition-[transform,box-shadow] duration-150"
                    >
                      {language === "en" ? "Submit" : "जमा करें"}
                    </button>
                  </div>
                </div>
              )}

              {/* Step: Done */}
              {step === "done" && (
                <div className="text-center py-4">
                  {selected === "great" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-16 h-16 mx-auto mb-4 bg-[#F8F8F8] border-2 border-black flex items-center justify-center"
                    >
                      <Sparkles className="w-8 h-8 text-[#424242]" strokeWidth={1.5} />
                    </motion.div>
                  )}
                  <p className="text-sm font-heading font-bold text-black uppercase m-0">
                    {language === "en" ? "Thank you!" : "धन्यवाद!"}
                  </p>
                  <p className="text-xs text-[#9E9E9E] m-0 mt-2">
                    {selected === "great"
                      ? (language === "en" ? "We're so happy for you! 🎉" : "हम आपके लिए बहुत खुश हैं! 🎉")
                      : (language === "en" ? "Your feedback helps us improve." : "आपकी प्रतिक्रिया हमें सुधारने में मदद करती है।")}
                  </p>
                  <button onClick={handleClose} className="mt-4 px-6 py-2.5 border-[3px] border-black bg-black text-white text-xs font-heading font-bold uppercase cursor-pointer">
                    {language === "en" ? "Done" : "हो गया"}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default SuccessTrackerModal;
