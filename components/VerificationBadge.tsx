/**
 * Bandhan AI — Verification Badge System (Comic Book / 8-Bit)
 *
 * Tiers:
 * - Bronze: #E0E0E0 square "B" — phone verified
 * - Silver: #9E9E9E square "S" — DigiLocker verified
 * - Gold:   #424242 square "G" — full premium verified
 *
 * All sizes snap to 8px grid. All borders 2px. Hard shadows only.
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, CheckCircle2, Star } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

// ─── Types ───────────────────────────────────────────────────────────────
export type VerificationTier = "bronze" | "silver" | "gold";

export interface VerificationBadgeProps {
  tier: VerificationTier;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  className?: string;
  onClick?: () => void;
}

// ─── Translations ────────────────────────────────────────────────────────
const BADGE_TRANSLATIONS = {
  en: {
    bronze: {
      label: "Phone Verified",
      tooltip: "Phone number verified via OTP",
      benefit: "Basic matching enabled",
      description: "This user has verified their phone number",
    },
    silver: {
      label: "Identity Verified",
      tooltip: "Identity verified via DigiLocker",
      benefit: "Advanced filters unlocked",
      description: "This user has verified their identity with DigiLocker",
    },
    gold: {
      label: "Premium Verified",
      tooltip: "Identity + face verified",
      benefit: "Priority matching + 10% discount",
      description: "This user has completed maximum verification",
    },
  },
  hi: {
    bronze: {
      label: "फ़ोन सत्यापित",
      tooltip: "फ़ोन नंबर OTP के माध्यम से सत्यापित",
      benefit: "बुनियादी मिलान सक्षम",
      description: "इस उपयोगकर्ता ने अपना फ़ोन नंबर सत्यापित किया है",
    },
    silver: {
      label: "पहचान सत्यापित",
      tooltip: "DigiLocker के माध्यम से पहचान सत्यापित",
      benefit: "उन्नत फ़िल्टर अनलॉक",
      description:
        "इस उपयोगकर्ता ने DigiLocker के साथ अपनी पहचान सत्यापित की है",
    },
    gold: {
      label: "प्रीमियम सत्यापित",
      tooltip: "पहचान + चेहरा सत्यापित",
      benefit: "प्राथमिकता मिलान + 10% छूट",
      description: "इस उपयोगकर्ता ने अधिकतम सत्यापन पूरा किया है",
    },
  },
};

// ─── Badge Config ────────────────────────────────────────────────────────
const BADGE_CONFIG = {
  bronze: {
    bg: "bg-[#E0E0E0]",
    text: "text-black",
    letter: "B",
    label: "BRONZE",
    order: 1,
  },
  silver: {
    bg: "bg-[#9E9E9E]",
    text: "text-black",
    letter: "S",
    label: "SILVER",
    order: 2,
  },
  gold: {
    bg: "bg-[#424242]",
    text: "text-white",
    letter: "G",
    label: "GOLD",
    order: 3,
  },
} as const;

// ─── Sizes (8px grid: 16px, 24px, 32px) ─────────────────────────────────
const SIZE_CONFIG = {
  sm: {
    container: "w-4 h-4",
    fontSize: "text-[7px]",
    border: "border-[1.5px]",
  },
  md: { container: "w-6 h-6", fontSize: "text-[9px]", border: "border-2" },
  lg: { container: "w-8 h-8", fontSize: "text-[11px]", border: "border-2" },
} as const;

// ─── Tooltip ─────────────────────────────────────────────────────────────
function BadgeTooltip({
  tier,
  language,
  children,
}: {
  tier: VerificationTier;
  language: "en" | "hi";
  children: React.ReactNode;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const t = BADGE_TRANSLATIONS[language][tier];
  const config = BADGE_CONFIG[tier];

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none"
          >
            {/* Tooltip card: 8px grid padding */}
            <div className="px-4 py-3 whitespace-nowrap bg-white border-2 border-black shadow-[4px_4px_0px_#000000]">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={cn(
                    "inline-flex items-center justify-center w-4 h-4 text-[7px] font-pixel font-bold border-[1.5px] border-black leading-none",
                    config.bg,
                    config.text,
                  )}
                >
                  {config.letter}
                </span>
                <span className="font-heading font-bold text-xs text-black uppercase leading-none">
                  {t.label}
                </span>
              </div>
              <p className="text-[#424242] text-xs m-0 leading-normal">
                {t.tooltip}
              </p>
              <div className="mt-2 pt-2 border-t border-dashed border-[#E0E0E0]">
                <div className="flex items-center gap-1">
                  <Star
                    className="w-3 h-3 text-[#424242]"
                    strokeWidth={2.5}
                    fill="currentColor"
                  />
                  <span className="text-[#424242] text-xs font-bold leading-none">
                    {t.benefit}
                  </span>
                </div>
              </div>
              {/* Arrow: centered */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-black" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Badge Component ────────────────────────────────────────────────
export function VerificationBadge({
  tier,
  size = "md",
  showTooltip = true,
  className,
  onClick,
}: VerificationBadgeProps) {
  const [language] = useState<"en" | "hi">("en");
  const config = BADGE_CONFIG[tier];
  const sizes = SIZE_CONFIG[size];

  const badgeContent = (
    <motion.div
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-center",
        config.bg,
        config.text,
        sizes.container,
        sizes.border,
        "border-black",
        "shadow-[2px_2px_0px_#000000]",
        "font-pixel font-bold leading-none",
        sizes.fontSize,
        "select-none",
        onClick &&
          cn(
            "cursor-pointer",
            "transition-[transform,box-shadow] duration-150",
            "hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000]",
            "active:!translate-x-[2px] active:!translate-y-[2px] active:!shadow-none",
          ),
        className,
      )}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
    >
      {config.letter}
    </motion.div>
  );

  if (showTooltip) {
    return (
      <BadgeTooltip tier={tier} language={language}>
        {badgeContent}
      </BadgeTooltip>
    );
  }

  return badgeContent;
}

