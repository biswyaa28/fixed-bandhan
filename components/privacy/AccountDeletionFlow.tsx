/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Account Deletion Flow (DPDP Act 2023 §12)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Multi-step modal for account deletion:
 *   Step 1 → Why are you leaving? (optional feedback)
 *   Step 2 → What will be deleted (full plan)
 *   Step 3 → Confirm with "DELETE" text input
 *   Step 4 → 30-day cooling-off notice + confirmation
 *
 * Comic book aesthetic: thick borders, hard shadows, monochromatic.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useCallback } from "react";
import {
  X,
  AlertTriangle,
  Trash2,
  Clock,
  ChevronRight,
  CheckCircle2,
  Shield,
  Download,
} from "lucide-react";
import {
  createDeletionRequest,
  getDeletionPlan,
  DELETION_REASONS,
  COOLING_OFF_DAYS,
  type DeletionReason,
  type DeletionStep,
} from "@/lib/privacy/data-deletion";

// ─── Types ───────────────────────────────────────────────────────────────

interface AccountDeletionFlowProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  /** Callback when deletion is confirmed (caller handles Firestore + Auth) */
  onConfirmDeletion: (request: ReturnType<typeof createDeletionRequest>) => void;
  /** Callback to trigger data export before deletion */
  onExportData?: () => void;
  language?: "en" | "hi";
}

type Step = "reason" | "plan" | "confirm" | "done";

// ─── Strings ─────────────────────────────────────────────────────────────

const STRINGS = {
  en: {
    headerReason: "We're sorry to see you go",
    headerPlan: "What will happen to your data",
    headerConfirm: "Confirm Account Deletion",
    headerDone: "Deletion Requested",
    reasonPrompt: "Would you tell us why? (Optional)",
    feedbackPlaceholder: "Any additional feedback...",
    skip: "Skip",
    next: "Next",
    back: "Back",
    deletionPlanTitle: "Data Deletion Plan",
    willDelete: "WILL BE DELETED",
    willRetain: "LEGALLY RETAINED",
    retainedBecause: "Why:",
    confirmWarning:
      "This action cannot be undone after the 30-day cooling-off period. " +
      "During the cooling-off period, you can reactivate your account by simply logging in.",
    confirmInstructions: "Type DELETE to confirm",
    confirmPlaceholder: "Type DELETE here",
    confirmButton: "Delete My Account",
    exportFirst: "Export My Data First",
    coolingOff:
      "Your account has been deactivated. Data will be permanently deleted after 30 days.",
    coolingOffDays: `${COOLING_OFF_DAYS}-day cooling-off period`,
    reactivateNote:
      "You can reactivate your account at any time during the cooling-off period by logging in.",
    doneButton: "Close",
    immediate: "Effective immediately:",
    immediateList: "Profile hidden from discovery • Matches suspended • Cannot send messages",
  },
  hi: {
    headerReason: "हमें खेद है कि आप जा रहे हैं",
    headerPlan: "आपके डेटा का क्या होगा",
    headerConfirm: "खाता हटाने की पुष्टि करें",
    headerDone: "हटाने का अनुरोध किया गया",
    reasonPrompt: "क्या आप बताएंगे क्यों? (वैकल्पिक)",
    feedbackPlaceholder: "कोई अतिरिक्त प्रतिक्रिया...",
    skip: "छोड़ें",
    next: "अगला",
    back: "वापस",
    deletionPlanTitle: "डेटा हटाने की योजना",
    willDelete: "हटाया जाएगा",
    willRetain: "कानूनी रूप से बनाए रखा जाएगा",
    retainedBecause: "कारण:",
    confirmWarning:
      "30-दिन की कूलिंग-ऑफ अवधि के बाद यह कार्रवाई पूर्ववत नहीं की जा सकती। " +
      "कूलिंग-ऑफ अवधि के दौरान, आप बस लॉग इन करके अपना खाता पुनः सक्रिय कर सकते हैं।",
    confirmInstructions: "पुष्टि के लिए DELETE टाइप करें",
    confirmPlaceholder: "यहाँ DELETE टाइप करें",
    confirmButton: "मेरा खाता हटाएं",
    exportFirst: "पहले मेरा डेटा निर्यात करें",
    coolingOff:
      "आपका खाता निष्क्रिय कर दिया गया है। 30 दिनों के बाद डेटा स्थायी रूप से हटाया जाएगा।",
    coolingOffDays: `${COOLING_OFF_DAYS}-दिन की कूलिंग-ऑफ अवधि`,
    reactivateNote:
      "आप कूलिंग-ऑफ अवधि के दौरान किसी भी समय लॉग इन करके अपना खाता पुनः सक्रिय कर सकते हैं।",
    doneButton: "बंद करें",
    immediate: "तुरंत प्रभावी:",
    immediateList: "प्रोफ़ाइल डिस्कवरी से छिपाई गई • मैच निलंबित • संदेश नहीं भेज सकते",
  },
} as const;

