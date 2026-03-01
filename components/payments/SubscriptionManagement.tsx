/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Subscription Management Panel
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Shows current subscription status and provides:
 *   • Plan details + pricing
 *   • Days remaining
 *   • Cancel subscription
 *   • Request refund (if eligible)
 *   • Change plan (upgrade/downgrade)
 *   • Billing history
 *
 * Used in: Settings → Premium section
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useCallback } from "react";
import {
  Crown,
  Calendar,
  CreditCard,
  AlertTriangle,
  ChevronRight,
  X,
  RotateCcw,
  Shield,
  Clock,
  Check,
} from "lucide-react";
import {
  type Subscription,
  getSubscriptionSummary,
  checkRefundEligibility,
  cancelSubscription,
  type SubscriptionSummary,
} from "@/lib/payments/subscription-service";
import { type PlanId, PLANS, formatINR } from "@/lib/payments/pricing";

// ─── Types ───────────────────────────────────────────────────────────────

interface SubscriptionManagementProps {
  /** Current subscription (null if free user) */
  subscription: Subscription | null;
  /** Callback when user upgrades */
  onUpgrade: () => void;
  /** Callback when subscription changes (cancel, refund) */
  onSubscriptionChange: (updated: Subscription) => void;
  language?: "en" | "hi";
  className?: string;
}

// ─── Strings ─────────────────────────────────────────────────────────────

const S = {
  en: {
    title: "Subscription",
    plan: "Plan",
    status: "Status",
    nextBilling: "Next billing",
    daysRemaining: "days remaining",
    upgrade: "Upgrade Plan",
    changePlan: "Change Plan",
    cancelSubscription: "Cancel Subscription",
    requestRefund: "Request Refund",
    cancelConfirmTitle: "Cancel your subscription?",
    cancelConfirmBody:
      "Your Premium features will remain active until the end of your current billing period. After that, your account will revert to the Free plan.",
    cancelConfirmButton: "Yes, Cancel",
    cancelKeep: "Keep Premium",
    cancelReasonPrompt: "Why are you cancelling?",
    cancelReasonPlaceholder: "Optional feedback...",
    refundNote: "Refund eligibility",
    billingHistory: "Billing History",
    noBillingHistory: "No billing history yet",
    freeUserNote: "You are on the Free plan",
    freeUserCta: "Upgrade to Premium for unlimited access",
    trialBanner: "Free trial active",
    trialDaysLeft: "days left in trial",
    pastDueBanner: "Payment due",
    pastDueMessage: "Please update your payment to avoid losing Premium features.",
    cancelledBanner: "Subscription cancelled",
    cancelledMessage: "Your Premium features are active until",
  },
  hi: {
    title: "सदस्यता",
    plan: "योजना",
    status: "स्थिति",
    nextBilling: "अगला बिलिंग",
    daysRemaining: "दिन शेष",
    upgrade: "योजना अपग्रेड करें",
    changePlan: "योजना बदलें",
    cancelSubscription: "सदस्यता रद्द करें",
    requestRefund: "वापसी का अनुरोध करें",
    cancelConfirmTitle: "अपनी सदस्यता रद्द करें?",
    cancelConfirmBody:
      "आपकी प्रीमियम सुविधाएं आपकी वर्तमान बिलिंग अवधि के अंत तक सक्रिय रहेंगी। उसके बाद, आपका खाता मुफ्त योजना पर वापस आ जाएगा।",
    cancelConfirmButton: "हाँ, रद्द करें",
    cancelKeep: "प्रीमियम रखें",
    cancelReasonPrompt: "आप क्यों रद्द कर रहे हैं?",
    cancelReasonPlaceholder: "वैकल्पिक प्रतिक्रिया...",
    refundNote: "वापसी पात्रता",
    billingHistory: "बिलिंग इतिहास",
    noBillingHistory: "अभी तक कोई बिलिंग इतिहास नहीं",
    freeUserNote: "आप मुफ्त योजना पर हैं",
    freeUserCta: "असीमित एक्सेस के लिए प्रीमियम में अपग्रेड करें",
    trialBanner: "फ्री ट्रायल सक्रिय",
    trialDaysLeft: "दिन ट्रायल में शेष",
    pastDueBanner: "भुगतान बकाया",
    pastDueMessage: "प्रीमियम सुविधाएं खोने से बचने के लिए अपना भुगतान अपडेट करें।",
    cancelledBanner: "सदस्यता रद्द",
    cancelledMessage: "आपकी प्रीमियम सुविधाएं तक सक्रिय हैं",
  },
} as const;

// ─── Component ───────────────────────────────────────────────────────────

