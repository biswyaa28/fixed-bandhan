/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Premium Upgrade Screen (Comic Book Aesthetic)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Full-page upgrade flow with:
 *   1. Plan comparison (Free vs Premium vs Family)
 *   2. Monthly/Yearly toggle with savings badge
 *   3. Feature comparison grid
 *   4. UPI payment (primary) + Razorpay Checkout
 *   5. Trust badges (DigiLocker, DPDP, 7-day guarantee)
 *
 * Comic book design: thick borders, hard shadows, monochromatic.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useCallback } from "react";
import {
  Crown,
  Check,
  X,
  Users,
  ChevronRight,
  Shield,
  Zap,
  Star,
} from "lucide-react";
import {
  PLANS,
  type PlanId,
} from "@/lib/payments/pricing";
import { UPIPaymentPanel } from "./UPIPaymentPanel";
import { PaymentResultScreen } from "./PaymentResultScreen";

// ─── Types ───────────────────────────────────────────────────────────────

interface PremiumUpgradeScreenProps {
  /** Current plan (null or "free" if free user) */
  currentPlan?: PlanId;
  /** Pre-selected plan from upsell context */
  suggestedPlan?: PlanId;
  /** User's UID */
  userId: string;
  /** User details for payment */
  userName: string;
  userPhone: string;
  /** Close handler */
  onClose: () => void;
  /** Language */
  language?: "en" | "hi";
}

type ScreenStep = "plans" | "payment" | "result";

// ─── Strings ─────────────────────────────────────────────────────────────

const S = {
  en: {
    title: "Choose Your Plan",
    subtitle: "Find your life partner with the right tools",
    monthly: "Monthly",
    yearly: "Yearly",
    family: "Family",
    free: "Free",
    premium: "Premium",
    current: "Current Plan",
    perMonth: "/mo",
    perYear: "/yr",
    upgrade: "Upgrade Now",
    continue: "Continue",
    trialBadge: "7-day free trial",
    gstNote: "All prices include 18% GST",
    back: "Back",
    trustTitle: "Why trust Bandhan?",
    trustVerified: "DigiLocker Verified",
    trustDpdp: "DPDP Act 2023 Compliant",
    trustGuarantee: "7-day money-back guarantee",
    trustUpi: "UPI payments — ₹0 gateway fee",
  },
  hi: {
    title: "अपनी योजना चुनें",
    subtitle: "सही उपकरणों से अपना जीवन साथी खोजें",
    monthly: "मासिक",
    yearly: "वार्षिक",
    family: "परिवार",
    free: "मुफ्त",
    premium: "प्रीमियम",
    current: "वर्तमान योजना",
    perMonth: "/माह",
    perYear: "/वर्ष",
    upgrade: "अभी अपग्रेड करें",
    continue: "जारी रखें",
    trialBadge: "7-दिन का फ्री ट्रायल",
    gstNote: "सभी कीमतों में 18% GST शामिल है",
    back: "वापस",
    trustTitle: "बंधन पर भरोसा क्यों?",
    trustVerified: "DigiLocker सत्यापित",
    trustDpdp: "DPDP अधिनियम 2023 अनुपालित",
    trustGuarantee: "7-दिन की वापसी गारंटी",
    trustUpi: "UPI भुगतान — ₹0 गेटवे शुल्क",
  },
} as const;

// ─── Component ───────────────────────────────────────────────────────────

