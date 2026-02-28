/**
 * Bandhan AI - Premium Upsell Modal
 * Shown when user reaches daily limit
 *
 * Features:
 * - Clean, non-aggressive design
 * - Clear value proposition
 * - Pricing prominently displayed
 * - Social proof
 * - "Remind me tomorrow" option
 * - Bilingual support
 */

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Crown,
  Check,
  Zap,
  Sparkles,
  TrendingUp,
  Users,
  Shield,
  Clock,
  Heart,
  MessageCircle,
  Filter,
  FileText,
  Star,
  Info,
} from "lucide-react";
import {
  trackUpsellModalShown,
  trackUpgradeCTAClick,
  trackUpsellModalDismissed,
  trackRemindMeTomorrow,
} from "@/lib/analytics";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface PremiumUpsellModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerSource: "limit_reached" | "feature_locked" | "banner_click";
  limitType?: "profiles" | "chats" | "likes";
  onUpgrade?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Translations
// ─────────────────────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  en: {
    title: "Daily limit reached! 😊",
    titleHi: "दैनिक सीमा पहुंच गई! 😊",
    subtitle: "You've viewed all your free profiles for today",
    subtitleHi: "आपने आज की सभी निःशुल्क प्रोफ़ाइल देख ली हैं",
    upgradeTitle: "Upgrade to Premium for unlimited access",
    upgradeTitleHi: "असीमित एक्सेस के लिए प्रीमियम में अपग्रेड करें",
    price: "₹499",
    pricePeriod: "/month",
    priceHi: "₹499",
    pricePeriodHi: "/माह",
    yearlyPrice: "₹2,999",
    yearlyPriceHi: "₹2,999",
    yearlySave: "Save 40%",
    yearlySaveHi: "40% बचाएं",
    benefits: "What you get:",
    benefitsHi: "आपको क्या मिलता है:",
    unlimitedProfiles: "Unlimited profiles",
    unlimitedProfilesHi: "असीमित प्रोफ़ाइल",
    unlimitedChats: "Unlimited chats",
    unlimitedChatsHi: "असीमित चैट",
    advancedFilters: "Advanced filters (Caste, Gotra)",
    advancedFiltersHi: "उन्नत फ़िल्टर (जाति, गोत्र)",
    priorityMatching: "Priority matching",
    priorityMatchingHi: "प्राथमिकता मिलान",
    familyViewPdf: "Family View PDF",
    familyViewPdfHi: "परिवार दृश्य PDF",
    compatibilityInsights: "Compatibility insights",
    compatibilityInsightsHi: "अनुकूलता अंतर्दृष्टि",
    verifiedProfiles: "Verified profiles only",
    verifiedProfilesHi: "केवल सत्यापित प्रोफ़ाइल",
    socialProof: "Join 15,000+ premium users",
    socialProofHi: "15,000+ प्रीमियम उपयोगकर्ताओं में शामिल हों",
    unlockPremium: "Unlock Premium",
    unlockPremiumHi: "प्रीमियम अनलॉक करें",
    remindTomorrow: "Remind me tomorrow",
    remindTomorrowHi: "कल याद दिलाएं",
    skipForNow: "Skip for now",
    skipForNowHi: "अभी के लिए छोड़ें",
    or: "or",
    orHi: "या",
    comeBackTomorrow: "Come back tomorrow at 12:00 AM IST",
    comeBackTomorrowHi: "कल सुबह 12:00 बजे IST पर वापस आएं",
    trustedBy: "Trusted by 50,000+ Indians",
    trustedByHi: "50,000+ भारतीयों का भरोसा",
    moneyBack: "7-day money back guarantee",
    moneyBackHi: "7-दिन की वापसी गारंटी",
    securePayment: "Secure UPI payment",
    securePaymentHi: "सुरक्षित UPI भुगतान",
  },
  hi: {
    title: "दैनिक सीमा पहुंच गई! 😊",
    titleHi: "दैनिक सीमा पहुंच गई! 😊",
    subtitle: "आपने आज की सभी निःशुल्क प्रोफ़ाइल देख ली हैं",
    subtitleHi: "आपने आज की सभी निःशुल्क प्रोफ़ाइल देख ली हैं",
    upgradeTitle: "असीमित एक्सेस के लिए प्रीमियम में अपग्रेड करें",
    upgradeTitleHi: "असीमित एक्सेस के लिए प्रीमियम में अपग्रेड करें",
    price: "₹499",
    pricePeriod: "/माह",
    priceHi: "₹499",
    pricePeriodHi: "/माह",
    yearlyPrice: "₹2,999",
    yearlyPriceHi: "₹2,999",
    yearlySave: "40% बचाएं",
    yearlySaveHi: "40% बचाएं",
    benefits: "आपको क्या मिलता है:",
    benefitsHi: "आपको क्या मिलता है:",
    unlimitedProfiles: "असीमित प्रोफ़ाइल",
    unlimitedProfilesHi: "असीमित प्रोफ़ाइल",
    unlimitedChats: "असीमित चैट",
    unlimitedChatsHi: "असीमित चैट",
    advancedFilters: "उन्नत फ़िल्टर (जाति, गोत्र)",
    advancedFiltersHi: "उन्नत फ़िल्टर (जाति, गोत्र)",
    priorityMatching: "प्राथमिकता मिलान",
    priorityMatchingHi: "प्राथमिकता मिलान",
    familyViewPdf: "परिवार दृश्य PDF",
    familyViewPdfHi: "परिवार दृश्य PDF",
    compatibilityInsights: "अनुकूलता अंतर्दृष्टि",
    compatibilityInsightsHi: "अनुकूलता अंतर्दृष्टि",
    verifiedProfiles: "केवल सत्यापित प्रोफ़ाइल",
    verifiedProfilesHi: "केवल सत्यापित प्रोफ़ाइल",
    socialProof: "15,000+ प्रीमियम उपयोगकर्ताओं में शामिल हों",
    socialProofHi: "15,000+ प्रीमियम उपयोगकर्ताओं में शामिल हों",
    unlockPremium: "प्रीमियम अनलॉक करें",
    unlockPremiumHi: "प्रीमियम अनलॉक करें",
    remindTomorrow: "कल याद दिलाएं",
    remindTomorrowHi: "कल याद दिलाएं",
    skipForNow: "अभी के लिए छोड़ें",
    skipForNowHi: "अभी के लिए छोड़ें",
    or: "या",
    orHi: "या",
    comeBackTomorrow: "कल सुबह 12:00 बजे IST पर वापस आएं",
    comeBackTomorrowHi: "कल सुबह 12:00 बजे IST पर वापस आएं",
    trustedBy: "50,000+ भारतीयों का भरोसा",
    trustedByHi: "50,000+ भारतीयों का भरोसा",
    moneyBack: "7-दिन की वापसी गारंटी",
    moneyBackHi: "7-दिन की वापसी गारंटी",
    securePayment: "सुरक्षित UPI भुगतान",
    securePaymentHi: "सुरक्षित UPI भुगतान",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Benefit Item Component
// ─────────────────────────────────────────────────────────────────────────────
function BenefitItem({
  icon: Icon,
  text,
  delay,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center gap-3"
    >
      <div className="w-5 h-5 rounded-full bg-sage-100 border border-sage-200 flex items-center justify-center shrink-0">
        <Check className="w-3 h-3 text-sage-600" />
      </div>
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-lavender-500 shrink-0" />
        <span className="text-sm text-ink-700">{text}</span>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Modal Component
// ─────────────────────────────────────────────────────────────────────────────
export function PremiumUpsellModal({
  isOpen,
  onClose,
  triggerSource,
  limitType = "profiles",
  onUpgrade,
}: PremiumUpsellModalProps) {
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [isYearly, setIsYearly] = useState(false);

  const t = TRANSLATIONS[language];

  // Track modal impression
  useEffect(() => {
    if (isOpen) {
      trackUpsellModalShown({
        modal_type: triggerSource,
        trigger_action: `limit_reached_${limitType}`,
        limit_type: limitType,
        time_on_page: 0,
        previous_upsell_shown: 0,
        user_segment: "free",
      });
    }
  }, [isOpen, triggerSource, limitType]);

  const handleUpgradeClick = () => {
    trackUpgradeCTAClick(triggerSource, "primary");
    onUpgrade?.();
    // Navigate to premium page
    window.location.href = "/premium";
  };

  const handleRemindTomorrow = () => {
    trackUpsellModalDismissed(triggerSource, "remind_later");
    trackRemindMeTomorrow();
    onClose();
  };

  const handleSkip = () => {
    trackUpsellModalDismissed(triggerSource, "skip");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="w-full max-w-lg my-8">
              {/* Card */}
              <div className="relative rounded-2xl overflow-hidden bg-white border border-ink-200 shadow-xl">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full border border-ink-200 text-ink-400 hover:text-ink-700 hover:bg-ink-50 transition-colors z-10"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Language Toggle */}
                <button
                  onClick={() => setLanguage(language === "en" ? "hi" : "en")}
                  className="absolute top-4 left-4 px-3 py-1.5 rounded-full border border-ink-200 text-xs text-ink-500 hover:text-ink-700 hover:bg-ink-50 transition-colors"
                >
                  {language === "en" ? "हिंदी" : "English"}
                </button>

                {/* Content */}
                <div className="p-6 pt-14">
                  {/* Header */}
                  <div className="text-center mb-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                      className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gold-100 border border-gold-200 mb-4"
                    >
                      <Crown
                        className="w-7 h-7 text-gold-600"
                        strokeWidth={1.5}
                      />
                    </motion.div>
                    <h2 className="text-xl font-bold text-ink-900 tracking-tight mb-1">
                      {t.title}
                    </h2>
                    <p className="text-sm text-ink-500">{t.subtitle}</p>
                  </div>

                  {/* Pricing */}
                  <div className="mb-6 p-4 rounded-2xl bg-gold-50 border border-gold-200">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-xs text-ink-400 mb-1">
                          {language === "en"
                            ? "Premium Plan"
                            : "प्रीमियम प्लान"}
                        </p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-ink-900">
                            {isYearly ? t.yearlyPrice : t.price}
                          </span>
                          <span className="text-sm text-ink-400">
                            {isYearly ? t.pricePeriodHi : t.pricePeriod}
                          </span>
                        </div>
                      </div>
                      {isYearly && (
                        <span className="px-2.5 py-1 rounded-full bg-sage-100 text-sage-700 border border-sage-200 text-xs font-bold">
                          {t.yearlySave}
                        </span>
                      )}
                    </div>

                    {/* Plan Toggle */}
                    <div className="flex p-1 rounded-xl bg-white/5">
                      <button
                        onClick={() => setIsYearly(false)}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-xs font-medium transition-all",
                          !isYearly
                            ? "bg-white/10 text-white"
                            : "text-gray-400 hover:text-white",
                        )}
                      >
                        {language === "en" ? "Monthly" : "मासिक"}
                      </button>
                      <button
                        onClick={() => setIsYearly(true)}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-xs font-medium transition-all",
                          isYearly
                            ? "bg-white text-ink-900 shadow-sm"
                            : "text-ink-500 hover:text-ink-700",
                        )}
                      >
                        {language === "en" ? "Yearly" : "वार्षिक"}
                      </button>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="mb-5 space-y-2">
                    <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide">
                      {t.benefits}
                    </p>
                    <BenefitItem
                      icon={Users}
                      text={t.unlimitedProfiles}
                      delay={0.1}
                    />
                    <BenefitItem
                      icon={MessageCircle}
                      text={t.unlimitedChats}
                      delay={0.15}
                    />
                    <BenefitItem
                      icon={Filter}
                      text={t.advancedFilters}
                      delay={0.2}
                    />
                    <BenefitItem
                      icon={FileText}
                      text={t.familyViewPdf}
                      delay={0.25}
                    />
                    <BenefitItem
                      icon={TrendingUp}
                      text={t.compatibilityInsights}
                      delay={0.3}
                    />
                    <BenefitItem
                      icon={Shield}
                      text={t.verifiedProfiles}
                      delay={0.35}
                    />
                  </div>

                  {/* Social Proof */}
                  <div className="mb-5 p-3 rounded-xl bg-ink-50 border border-ink-200">
                    <div className="flex items-center justify-center gap-4 text-xs text-ink-500">
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-ink-400" />
                        <span>{t.socialProof}</span>
                      </div>
                      <div className="w-px h-3 bg-ink-200" />
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-gold-500 fill-gold-500" />
                        <span className="font-medium text-ink-700">4.8/5</span>
                      </div>
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div className="mb-5 flex items-center justify-center gap-4 text-xs text-ink-400">
                    <div className="flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-sage-500" />
                      <span>{t.moneyBack}</span>
                    </div>
                    <div className="w-px h-3 bg-ink-200" />
                    <div className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-lavender-500" />
                      <span>{t.securePayment}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2.5">
                    <motion.button
                      onClick={handleUpgradeClick}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 rounded-xl bg-ink-900 text-white font-semibold text-sm hover:bg-ink-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Crown className="w-4 h-4" strokeWidth={2} />
                      {t.unlockPremium}
                    </motion.button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleRemindTomorrow}
                        className="flex-1 py-2.5 rounded-xl border border-ink-200 text-ink-600 text-sm hover:bg-ink-50 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        {t.remindTomorrow}
                      </button>
                      <button
                        onClick={handleSkip}
                        className="px-4 py-2.5 rounded-xl text-ink-400 text-sm hover:text-ink-600 transition-colors"
                      >
                        {t.skipForNow}
                      </button>
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-center text-ink-400">
                    {t.comeBackTomorrow}
                  </p>
                </div>

                {/* Bottom accent bar */}
                <div className="h-1 bg-gradient-to-r from-lavender-300 via-blush-300 to-peach-300" />
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-4 text-center text-xs text-ink-400"
              >
                {t.trustedBy}
              </motion.p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default PremiumUpsellModal;