// ─── Badge Group ─────────────────────────────────────────────────────────
export function VerificationBadgeGroup({
  tiers,
  size = "md",
}: {
  tiers: VerificationTier[];
  size?: "sm" | "md" | "lg";
}) {
  const sortedTiers = [...tiers].sort(
    (a, b) => BADGE_CONFIG[b].order - BADGE_CONFIG[a].order,
  );

  return (
    <div className="flex items-center gap-1">
      {sortedTiers.map((tier) => (
        <VerificationBadge key={tier} tier={tier} size={size} showTooltip />
      ))}
    </div>
  );
}

// ─── Compact Inline Badge ────────────────────────────────────────────────
export function VerificationBadgeInline({
  tier,
  className,
}: {
  tier: VerificationTier;
  className?: string;
}) {
  return (
    <VerificationBadge
      tier={tier}
      size="sm"
      showTooltip
      className={cn("inline-flex align-middle", className)}
    />
  );
}

// ─── Large Profile Badge ─────────────────────────────────────────────────
export function VerificationBadgeLarge({
  tier,
  showLabel = true,
  language = "en",
}: {
  tier: VerificationTier;
  showLabel?: boolean;
  language?: "en" | "hi";
}) {
  const config = BADGE_CONFIG[tier];
  const t = BADGE_TRANSLATIONS[language][tier];

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-flex items-center gap-3 px-4 py-3 bg-[#F8F8F8] border-2 border-black shadow-[4px_4px_0px_#000000]"
    >
      {/* Badge icon: 32px = 4 × 8px */}
      <div
        className={cn(
          "flex items-center justify-center w-8 h-8",
          "border-2 border-black",
          config.bg,
          config.text,
          "font-pixel font-bold text-sm leading-none",
        )}
      >
        {config.letter}
      </div>
      {showLabel && (
        <div>
          <p className="text-sm font-heading font-bold text-black uppercase m-0 leading-tight">
            {t.label}
          </p>
          <p className="text-xs text-[#9E9E9E] m-0 mt-0.5 leading-tight">
            {t.benefit}
          </p>
        </div>
      )}
    </motion.div>
  );
}