// ─── Component ───────────────────────────────────────────────────────────

export function AccountDeletionFlow({
  isOpen,
  onClose,
  userId,
  onConfirmDeletion,
  onExportData,
  language = "en",
}: AccountDeletionFlowProps) {
  const t = STRINGS[language];
  const isHi = language === "hi";

  const [step, setStep] = useState<Step>("reason");
  const [selectedReason, setSelectedReason] = useState<DeletionReason | null>(null);
  const [feedback, setFeedback] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [plan] = useState<DeletionStep[]>(getDeletionPlan());

  const reset = useCallback(() => {
    setStep("reason");
    setSelectedReason(null);
    setFeedback("");
    setConfirmText("");
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleConfirm = useCallback(() => {
    if (confirmText.toUpperCase() !== "DELETE") return;
    const request = createDeletionRequest(userId, selectedReason, feedback || null);
    onConfirmDeletion(request);
    setStep("done");
  }, [confirmText, userId, selectedReason, feedback, onConfirmDeletion]);

  if (!isOpen) return null;

  const deletedItems = plan.filter((p) => p.status !== "retained");
  const retainedItems = plan.filter((p) => p.status === "retained");

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80" onClick={handleClose} aria-hidden />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg bg-white border-[3px] border-black shadow-[8px_8px_0px_#000] mx-4 max-h-[90vh] overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="deletion-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-[3px] border-black bg-[#212121] px-4 py-3">
          <h2 id="deletion-title" className="text-sm font-bold text-white uppercase tracking-wider">
            {step === "reason" && t.headerReason}
            {step === "plan" && t.headerPlan}
            {step === "confirm" && t.headerConfirm}
            {step === "done" && t.headerDone}
          </h2>
          <button onClick={handleClose} className="p-1 text-white hover:opacity-70" aria-label="Close">
            <X size={18} strokeWidth={3} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-4">

          {/* ── Step 1: Reason ── */}
          {step === "reason" && (
            <div className="space-y-3">
              <p className="text-xs text-[#424242]">{t.reasonPrompt}</p>

              <div className="space-y-2">
                {DELETION_REASONS.map(({ id, label, labelHi }) => (
                  <button
                    key={id}
                    onClick={() => setSelectedReason(id)}
                    className={`w-full text-left border-[2px] border-black p-3 text-xs font-bold transition-colors ${
                      selectedReason === id
                        ? "bg-black text-white"
                        : "bg-white text-black hover:bg-[#F8F8F8]"
                    }`}
                  >
                    {isHi ? labelHi : label}
                  </button>
                ))}
              </div>

              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value.slice(0, 500))}
                placeholder={t.feedbackPlaceholder}
                className="w-full border-[2px] border-black p-3 text-xs text-[#212121] placeholder:text-[#9E9E9E] placeholder:italic resize-none focus:outline-none focus:shadow-[0_0_0_3px_#fff,0_0_0_6px_#000]"
                rows={3}
                maxLength={500}
              />
            </div>
          )}

          {/* ── Step 2: Deletion Plan ── */}
          {step === "plan" && (
            <div className="space-y-4">
              {/* Items to be deleted */}
              <div>
                <p className="text-[9px] font-bold text-black uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Trash2 size={10} strokeWidth={3} />
                  {t.willDelete}
                </p>
                <div className="border-[2px] border-black">
                  {deletedItems.map((item, i) => (
                    <div
                      key={item.id}
                      className={`px-3 py-2 ${i < deletedItems.length - 1 ? "border-b border-dashed border-[#E0E0E0]" : ""}`}
                    >
                      <p className="text-[11px] font-bold text-[#212121]">
                        {isHi ? item.labelHi : item.label}
                      </p>
                      <p className="text-[9px] text-[#9E9E9E]">
                        {isHi ? item.descriptionHi : item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Items legally retained */}
              <div>
                <p className="text-[9px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Shield size={10} strokeWidth={3} />
                  {t.willRetain}
                </p>
                <div className="border-[2px] border-dashed border-[#E0E0E0]">
                  {retainedItems.map((item, i) => (
                    <div
                      key={item.id}
                      className={`px-3 py-2 ${i < retainedItems.length - 1 ? "border-b border-dashed border-[#E0E0E0]" : ""}`}
                    >
                      <p className="text-[11px] font-bold text-[#9E9E9E]">
                        {isHi ? item.labelHi : item.label}
                      </p>
                      <p className="text-[9px] text-[#9E9E9E]">
                        {isHi ? item.descriptionHi : item.description}
                      </p>
                      {item.retentionReason && (
                        <p className="text-[8px] text-[#9E9E9E] mt-0.5">
                          {t.retainedBecause} {isHi ? item.retentionReasonHi : item.retentionReason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Confirm ── */}
          {step === "confirm" && (
            <div className="space-y-4">
              {/* Warning */}
              <div className="border-[2px] border-black bg-[#F8F8F8] p-3 flex items-start gap-2">
                <AlertTriangle size={16} strokeWidth={3} className="text-black flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] text-[#212121] leading-relaxed">{t.confirmWarning}</p>
                  <p className="text-[10px] font-bold text-[#212121] mt-2 flex items-center gap-1.5">
                    <Clock size={10} strokeWidth={3} />
                    {t.coolingOffDays}
                  </p>
                </div>
              </div>

              {/* Export button */}
              {onExportData && (
                <button
                  onClick={onExportData}
                  className="w-full flex items-center justify-center gap-1.5 border-[2px] border-black px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider hover:bg-[#F8F8F8] transition-colors"
                >
                  <Download size={12} strokeWidth={3} />
                  {t.exportFirst}
                </button>
              )}

              {/* Confirm input */}
              <div>
                <label className="block text-[10px] font-bold text-[#212121] uppercase tracking-wider mb-2">
                  {t.confirmInstructions}
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={t.confirmPlaceholder}
                  className="w-full border-[2px] border-black p-3 text-sm font-bold text-[#212121] text-center tracking-widest placeholder:text-[#E0E0E0] placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:shadow-[0_0_0_3px_#fff,0_0_0_6px_#000]"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>

              {/* Delete button */}
              <button
                onClick={handleConfirm}
                disabled={confirmText.toUpperCase() !== "DELETE"}
                className="w-full flex items-center justify-center gap-1.5 border-[3px] border-black bg-black text-white px-4 py-3 text-xs font-bold uppercase tracking-wider shadow-[4px_4px_0px_#000] transition-all disabled:opacity-30 disabled:cursor-not-allowed enabled:hover:translate-x-[2px] enabled:hover:translate-y-[2px] enabled:hover:shadow-[2px_2px_0px_#000]"
              >
                <Trash2 size={14} strokeWidth={3} />
                {t.confirmButton}
              </button>
            </div>
          )}

          {/* ── Step 4: Done ── */}
          {step === "done" && (
            <div className="text-center py-6 space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 border-[3px] border-black shadow-[4px_4px_0px_#000]">
                <CheckCircle2 size={24} strokeWidth={3} className="text-black" />
              </div>

              <div>
                <h3 className="text-sm font-bold text-black">{t.headerDone}</h3>
                <p className="text-xs text-[#424242] mt-2 leading-relaxed">{t.coolingOff}</p>
              </div>

              <div className="border-[2px] border-black bg-[#F8F8F8] p-3 text-left">
                <p className="text-[10px] font-bold text-[#212121] flex items-center gap-1.5">
                  <Clock size={10} strokeWidth={3} />
                  {t.coolingOffDays}
                </p>
                <p className="text-[10px] text-[#9E9E9E] mt-1">{t.reactivateNote}</p>
              </div>

              <div className="border-[2px] border-dashed border-[#E0E0E0] p-3 text-left">
                <p className="text-[9px] font-bold text-[#9E9E9E] uppercase tracking-wider">{t.immediate}</p>
                <p className="text-[10px] text-[#9E9E9E] mt-1">{t.immediateList}</p>
              </div>

              <button
                onClick={handleClose}
                className="w-full border-[2px] border-black px-4 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#F8F8F8] transition-colors"
              >
                {t.doneButton}
              </button>
            </div>
          )}
        </div>

        {/* Footer navigation (Steps 1–3) */}
        {step !== "done" && (
          <div className="border-t-[2px] border-dashed border-black p-4 flex gap-3">
            {step === "reason" && (
              <>
                <button
                  onClick={() => setStep("plan")}
                  className="flex-1 border-[2px] border-black px-3 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#F8F8F8] transition-colors"
                >
                  {t.skip}
                </button>
                <button
                  onClick={() => setStep("plan")}
                  className="flex-1 flex items-center justify-center gap-1.5 border-[3px] border-black bg-black text-white px-3 py-2 text-xs font-bold uppercase tracking-wider shadow-[3px_3px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000] transition-all"
                >
                  {t.next}
                  <ChevronRight size={12} strokeWidth={3} />
                </button>
              </>
            )}
            {step === "plan" && (
              <>
                <button
                  onClick={() => setStep("reason")}
                  className="flex-1 border-[2px] border-black px-3 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#F8F8F8] transition-colors"
                >
                  {t.back}
                </button>
                <button
                  onClick={() => setStep("confirm")}
                  className="flex-1 flex items-center justify-center gap-1.5 border-[3px] border-black bg-black text-white px-3 py-2 text-xs font-bold uppercase tracking-wider shadow-[3px_3px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000] transition-all"
                >
                  {t.next}
                  <ChevronRight size={12} strokeWidth={3} />
                </button>
              </>
            )}
            {step === "confirm" && (
              <button
                onClick={() => setStep("plan")}
                className="flex-1 border-[2px] border-black px-3 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#F8F8F8] transition-colors"
              >
                {t.back}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AccountDeletionFlow;
