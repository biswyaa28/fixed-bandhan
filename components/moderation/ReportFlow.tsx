/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Report Flow (Enhanced In-App Reporting)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Multi-step reporting flow:
 *   Step 1: Select reason (with icons)
 *   Step 2: Add details + optional evidence
 *   Step 3: Confirm + submit
 *   Step 4: Success screen with next actions (block/hide)
 *
 * Also handles: Block user, Hide profile, Undo actions.
 * Comic book aesthetic: thick borders, hard shadows, monochromatic.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useCallback } from "react";
import {
  X,
  Flag,
  ShieldOff,
  EyeOff,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Undo2,
  Baby,
  User,
  MessageSquareWarning,
  Ban,
  CircleDollarSign,
  HelpCircle,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────

export type ReportReason =
  | "fake-profile"
  | "harassment"
  | "spam"
  | "inappropriate-content"
  | "underage"
  | "scam"
  | "other";

export interface ReportFlowProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userId: string;
  onReport: (data: {
    reason: ReportReason;
    comment: string;
    evidenceUrls: string[];
  }) => void;
  onBlock?: (userId: string) => void;
  onHide?: (userId: string) => void;
  language?: "en" | "hi";
}

type Step = "actions" | "reason" | "details" | "submitting" | "done";

// ─── Reason config ───────────────────────────────────────────────────────

const REASONS: {
  id: ReportReason;
  label: string;
  labelHi: string;
  description: string;
  descriptionHi: string;
  Icon: typeof Flag;
}[] = [
  {
    id: "fake-profile",
    label: "Fake Profile",
    labelHi: "नकली प्रोफ़ाइल",
    description: "Stolen photos, wrong identity, impersonation",
    descriptionHi: "चुराई गई तस्वीरें, गलत पहचान",
    Icon: User,
  },
  {
    id: "harassment",
    label: "Harassment",
    labelHi: "उत्पीड़न",
    description: "Threats, stalking, bullying, intimidation",
    descriptionHi: "धमकी, पीछा करना, डराना",
    Icon: MessageSquareWarning,
  },
  {
    id: "spam",
    label: "Spam / Scam",
    labelHi: "स्पैम / घोटाला",
    description: "Commercial messages, MLM, bot activity",
    descriptionHi: "व्यावसायिक संदेश, बॉट गतिविधि",
    Icon: Ban,
  },
  {
    id: "inappropriate-content",
    label: "Inappropriate Content",
    labelHi: "अनुचित सामग्री",
    description: "Explicit photos, offensive text, hate speech",
    descriptionHi: "अश्लील तस्वीरें, आपत्तिजनक भाषा",
    Icon: AlertTriangle,
  },
  {
    id: "underage",
    label: "Underage User",
    labelHi: "कम उम्र का उपयोगकर्ता",
    description: "Person appears to be under 18 years old",
    descriptionHi: "व्यक्ति 18 वर्ष से कम आयु का प्रतीत होता है",
    Icon: Baby,
  },
  {
    id: "scam",
    label: "Financial Scam",
    labelHi: "वित्तीय धोखाधड़ी",
    description: "Asking for money, UPI fraud, blackmail",
    descriptionHi: "पैसे माँगना, UPI धोखाधड़ी, ब्लैकमेल",
    Icon: CircleDollarSign,
  },
  {
    id: "other",
    label: "Other",
    labelHi: "अन्य",
    description: "Something else not listed above",
    descriptionHi: "ऊपर सूचीबद्ध नहीं कुछ और",
    Icon: HelpCircle,
  },
];

// ─── Component ───────────────────────────────────────────────────────────