export function SubscriptionManagement({
  subscription,
  onUpgrade,
  onSubscriptionChange,
  language = "en",
  className = "",
}: SubscriptionManagementProps) {
  const t = S[language];
  const isHi = language === "hi";

  const summary = getSubscriptionSummary(subscription, language);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const refundCheck = subscription
    ? checkRefundEligibility(subscription)
    : null;

  const handleCancel = useCallback(() => {
    if (!subscription) return;
    const updated = cancelSubscription(subscription, cancelReason);
    onSubscriptionChange(updated);
    setShowCancelConfirm(false);
  }, [subscription, cancelReason, onSubscriptionChange]);

  // ── Free User ──
  if (!summary.isActive && !summary.isCancelling) {
    return (
      <div className={className}>
        <div className="border-[2px] border-black shadow-[4px_4px_0px_#000] bg-white">
          <div className="border-b-[2px] border-black bg-[#212121] text-white px-4 py-2.5 flex items-center gap-2">
            <Crown size={14} strokeWidth={3} />
            <h3 className="text-[11px] font-bold uppercase tracking-wider">{t.title}</h3>
          </div>
          <div className="p-4 text-center space-y-3">
            <p className="text-xs font-bold text-[#212121]">{t.freeUserNote}</p>
            <p className="text-[10px] text-[#9E9E9E]">{t.freeUserCta}</p>
            <button
              onClick={onUpgrade}
              className="flex items-center justify-center gap-1.5 mx-auto border-[3px] border-black bg-black text-white px-6 py-2.5 text-[10px] font-bold uppercase tracking-wider shadow-[3px_3px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000] transition-all"
            >
              <Crown size={12} strokeWidth={3} />
              {t.upgrade}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Active / Trialing / Cancelled ──
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Status Banner */}
      {summary.isTrialing && (
        <div className="border-[2px] border-black bg-[#F8F8F8] p-3 flex items-center gap-2">
          <Clock size={14} strokeWidth={3} className="text-black flex-shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-black">{t.trialBanner}</p>
            <p className="text-[9px] text-[#9E9E9E]">
              {summary.daysRemaining} {t.trialDaysLeft}
            </p>
          </div>
        </div>
      )}

      {summary.isCancelling && (
        <div className="border-[2px] border-black bg-[#F8F8F8] p-3 flex items-center gap-2">
          <AlertTriangle size={14} strokeWidth={3} className="text-black flex-shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-black">{t.cancelledBanner}</p>
            <p className="text-[9px] text-[#9E9E9E]">
              {t.cancelledMessage} {summary.nextBillingDisplay}
            </p>
          </div>
        </div>
      )}

      {/* Plan Card */}
      <div className="border-[2px] border-black shadow-[4px_4px_0px_#000] bg-white">
        <div className="border-b-[2px] border-black bg-[#212121] text-white px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown size={14} strokeWidth={3} />
            <h3 className="text-[11px] font-bold uppercase tracking-wider">{t.title}</h3>
          </div>
          <span className="text-[8px] font-bold border border-white px-1.5 py-0.5">
            {summary.statusLabel}
          </span>
        </div>

        <div className="p-4 space-y-3">
          {/* Plan details */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#212121]">{summary.planName}</p>
              <p className="text-[10px] text-[#9E9E9E]">{summary.priceDisplay}{subscription?.cycle === "yearly" ? (isHi ? "/वर्ष" : "/year") : (isHi ? "/माह" : "/month")}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-[#212121]">
                {summary.daysRemaining} {t.daysRemaining}
              </p>
              {summary.nextBillingDisplay && !summary.isCancelling && (
                <p className="text-[9px] text-[#9E9E9E]">
                  {t.nextBilling}: {summary.nextBillingDisplay}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-dashed border-[#E0E0E0] pt-3 space-y-2">
            {!summary.isCancelling && (
              <button
                onClick={onUpgrade}
                className="w-full flex items-center justify-between border-[2px] border-black px-3 py-2 text-[10px] font-bold uppercase tracking-wider hover:bg-[#F8F8F8] transition-colors"
              >
                {t.changePlan}
                <ChevronRight size={12} strokeWidth={3} />
              </button>
            )}

            {/* Refund */}
            {refundCheck?.eligible && (
              <div className="border-[2px] border-dashed border-[#E0E0E0] p-2">
                <p className="text-[9px] text-[#9E9E9E]">
                  {t.refundNote}: {isHi ? refundCheck.reasonHi : refundCheck.reason}
                </p>
                <button className="mt-1 text-[9px] font-bold text-black underline">
                  {t.requestRefund}
                </button>
              </div>
            )}

            {/* Cancel */}
            {!summary.isCancelling && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="w-full text-center text-[9px] text-[#9E9E9E] hover:text-black transition-colors py-1"
              >
                {t.cancelSubscription}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowCancelConfirm(false)} />
          <div className="relative bg-white border-[3px] border-black shadow-[8px_8px_0px_#000] w-full max-w-sm">
            <div className="border-b-[2px] border-black bg-[#212121] text-white px-4 py-2.5 flex items-center justify-between">
              <h3 className="text-[11px] font-bold uppercase tracking-wider">{t.cancelConfirmTitle}</h3>
              <button onClick={() => setShowCancelConfirm(false)} className="p-1 hover:opacity-70">
                <X size={14} strokeWidth={3} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-[10px] text-[#424242] leading-relaxed">{t.cancelConfirmBody}</p>

              <div>
                <label className="block text-[9px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-1">
                  {t.cancelReasonPrompt}
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value.slice(0, 300))}
                  placeholder={t.cancelReasonPlaceholder}
                  className="w-full border-[2px] border-black p-2 text-xs text-[#212121] placeholder:text-[#E0E0E0] placeholder:italic resize-none focus:outline-none focus:shadow-[0_0_0_3px_#fff,0_0_0_6px_#000]"
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 border-[3px] border-black bg-black text-white px-3 py-2 text-[10px] font-bold uppercase tracking-wider shadow-[3px_3px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000] transition-all"
                >
                  {t.cancelKeep}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 border-[2px] border-black px-3 py-2 text-[10px] font-bold uppercase tracking-wider hover:bg-[#F8F8F8] transition-colors"
                >
                  {t.cancelConfirmButton}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubscriptionManagement;