export function PremiumUpgradeScreen({
  currentPlan = "free",
  suggestedPlan,
  userId,
  userName,
  userPhone,
  onClose,
  language = "en",
}: PremiumUpgradeScreenProps) {
  const t = S[language];

  const [step, setStep] = useState<ScreenStep>("plans");
  const [billingToggle, setBillingToggle] = useState<"monthly" | "yearly">("yearly");
  const [selectedPlan, setSelectedPlan] = useState<PlanId>(
    suggestedPlan || "premium_yearly",
  );
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const activePremiumPlan = billingToggle === "yearly" ? "premium_yearly" : "premium_monthly";
  const premiumPlan = PLANS[activePremiumPlan];
  const familyPlan = PLANS.family;
  const freePlan = PLANS.free;

  const handleSelectPlan = useCallback((planId: PlanId) => {
    if (planId === "free" || planId === currentPlan) return;
    setSelectedPlan(planId);
    setStep("payment");
  }, [currentPlan]);

  const handlePaymentSuccess = useCallback(() => {
    setPaymentSuccess(true);
    setStep("result");
  }, []);

  const handlePaymentFailure = useCallback(() => {
    setPaymentSuccess(false);
    setStep("result");
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* ── Header ── */}
      <header className="border-b-[3px] border-black bg-[#212121] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        {step !== "plans" ? (
          <button
            onClick={() => setStep("plans")}
            className="text-[10px] font-bold uppercase tracking-wider border-[2px] border-white px-2 py-1 hover:bg-white hover:text-black transition-colors"
          >
            {t.back}
          </button>
        ) : (
          <div />
        )}
        <div className="flex items-center gap-2">
          <Crown size={16} strokeWidth={3} />
          <h1 className="text-sm font-bold uppercase tracking-wider">{t.title}</h1>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:opacity-70"
          aria-label="Close"
        >
          <X size={16} strokeWidth={3} />
        </button>
      </header>

      {/* ── Plans Step ── */}
      {step === "plans" && (
        <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
          <p className="text-center text-xs text-[#9E9E9E]">{t.subtitle}</p>

          {/* Billing toggle */}
          <div className="flex justify-center">
            <div className="inline-flex border-[2px] border-black">
              {(["monthly", "yearly"] as const).map((cycle) => (
                <button
                  key={cycle}
                  onClick={() => setBillingToggle(cycle)}
                  className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    billingToggle === cycle
                      ? "bg-black text-white"
                      : "bg-white text-black hover:bg-[#F8F8F8]"
                  }`}
                >
                  {cycle === "monthly" ? t.monthly : t.yearly}
                  {cycle === "yearly" && (
                    <span className="ml-1.5 text-[8px] border border-current px-1 py-0.5">
                      -40%
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Plan cards */}
          <div className="space-y-4">
            {/* Free */}
            <PlanCard
              name={t.free}
              price={freePlan.displayPrice}
              period=""
              features={freePlan.features.slice(0, 6)}
              isCurrent={currentPlan === "free"}
              onSelect={() => {}}
              currentLabel={t.current}
              upgradeLabel={t.upgrade}
              language={language}
            />

            {/* Premium */}
            <PlanCard
              name={t.premium}
              price={premiumPlan.displayPrice}
              period={language === "hi" ? premiumPlan.periodLabelHi : premiumPlan.periodLabel}
              features={premiumPlan.features.slice(0, 8)}
              badge={premiumPlan.badge ? (language === "hi" ? premiumPlan.badgeHi : premiumPlan.badge) : undefined}
              trialBadge={premiumPlan.hasFreeTrial ? t.trialBadge : undefined}
              dailyCost={language === "hi" ? premiumPlan.dailyCostDisplayHi : premiumPlan.dailyCostDisplay}
              savingsBadge={language === "hi" ? premiumPlan.savingsBadgeHi : premiumPlan.savingsBadge}
              highlight
              isCurrent={currentPlan === activePremiumPlan}
              onSelect={() => handleSelectPlan(activePremiumPlan)}
              currentLabel={t.current}
              upgradeLabel={t.upgrade}
              language={language}
            />

            {/* Family */}
            <PlanCard
              name={language === "hi" ? familyPlan.nameHi : familyPlan.name}
              price={familyPlan.displayPrice}
              period={language === "hi" ? familyPlan.periodLabelHi : familyPlan.periodLabel}
              features={familyPlan.features}
              badge={language === "hi" ? familyPlan.badgeHi : familyPlan.badge}
              trialBadge={familyPlan.hasFreeTrial ? t.trialBadge : undefined}
              dailyCost={language === "hi" ? familyPlan.dailyCostDisplayHi : familyPlan.dailyCostDisplay}
              isCurrent={currentPlan === "family"}
              onSelect={() => handleSelectPlan("family")}
              currentLabel={t.current}
              upgradeLabel={t.upgrade}
              language={language}
            />
          </div>

          {/* GST note */}
          <p className="text-center text-[9px] text-[#9E9E9E]">{t.gstNote}</p>

          {/* Trust badges */}
          <div className="border-[2px] border-black shadow-[4px_4px_0px_#000] p-4">
            <h3 className="text-[10px] font-bold text-[#212121] uppercase tracking-wider mb-3 text-center">
              {t.trustTitle}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: Shield, label: t.trustVerified },
                { icon: Shield, label: t.trustDpdp },
                { icon: Star, label: t.trustGuarantee },
                { icon: Zap, label: t.trustUpi },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 p-2 border border-[#E0E0E0]">
                  <Icon size={12} strokeWidth={2.5} className="text-[#9E9E9E] flex-shrink-0" />
                  <span className="text-[9px] text-[#424242]">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Payment Step ── */}
      {step === "payment" && (
        <div className="max-w-lg mx-auto px-4 py-6">
          <UPIPaymentPanel
            planId={selectedPlan}
            userId={userId}
            userName={userName}
            userPhone={userPhone}
            onSuccess={handlePaymentSuccess}
            onFailure={handlePaymentFailure}
            onCancel={() => setStep("plans")}
            language={language}
          />
        </div>
      )}

      {/* ── Result Step ── */}
      {step === "result" && (
        <div className="max-w-lg mx-auto px-4 py-6">
          <PaymentResultScreen
            success={paymentSuccess}
            planId={selectedPlan}
            onDone={onClose}
            onRetry={() => setStep("payment")}
            language={language}
          />
        </div>
      )}
    </div>
  );
}

// ─── Plan Card Sub-Component ─────────────────────────────────────────────

function PlanCard({
  name,
  price,
  period,
  features,
  badge,
  trialBadge,
  dailyCost,
  savingsBadge,
  highlight,
  isCurrent,
  onSelect,
  currentLabel,
  upgradeLabel,
  language,
}: {
  name: string;
  price: string;
  period: string;
  features: { id: string; label: string; labelHi: string; included: boolean }[];
  badge?: string | null;
  trialBadge?: string;
  dailyCost?: string;
  savingsBadge?: string | null;
  highlight?: boolean;
  isCurrent?: boolean;
  onSelect: () => void;
  currentLabel: string;
  upgradeLabel: string;
  language: "en" | "hi";
}) {
  const isHi = language === "hi";

  return (
    <div
      className={`border-[${highlight ? "3" : "2"}px] border-black shadow-[4px_4px_0px_#000] relative ${
        highlight ? "bg-[#212121] text-white" : "bg-[#F8F8F8]"
      }`}
    >
      {/* Badges */}
      {(badge || trialBadge || savingsBadge) && (
        <div className="flex flex-wrap gap-1.5 px-4 pt-3">
          {badge && (
            <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 border ${highlight ? "border-white" : "border-black"}`}>
              {badge}
            </span>
          )}
          {trialBadge && (
            <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 border ${highlight ? "border-white" : "border-black"}`}>
              {trialBadge}
            </span>
          )}
          {savingsBadge && (
            <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 border ${highlight ? "border-white" : "border-black"}`}>
              {savingsBadge}
            </span>
          )}
        </div>
      )}

      {/* Header */}
      <div className="px-4 pt-3 pb-2">
        <h3 className="text-sm font-bold uppercase tracking-wider">{name}</h3>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-2xl font-bold">{price}</span>
          <span className={`text-xs ${highlight ? "text-[#9E9E9E]" : "text-[#9E9E9E]"}`}>{period}</span>
        </div>
        {dailyCost && (
          <p className={`text-[9px] mt-0.5 ${highlight ? "text-[#9E9E9E]" : "text-[#9E9E9E]"}`}>
            {dailyCost}
          </p>
        )}
      </div>

      {/* Features */}
      <div className={`px-4 py-2 border-t border-dashed ${highlight ? "border-[#424242]" : "border-[#E0E0E0]"}`}>
        {features.map((f) => (
          <div key={f.id} className="flex items-center gap-2 py-1">
            {f.included ? (
              <Check size={12} strokeWidth={3} className={highlight ? "text-white" : "text-black"} />
            ) : (
              <X size={12} strokeWidth={2} className={highlight ? "text-[#424242]" : "text-[#E0E0E0]"} />
            )}
            <span
              className={`text-[10px] ${
                f.included
                  ? highlight ? "text-white" : "text-[#212121]"
                  : highlight ? "text-[#424242] line-through" : "text-[#E0E0E0] line-through"
              }`}
            >
              {isHi ? f.labelHi : f.label}
            </span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="p-4">
        <button
          onClick={onSelect}
          disabled={isCurrent}
          className={`w-full flex items-center justify-center gap-1.5 border-[3px] px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
            isCurrent
              ? `${highlight ? "border-[#424242] text-[#424242]" : "border-[#E0E0E0] text-[#E0E0E0]"} cursor-not-allowed`
              : highlight
                ? "border-white bg-white text-black shadow-[3px_3px_0px_rgba(255,255,255,0.3)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_rgba(255,255,255,0.3)]"
                : "border-black bg-black text-white shadow-[3px_3px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000]"
          }`}
        >
          {isCurrent ? currentLabel : upgradeLabel}
          {!isCurrent && <ChevronRight size={12} strokeWidth={3} />}
        </button>
      </div>
    </div>
  );
}

export default PremiumUpgradeScreen;