// ─── Verification Status (Settings page) ─────────────────────────────────
export function VerificationStatus({
  currentTier,
  onUpgrade,
}: {
  currentTier: VerificationTier | null;
  onUpgrade: (tier: VerificationTier) => void;
}) {
  const [language, setLanguage] = useState<"en" | "hi">("en");

  const tiers: { tier: VerificationTier; locked: boolean }[] = [
    {
      tier: "bronze",
      locked:
        !currentTier || ["silver", "gold"].includes(currentTier)
          ? false
          : currentTier !== "bronze",
    },
    {
      tier: "silver",
      locked: currentTier !== "silver" && currentTier !== "gold",
    },
    { tier: "gold", locked: currentTier !== "gold" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-heading font-bold text-black uppercase tracking-wider m-0">
          {language === "en" ? "Verification Status" : "सत्यापन स्थिति"}
        </h3>
        <button
          onClick={() => setLanguage(language === "en" ? "hi" : "en")}
          className="text-xs text-[#9E9E9E] hover:text-black border-b border-dotted border-[#9E9E9E] bg-transparent border-t-0 border-x-0 p-0 cursor-pointer"
        >
          {language === "en" ? "हिंदी" : "English"}
        </button>
      </div>

      <div className="space-y-2">
        {tiers.map(({ tier, locked }) => {
          const config = BADGE_CONFIG[tier];
          const t = BADGE_TRANSLATIONS[language][tier];
          const isEarned = !locked;

          return (
            <motion.div
              key={tier}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "flex items-center justify-between p-4 border-2",
                isEarned
                  ? "bg-[#F8F8F8] border-black shadow-[2px_2px_0px_#000000]"
                  : "bg-white border-dashed border-[#9E9E9E]",
              )}
            >
              <div className="flex items-center gap-3">
                {/* Badge icon: 40px = 5 × 8px */}
                <div
                  className={cn(
                    "w-10 h-10 flex items-center justify-center border-2 border-black font-pixel font-bold text-xs leading-none",
                    isEarned
                      ? cn(config.bg, config.text)
                      : "bg-[#E0E0E0] text-[#9E9E9E]",
                  )}
                >
                  {isEarned ? (
                    config.letter
                  ) : (
                    <Shield
                      className="w-5 h-5 text-[#9E9E9E]"
                      strokeWidth={2}
                    />
                  )}
                </div>
                <div>
                  <p
                    className={cn(
                      "text-sm font-heading font-bold uppercase m-0 leading-tight",
                      isEarned ? "text-black" : "text-[#9E9E9E]",
                    )}
                  >
                    {t.label}
                  </p>
                  <p className="text-xs text-[#9E9E9E] m-0 mt-0.5 leading-normal">
                    {t.description}
                  </p>
                </div>
              </div>

              {isEarned ? (
                <CheckCircle2
                  className="w-5 h-5 text-[#424242] flex-shrink-0"
                  strokeWidth={2.5}
                />
              ) : (
                <button
                  onClick={() => onUpgrade(tier)}
                  className={cn(
                    "px-4 py-2 text-xs font-heading font-bold uppercase flex-shrink-0",
                    "bg-white text-black border-2 border-black shadow-[2px_2px_0px_#000000]",
                    "transition-[transform,box-shadow] duration-150",
                    "hover:bg-black hover:text-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000]",
                    "cursor-pointer",
                  )}
                >
                  {language === "en" ? "Verify" : "सत्यापित करें"}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Connected Verification Panel (with Firestore) ───────────────────────
/**
 * VerificationUpgradePanel — wraps VerificationStatus with actual
 * Firestore updateVerificationLevel calls. Drop this into the
 * profile page for a fully working verification upgrade flow.
 *
 * Usage:
 *   <VerificationUpgradePanel uid="abc123" currentTier="bronze" />
 */
export function VerificationUpgradePanel({
  uid,
  currentTier,
  onLevelChanged,
}: {
  uid: string;
  currentTier: VerificationTier | null;
  onLevelChanged?: (newTier: VerificationTier) => void;
}) {
  const [tier, setTier] = useState<VerificationTier | null>(currentTier);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);

  const handleUpgrade = async (targetTier: VerificationTier) => {
    setIsUpgrading(true);
    setUpgradeError(null);
    try {
      // Dynamic import to avoid pulling Firestore into the initial bundle
      // if VerificationBadge is used standalone (e.g. in match cards)
      const { updateVerificationLevel } = await import("@/lib/firebase/users");
      const updated = await updateVerificationLevel(uid, targetTier);
      setTier(updated.verificationLevel);
      onLevelChanged?.(updated.verificationLevel);
    } catch (err: any) {
      setUpgradeError(err?.en ?? "Verification failed. Please try again.");
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div>
      <VerificationStatus currentTier={tier} onUpgrade={handleUpgrade} />

      <AnimatePresence>
        {isUpgrading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3 flex items-center gap-2 text-[#9E9E9E]"
          >
            <div className="w-4 h-4 border-2 border-black border-t-transparent animate-spin" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Verifying…
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {upgradeError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-3 p-3 bg-white border-2 border-dashed border-black"
          >
            <p className="text-xs text-[#212121] font-medium">{upgradeError}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default VerificationBadge;
