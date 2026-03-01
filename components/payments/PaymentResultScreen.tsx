/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Payment Result Screen (Success / Failure)
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import {
  CheckCircle2,
  XCircle,
  Crown,
  ChevronRight,
  RotateCcw,
  Phone,
} from "lucide-react";
import { type PlanId, PLANS } from "@/lib/payments/pricing";

interface PaymentResultScreenProps {
  success: boolean;
  planId: PlanId;
  onDone: () => void;
  onRetry: () => void;
  language?: "en" | "hi";
}

const S = {
  en: {
    successTitle: "Welcome to Premium!",
    successSubtitle: "Your upgrade is active. Start exploring unlimited features.",
    trialTitle: "Your Free Trial Has Started!",
    trialSubtitle: "Enjoy 7 days of Premium features at no charge. Cancel anytime.",
    failTitle: "Payment Failed",
    failSubtitle: "Don't worry — no money was deducted. Please try again.",
    whatYouGet: "What you now have:",
    startExploring: "Start Exploring",
    tryAgain: "Try Again",
    contactSupport: "Contact Support",
    helpLine: "support@bandhan.ai",
    receiptNote: "A receipt has been sent to your registered phone number.",
    noChargeNote: "No charge will be made during the trial period.",
  },
  hi: {
    successTitle: "प्रीमियम में स्वागत है!",
    successSubtitle: "आपका अपग्रेड सक्रिय है। असीमित सुविधाओं का पता लगाना शुरू करें।",
    trialTitle: "आपका फ्री ट्रायल शुरू हो गया!",
    trialSubtitle: "बिना किसी शुल्क के 7 दिनों की प्रीमियम सुविधाओं का आनंद लें। कभी भी रद्द करें।",
    failTitle: "भुगतान विफल",
    failSubtitle: "चिंता न करें — कोई पैसा नहीं काटा गया। कृपया पुनः प्रयास करें।",
    whatYouGet: "अब आपके पास क्या है:",
    startExploring: "एक्सप्लोर करना शुरू करें",
    tryAgain: "पुनः प्रयास करें",
    contactSupport: "सहायता से संपर्क करें",
    helpLine: "support@bandhan.ai",
    receiptNote: "एक रसीद आपके पंजीकृत फोन नंबर पर भेजी गई है।",
    noChargeNote: "ट्रायल अवधि के दौरान कोई शुल्क नहीं लिया जाएगा।",
  },
} as const;

export function PaymentResultScreen({
  success,
  planId,
  onDone,
  onRetry,
  language = "en",
}: PaymentResultScreenProps) {
  const t = S[language];
  const isHi = language === "hi";
  const plan = PLANS[planId];
  const isTrial = plan.hasFreeTrial;

  if (success) {
    return (
      <div className="text-center py-8 space-y-6">
        {/* Success icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 border-[3px] border-black shadow-[4px_4px_0px_#000] bg-[#F8F8F8]">
          {isTrial ? (
            <Crown size={32} strokeWidth={3} className="text-black" />
          ) : (
            <CheckCircle2 size={32} strokeWidth={3} className="text-black" />
          )}
        </div>

        {/* Title */}
        <div>
          <h2 className="text-lg font-bold text-[#212121] uppercase tracking-wider">
            {isTrial ? t.trialTitle : t.successTitle}
          </h2>
          <p className="text-xs text-[#9E9E9E] mt-2">
            {isTrial ? t.trialSubtitle : t.successSubtitle}
          </p>
        </div>

        {/* Features unlocked */}
        <div className="border-[2px] border-black shadow-[4px_4px_0px_#000] bg-white text-left mx-auto max-w-xs">
          <div className="border-b-[2px] border-black bg-[#212121] text-white px-4 py-2">
            <p className="text-[9px] font-bold uppercase tracking-wider">{t.whatYouGet}</p>
          </div>
          <div className="p-3 space-y-1.5">
            {plan.features.filter((f) => f.included).slice(0, 6).map((f) => (
              <div key={f.id} className="flex items-center gap-2">
                <CheckCircle2 size={10} strokeWidth={3} className="text-black flex-shrink-0" />
                <span className="text-[10px] text-[#212121]">{isHi ? f.labelHi : f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Note */}
        <p className="text-[9px] text-[#9E9E9E]">
          {isTrial ? t.noChargeNote : t.receiptNote}
        </p>

        {/* CTA */}
        <button
          onClick={onDone}
          className="w-full max-w-xs mx-auto flex items-center justify-center gap-1.5 border-[3px] border-black bg-black text-white px-4 py-3 text-xs font-bold uppercase tracking-wider shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] transition-all"
        >
          {t.startExploring}
          <ChevronRight size={14} strokeWidth={3} />
        </button>
      </div>
    );
  }

  // ── Failure Screen ──
  return (
    <div className="text-center py-8 space-y-6">
      {/* Failure icon */}
      <div className="inline-flex items-center justify-center w-16 h-16 border-[3px] border-black shadow-[4px_4px_0px_#000] bg-white">
        <XCircle size={32} strokeWidth={3} className="text-black" />
      </div>

      {/* Title */}
      <div>
        <h2 className="text-lg font-bold text-[#212121] uppercase tracking-wider">
          {t.failTitle}
        </h2>
        <p className="text-xs text-[#9E9E9E] mt-2">{t.failSubtitle}</p>
      </div>

      {/* Actions */}
      <div className="space-y-3 max-w-xs mx-auto">
        <button
          onClick={onRetry}
          className="w-full flex items-center justify-center gap-1.5 border-[3px] border-black bg-black text-white px-4 py-3 text-xs font-bold uppercase tracking-wider shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] transition-all"
        >
          <RotateCcw size={14} strokeWidth={3} />
          {t.tryAgain}
        </button>

        <a
          href={`mailto:${S.en.helpLine}`}
          className="w-full flex items-center justify-center gap-1.5 border-[2px] border-black px-4 py-2.5 text-xs font-bold uppercase tracking-wider no-underline text-black hover:bg-[#F8F8F8] transition-colors"
        >
          <Phone size={12} strokeWidth={3} />
          {t.contactSupport}
        </a>
      </div>
    </div>
  );
}

export default PaymentResultScreen;