export function ReportFlow({
  isOpen,
  onClose,
  userName,
  userId,
  onReport,
  onBlock,
  onHide,
  language = "en",
}: ReportFlowProps) {
  const [step, setStep] = useState<Step>("actions");
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [comment, setComment] = useState("");
  const [undoAction, setUndoAction] = useState<string | null>(null);
  const [undoTimeout, setUndoTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  const t = language === "hi";

  const reset = useCallback(() => {
    setStep("actions");
    setSelectedReason(null);
    setComment("");
    setUndoAction(null);
    if (undoTimeout) clearTimeout(undoTimeout);
  }, [undoTimeout]);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleBlock = useCallback(() => {
    setUndoAction("block");
    const timeout = setTimeout(() => {
      onBlock?.(userId);
      setUndoAction(null);
    }, 5000);
    setUndoTimeout(timeout);
  }, [userId, onBlock]);

  const handleHide = useCallback(() => {
    setUndoAction("hide");
    const timeout = setTimeout(() => {
      onHide?.(userId);
      setUndoAction(null);
    }, 5000);
    setUndoTimeout(timeout);
  }, [userId, onHide]);

  const handleUndo = useCallback(() => {
    if (undoTimeout) clearTimeout(undoTimeout);
    setUndoAction(null);
  }, [undoTimeout]);

  const handleSubmit = useCallback(() => {
    if (!selectedReason) return;
    setStep("submitting");
    // Simulate async submission (real implementation uses Firestore)
    setTimeout(() => {
      onReport({
        reason: selectedReason,
        comment: comment.trim(),
        evidenceUrls: [],
      });
      setStep("done");
    }, 800);
  }, [selectedReason, comment, onReport]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80"
        onClick={handleClose}
        aria-hidden
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md bg-white border-[3px] border-black shadow-[8px_8px_0px_#000] sm:rounded-none mx-4 mb-0 sm:mb-0 max-h-[85vh] overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-title"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between border-b-[3px] border-black bg-[#212121] px-4 py-3">
          <h2
            id="report-title"
            className="text-sm font-bold text-white uppercase tracking-wider"
          >
            {step === "actions" && (t ? `${userName} के लिए विकल्प` : `Options for ${userName}`)}
            {step === "reason" && (t ? "रिपोर्ट का कारण" : "Report Reason")}
            {step === "details" && (t ? "विवरण जोड़ें" : "Add Details")}
            {step === "submitting" && (t ? "भेज रहा है..." : "Submitting...")}
            {step === "done" && (t ? "रिपोर्ट भेजी गई" : "Report Submitted")}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X size={18} strokeWidth={3} />
          </button>
        </div>

        {/* ── Content ── */}
        <div className="overflow-y-auto flex-1 p-4">
          {/* Step: Actions (Report / Block / Hide) */}
          {step === "actions" && (
            <div className="space-y-3">
              {/* Undo banner */}
              {undoAction && (
                <div className="flex items-center justify-between border-[2px] border-black bg-[#F8F8F8] p-3">
                  <span className="text-xs font-bold text-black uppercase">
                    {undoAction === "block"
                      ? t ? "उपयोगकर्ता ब्लॉक हो रहा है..." : "Blocking user..."
                      : t ? "प्रोफ़ाइल छिपा रहा है..." : "Hiding profile..."}
                  </span>
                  <button
                    onClick={handleUndo}
                    className="flex items-center gap-1 text-xs font-bold border-[2px] border-black px-2 py-1 hover:bg-black hover:text-white transition-colors"
                  >
                    <Undo2 size={12} strokeWidth={3} />
                    {t ? "पूर्ववत करें" : "Undo"}
                  </button>
                </div>
              )}

              {/* Report button */}
              <button
                onClick={() => setStep("reason")}
                className="w-full flex items-center gap-3 border-[2px] border-black p-4 shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] transition-all bg-white text-left"
              >
                <Flag size={20} strokeWidth={2.5} className="text-black flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-black">
                    {t ? "प्रोफ़ाइल रिपोर्ट करें" : "Report Profile"}
                  </p>
                  <p className="text-[10px] text-[#9E9E9E]">
                    {t ? "उल्लंघन की रिपोर्ट करें" : "Report a violation to our team"}
                  </p>
                </div>
                <ChevronRight size={16} strokeWidth={3} className="text-[#9E9E9E]" />
              </button>

              {/* Block button */}
              <button
                onClick={handleBlock}
                disabled={undoAction === "block"}
                className="w-full flex items-center gap-3 border-[2px] border-black p-4 shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] transition-all bg-white text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShieldOff size={20} strokeWidth={2.5} className="text-black flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-black">
                    {t ? "उपयोगकर्ता ब्लॉक करें" : "Block User"}
                  </p>
                  <p className="text-[10px] text-[#9E9E9E]">
                    {t ? "वे आपको नहीं देख या संपर्क कर पाएंगे" : "They won't be able to see or contact you"}
                  </p>
                </div>
              </button>

              {/* Hide button */}
              <button
                onClick={handleHide}
                disabled={undoAction === "hide"}
                className="w-full flex items-center gap-3 border-[2px] border-black p-4 shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] transition-all bg-white text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <EyeOff size={20} strokeWidth={2.5} className="text-black flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-black">
                    {t ? "प्रोफ़ाइल छिपाएं" : "Hide Profile"}
                  </p>
                  <p className="text-[10px] text-[#9E9E9E]">
                    {t ? "इस प्रोफ़ाइल को अपनी फ़ीड से हटाएं" : "Remove from your discovery feed"}
                  </p>
                </div>
              </button>
            </div>
          )}

          {/* Step: Select Reason */}
          {step === "reason" && (
            <div className="space-y-2">
              <p className="text-xs text-[#9E9E9E] mb-3">
                {t
                  ? "आप इस प्रोफ़ाइल की रिपोर्ट क्यों कर रहे हैं?"
                  : "Why are you reporting this profile?"}
              </p>
              {REASONS.map(({ id, label, labelHi, description, descriptionHi, Icon }) => (
                <button
                  key={id}
                  onClick={() => {
                    setSelectedReason(id);
                    setStep("details");
                  }}
                  className="w-full flex items-center gap-3 border-[2px] border-black p-3 hover:bg-[#F8F8F8] transition-colors text-left"
                >
                  <Icon size={18} strokeWidth={2.5} className="text-black flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-black">{t ? labelHi : label}</p>
                    <p className="text-[10px] text-[#9E9E9E] truncate">
                      {t ? descriptionHi : description}
                    </p>
                  </div>
                  <ChevronRight size={14} strokeWidth={3} className="text-[#9E9E9E] flex-shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* Step: Add Details */}
          {step === "details" && (
            <div className="space-y-4">
              <div className="border-[2px] border-black p-3 bg-[#F8F8F8]">
                <p className="text-[10px] font-bold text-black uppercase tracking-wider">
                  {t ? "चयनित कारण" : "Selected Reason"}
                </p>
                <p className="text-xs text-[#424242] mt-1">
                  {t
                    ? REASONS.find((r) => r.id === selectedReason)?.labelHi
                    : REASONS.find((r) => r.id === selectedReason)?.label}
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-2">
                  {t ? "अतिरिक्त विवरण (वैकल्पिक)" : "Additional Details (Optional)"}
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value.slice(0, 500))}
                  placeholder={
                    t
                      ? "क्या हुआ इसका विवरण दें..."
                      : "Describe what happened..."
                  }
                  className="w-full border-[2px] border-black p-3 text-xs text-[#212121] bg-white placeholder:text-[#9E9E9E] placeholder:italic resize-none focus:outline-none focus:shadow-[0_0_0_3px_#fff,0_0_0_6px_#000]"
                  rows={4}
                  maxLength={500}
                />
                <p className="text-[9px] text-[#9E9E9E] text-right mt-1">
                  {comment.length}/500
                </p>
              </div>

              <div className="border-[2px] border-dashed border-[#E0E0E0] p-3">
                <p className="text-[10px] text-[#9E9E9E] text-center">
                  {t
                    ? "आपकी रिपोर्ट गोपनीय रहेगी। रिपोर्ट किए गए उपयोगकर्ता को नहीं पता चलेगा कि किसने रिपोर्ट किया।"
                    : "Your report is confidential. The reported user will not know who reported them."}
                </p>
              </div>
            </div>
          )}

          {/* Step: Submitting */}
          {step === "submitting" && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block border-[3px] border-black w-8 h-8 animate-spin" />
                <p className="text-xs font-bold text-black mt-4">
                  {t ? "रिपोर्ट भेज रहा है..." : "Submitting report..."}
                </p>
              </div>
            </div>
          )}

          {/* Step: Done */}
          {step === "done" && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 border-[3px] border-black shadow-[4px_4px_0px_#000] mb-4">
                <CheckCircle2 size={24} strokeWidth={3} className="text-black" />
              </div>
              <h3 className="text-sm font-bold text-black mb-2">
                {t ? "रिपोर्ट भेज दी गई" : "Report Submitted"}
              </h3>
              <p className="text-xs text-[#9E9E9E] mb-6">
                {t
                  ? "हमारी टीम 36 घंटे के भीतर इसकी समीक्षा करेगी। IT नियम 2021 का अनुपालन।"
                  : "Our team will review within 36 hours. IT Rules 2021 compliant."}
              </p>

              <div className="space-y-2">
                <button
                  onClick={handleBlock}
                  className="w-full flex items-center justify-center gap-2 border-[3px] border-black bg-black text-white px-4 py-3 text-xs font-bold uppercase tracking-wider shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] transition-all"
                >
                  <ShieldOff size={14} strokeWidth={3} />
                  {t ? "ब्लॉक भी करें" : "Also Block User"}
                </button>
                <button
                  onClick={handleClose}
                  className="w-full border-[2px] border-black px-4 py-3 text-xs font-bold uppercase tracking-wider hover:bg-[#F8F8F8] transition-colors"
                >
                  {t ? "बंद करें" : "Done"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer (navigation buttons) ── */}
        {(step === "reason" || step === "details") && (
          <div className="border-t-[2px] border-dashed border-black p-4 flex gap-3">
            <button
              onClick={() => setStep(step === "details" ? "reason" : "actions")}
              className="flex-1 border-[2px] border-black px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#F8F8F8] transition-colors"
            >
              {t ? "वापस" : "Back"}
            </button>
            {step === "details" && (
              <button
                onClick={handleSubmit}
                disabled={!selectedReason}
                className="flex-1 border-[3px] border-black bg-black text-white px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t ? "रिपोर्ट भेजें" : "Submit Report"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportFlow;
