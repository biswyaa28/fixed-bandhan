/**
 * Bandhan AI — Report Modal
 * Smart reporting flow: reason → details → confirm.
 * Also includes Block and Hide options.
 * Comic book style with 8-bit hard shadows.
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Flag, ShieldOff, EyeOff, ChevronRight,
  AlertTriangle, CheckCircle2, Undo2,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

// ─── Types ───────────────────────────────────────────────────────────────
export type ReportReason =
  | "fake-profile"
  | "harassment"
  | "spam"
  | "inappropriate"
  | "underage"
  | "other";

export interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userId: string;
  onReport?: (reason: ReportReason, comment: string) => void;
  onBlock?: (userId: string) => void;
  onHide?: (userId: string) => void;
  language?: "en" | "hi";
}

type Step = "actions" | "reason" | "details" | "done";

const REPORT_REASONS: { id: ReportReason; label: string; labelHi: string; icon: string }[] = [
  { id: "fake-profile", label: "Fake Profile", labelHi: "नकली प्रोफ़ाइल", icon: "👤" },
  { id: "harassment", label: "Harassment", labelHi: "उत्पीड़न", icon: "⚠️" },
  { id: "spam", label: "Spam / Scam", labelHi: "स्पैम / घोटाला", icon: "🚫" },
  { id: "inappropriate", label: "Inappropriate Content", labelHi: "अनुचित सामग्री", icon: "🔞" },
  { id: "underage", label: "Underage User", labelHi: "कम उम्र का उपयोगकर्ता", icon: "👶" },
  { id: "other", label: "Other", labelHi: "अन्य", icon: "📝" },
];

export function ReportModal({
  isOpen,
  onClose,
  userName,
  userId,
  onReport,
  onBlock,
  onHide,
  language = "en",
}: ReportModalProps) {
  const [step, setStep] = useState<Step>("actions");
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [comment, setComment] = useState("");
  const [actionTaken, setActionTaken] = useState<string | null>(null);
  const [undoTimeout, setUndoTimeout] = useState<NodeJS.Timeout | null>(null);

  const reset = () => {
    setStep("actions");
    setSelectedReason(null);
    setComment("");
    setActionTaken(null);
    if (undoTimeout) clearTimeout(undoTimeout);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleBlock = () => {
    setActionTaken("block");
    const timeout = setTimeout(() => {
      onBlock?.(userId);
      setActionTaken(null);
    }, 5000);
    setUndoTimeout(timeout);
  };

  const handleHide = () => {
    setActionTaken("hide");
    const timeout = setTimeout(() => {
      onHide?.(userId);
      setActionTaken(null);
    }, 5000);
    setUndoTimeout(timeout);
  };

  const handleUndo = () => {
    if (undoTimeout) clearTimeout(undoTimeout);
    setActionTaken(null);
  };

  const handleSubmitReport = () => {
    if (selectedReason) {
      onReport?.(selectedReason, comment);
    }
    setStep("done");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-[400px] bg-white border-4 border-black shadow-[8px_8px_0px_#000000] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 bg-black text-white">
              <span className="text-xs font-heading font-bold uppercase tracking-wider">
                {step === "actions" && (language === "en" ? "Actions" : "कार्रवाई")}
                {step === "reason" && (language === "en" ? "Report Profile" : "प्रोफ़ाइल की रिपोर्ट करें")}
                {step === "details" && (language === "en" ? "Tell Us More" : "हमें और बताएं")}
                {step === "done" && (language === "en" ? "Thank You" : "धन्यवाद")}
              </span>
              <button
                onClick={handleClose}
                className="w-6 h-6 bg-white text-black flex items-center justify-center cursor-pointer hover:bg-[#E0E0E0]"
                aria-label="Close"
              >
                <X className="w-3.5 h-3.5" strokeWidth={3} />
              </button>
            </div>

            <div className="px-6 py-4">
              {/* ── Undo Toast ── */}
              <AnimatePresence>
                {actionTaken && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-4 p-3 border-2 border-black bg-[#F8F8F8] flex items-center justify-between"
                  >
                    <span className="text-xs font-bold text-black">
                      {actionTaken === "block" ? `${userName} blocked` : `${userName} hidden`}
                    </span>
                    <button
                      onClick={handleUndo}
                      className="flex items-center gap-1 text-xs font-heading font-bold uppercase text-[#424242] bg-transparent border-none cursor-pointer hover:text-black"
                    >
                      <Undo2 className="w-3 h-3" strokeWidth={2.5} />
                      Undo
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Step: Actions ── */}
              {step === "actions" && (
                <div className="space-y-2">
                  <p className="text-xs text-[#9E9E9E] m-0 mb-3">
                    {language === "en"
                      ? `What would you like to do with ${userName}'s profile?`
                      : `${userName} की प्रोफ़ाइल के साथ आप क्या करना चाहेंगे?`}
                  </p>

                  <button
                    onClick={() => setStep("reason")}
                    className="w-full flex items-center gap-3 p-4 border-2 border-black bg-white text-left cursor-pointer shadow-[2px_2px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000] transition-[transform,box-shadow] duration-150"
                  >
                    <Flag className="w-5 h-5 text-black" strokeWidth={2} />
                    <div className="flex-1">
                      <span className="text-xs font-heading font-bold text-black uppercase">
                        {language === "en" ? "Report Profile" : "प्रोफ़ाइल रिपोर्ट करें"}
                      </span>
                      <p className="text-[10px] text-[#9E9E9E] m-0 mt-0.5">
                        {language === "en" ? "Flag for review by our team" : "हमारी टीम द्वारा समीक्षा के लिए"}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#9E9E9E]" strokeWidth={2} />
                  </button>

                  <button
                    onClick={handleBlock}
                    className="w-full flex items-center gap-3 p-4 border-2 border-black bg-white text-left cursor-pointer shadow-[2px_2px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000] transition-[transform,box-shadow] duration-150"
                  >
                    <ShieldOff className="w-5 h-5 text-black" strokeWidth={2} />
                    <div className="flex-1">
                      <span className="text-xs font-heading font-bold text-black uppercase">
                        {language === "en" ? "Block User" : "उपयोगकर्ता ब्लॉक करें"}
                      </span>
                      <p className="text-[10px] text-[#9E9E9E] m-0 mt-0.5">
                        {language === "en" ? "They won't be able to see or message you" : "वे आपको देख या संदेश नहीं भेज पाएंगे"}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#9E9E9E]" strokeWidth={2} />
                  </button>

                  <button
                    onClick={handleHide}
                    className="w-full flex items-center gap-3 p-4 border-2 border-black bg-white text-left cursor-pointer shadow-[2px_2px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000] transition-[transform,box-shadow] duration-150"
                  >
                    <EyeOff className="w-5 h-5 text-black" strokeWidth={2} />
                    <div className="flex-1">
                      <span className="text-xs font-heading font-bold text-black uppercase">
                        {language === "en" ? "Hide Profile" : "प्रोफ़ाइल छुपाएं"}
                      </span>
                      <p className="text-[10px] text-[#9E9E9E] m-0 mt-0.5">
                        {language === "en" ? "Remove from your discovery feed" : "डिस्कवरी फ़ीड से हटाएं"}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#9E9E9E]" strokeWidth={2} />
                  </button>
                </div>
              )}

              {/* ── Step: Reason ── */}
              {step === "reason" && (
                <div className="space-y-2">
                  <p className="text-xs text-[#9E9E9E] m-0 mb-3">
                    {language === "en" ? "Why are you reporting this profile?" : "आप इस प्रोफ़ाइल की रिपोर्ट क्यों कर रहे हैं?"}
                  </p>

                  {REPORT_REASONS.map((reason) => (
                    <button
                      key={reason.id}
                      onClick={() => {
                        setSelectedReason(reason.id);
                        setStep("details");
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3",
                        "border-2 border-black bg-white text-left cursor-pointer",
                        "shadow-[2px_2px_0px_#000000]",
                        "hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000]",
                        "transition-[transform,box-shadow] duration-150",
                      )}
                    >
                      <span className="text-base leading-none">{reason.icon}</span>
                      <span className="text-xs font-heading font-bold text-black uppercase">
                        {language === "en" ? reason.label : reason.labelHi}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* ── Step: Details ── */}
              {step === "details" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-black" strokeWidth={2.5} />
                    <span className="text-xs font-heading font-bold text-black uppercase">
                      {REPORT_REASONS.find((r) => r.id === selectedReason)?.[language === "en" ? "label" : "labelHi"]}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-heading font-bold text-[#424242] uppercase tracking-wide mb-2">
                      {language === "en" ? "Additional Details (Optional)" : "अतिरिक्त विवरण (वैकल्पिक)"}
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={language === "en" ? "Tell us more about the issue..." : "समस्या के बारे में और बताएं..."}
                      className="w-full min-h-[80px] p-3 border-2 border-black bg-white text-sm text-[#212121] placeholder:text-[#9E9E9E] placeholder:italic outline-none focus:shadow-[0_0_0_3px_#FFFFFF,0_0_0_6px_#000000] resize-y"
                      maxLength={500}
                    />
                    <p className="text-[10px] text-[#9E9E9E] mt-1 m-0">{comment.length}/500</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setStep("reason")}
                      className="flex-1 px-4 py-3 border-2 border-black bg-white text-xs font-heading font-bold uppercase text-[#424242] cursor-pointer hover:bg-[#F8F8F8]"
                    >
                      {language === "en" ? "Back" : "वापस"}
                    </button>
                    <button
                      onClick={handleSubmitReport}
                      className="flex-1 px-4 py-3 border-[3px] border-black bg-black text-white text-xs font-heading font-bold uppercase cursor-pointer shadow-[4px_4px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000] transition-[transform,box-shadow] duration-150"
                    >
                      {language === "en" ? "Submit Report" : "रिपोर्ट भेजें"}
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step: Done ── */}
              {step === "done" && (
                <div className="text-center py-4">
                  <div className="w-12 h-12 mx-auto mb-4 bg-[#F8F8F8] border-2 border-black flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-[#424242]" strokeWidth={2} />
                  </div>
                  <p className="text-sm font-heading font-bold text-black uppercase m-0">
                    {language === "en" ? "Report Submitted" : "रिपोर्ट भेजी गई"}
                  </p>
                  <p className="text-xs text-[#9E9E9E] m-0 mt-2 max-w-[280px] mx-auto leading-normal">
                    {language === "en"
                      ? "Our team will review this within 24 hours. Thank you for helping keep Bandhan safe."
                      : "हमारी टीम 24 घंटे के भीतर इसकी समीक्षा करेगी। Bandhan को सुरक्षित रखने में मदद के लिए धन्यवाद।"}
                  </p>
                  <button
                    onClick={handleClose}
                    className="mt-4 px-6 py-3 border-[3px] border-black bg-black text-white text-xs font-heading font-bold uppercase cursor-pointer shadow-[4px_4px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000] transition-[transform,box-shadow] duration-150"
                  >
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

export default ReportModal;
