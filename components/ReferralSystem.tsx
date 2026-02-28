/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Referral System UI
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Comic-book styled referral page with:
 *   • Referral code display + copy button
 *   • WhatsApp / Instagram / Twitter / clipboard sharing
 *   • Progress tracker for reward tiers
 *   • Anti-spam share cooldown
 *   • Bilingual (EN/HI)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Copy,
  Check,
  Gift,
  Users,
  Share2,
  Star,
  Crown,
  ExternalLink,
  MessageCircle,
  Camera,
} from "lucide-react";
import {
  type ReferralStats,
  type ReferralReward,
  REWARD_TIERS,
  getReferralLink,
  getWhatsAppShareUrl,
  getShareText,
  getInstagramStoryText,
  getTwitterShareUrl,
  canShare,
  recordShare,
} from "@/lib/referral";

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface ReferralSystemProps {
  /** Stats from getReferralStats() — pass from parent to avoid Firebase dep */
  stats: ReferralStats | null;
  /** Loading state while stats are fetched */
  isLoading?: boolean;
  /** Language toggle */
  language?: "en" | "hi";
  /** Called when user triggers a share action (for analytics) */
  onShare?: (platform: string) => void;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Labels
// ─────────────────────────────────────────────────────────────────────────────

const L = {
  title: { en: "Invite Friends", hi: "दोस्तों को बुलाएँ" },
  subtitle: {
    en: "Share Bandhan AI and earn Premium free!",
    hi: "Bandhan AI शेयर करें और Premium मुफ़्त पाएँ!",
  },
  yourCode: { en: "Your Referral Code", hi: "आपका रेफ़रल कोड" },
  copied: { en: "Copied!", hi: "कॉपी हो गया!" },
  copyCode: { en: "Copy Code", hi: "कोड कॉपी करें" },
  copyLink: { en: "Copy Link", hi: "लिंक कॉपी करें" },
  shareVia: { en: "Share via", hi: "शेयर करें" },
  whatsapp: { en: "WhatsApp", hi: "WhatsApp" },
  instagram: { en: "Instagram Story", hi: "Instagram Story" },
  twitter: { en: "Twitter / X", hi: "Twitter / X" },
  progress: { en: "Your Progress", hi: "आपकी प्रगति" },
  friendsJoined: { en: "friends joined", hi: "दोस्त जुड़े" },
  qualified: { en: "completed profile", hi: "ने प्रोफ़ाइल पूरी की" },
  earned: { en: "Premium days earned", hi: "Premium दिन मिले" },
  nextReward: { en: "Next reward in", hi: "अगला रिवॉर्ड" },
  moreReferrals: { en: "more referrals", hi: "और रेफ़रल" },
  allUnlocked: { en: "All rewards unlocked! 🎉", hi: "सभी रिवॉर्ड अनलॉक! 🎉" },
  howItWorks: { en: "How It Works", hi: "कैसे काम करता है" },
  step1: {
    en: "Share your code with friends",
    hi: "दोस्तों को अपना कोड भेजें",
  },
  step2: {
    en: "They sign up & complete their profile",
    hi: "वो साइन अप करें और प्रोफ़ाइल पूरी करें",
  },
  step3: {
    en: "You both earn Premium benefits!",
    hi: "दोनों को Premium मिलता है!",
  },
  cooldown: {
    en: "Please wait before sharing again",
    hi: "फिर से शेयर करने से पहले कृपया प्रतीक्षा करें",
  },
  loading: { en: "Loading...", hi: "लोड हो रहा है..." },
  igInstructions: {
    en: "Text copied! Paste it in your Instagram Story.",
    hi: "टेक्स्ट कॉपी हो गया! Instagram Story में पेस्ट करें।",
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function ReferralSystem({
  stats,
  isLoading,
  language = "en",
  onShare,
  className,
}: ReferralSystemProps) {
  const t = language;
  const [copied, setCopied] = useState<"code" | "link" | "ig" | null>(null);
  const [cooldown, setCooldown] = useState(false);

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(null), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopyCode = useCallback(async () => {
    if (!stats) return;
    await navigator.clipboard.writeText(stats.code);
    setCopied("code");
  }, [stats]);

  const handleCopyLink = useCallback(async () => {
    if (!stats) return;
    await navigator.clipboard.writeText(getReferralLink(stats.code));
    setCopied("link");
  }, [stats]);

  const handleShare = useCallback(
    (platform: string, url?: string) => {
      if (!canShare()) {
        setCooldown(true);
        setTimeout(() => setCooldown(false), 3000);
        return;
      }
      recordShare();
      onShare?.(platform);
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    },
    [onShare],
  );

  const handleWhatsApp = useCallback(() => {
    if (!stats) return;
    handleShare("whatsapp", getWhatsAppShareUrl(stats.code, t));
  }, [stats, t, handleShare]);

  const handleTwitter = useCallback(() => {
    if (!stats) return;
    handleShare("twitter", getTwitterShareUrl(stats.code, t));
  }, [stats, t, handleShare]);

  const handleInstagram = useCallback(async () => {
    if (!stats) return;
    const igText = getInstagramStoryText(stats.code, t);
    await navigator.clipboard.writeText(igText);
    setCopied("ig");
    handleShare("instagram");
  }, [stats, t, handleShare]);

  const handleNativeShare = useCallback(async () => {
    if (!stats) return;
    if (!canShare()) {
      setCooldown(true);
      setTimeout(() => setCooldown(false), 3000);
      return;
    }
    recordShare();
    onShare?.("native");

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Bandhan AI",
          text: getShareText(stats.code, t),
          url: getReferralLink(stats.code),
        });
      } catch {
        // User cancelled or share API failed
      }
    } else {
      await navigator.clipboard.writeText(
        getShareText(stats.code, t),
      );
      setCopied("link");
    }
  }, [stats, t, onShare]);

  // ── Loading ──
  if (isLoading || !stats) {
    return (
      <div className={`bg-white border-[3px] border-black shadow-[4px_4px_0px_#000] p-6 ${className || ""}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-[#E0E0E0] w-2/3" />
          <div className="h-10 bg-[#E0E0E0]" />
          <div className="h-4 bg-[#E0E0E0] w-1/2" />
          <div className="h-24 bg-[#E0E0E0]" />
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border-[3px] border-black shadow-[4px_4px_0px_#000] ${className || ""}`}>
      {/* ── Header ── */}
      <div className="px-5 py-4 border-b-[2px] border-black">
        <div className="flex items-center gap-2 mb-1">
          <Gift className="w-5 h-5 text-black" strokeWidth={2.5} />
          <h2 className="text-base font-bold text-black uppercase tracking-wider">
            {L.title[t]}
          </h2>
        </div>
        <p className="text-xs text-[#9E9E9E]">{L.subtitle[t]}</p>
      </div>

      <div className="p-5 space-y-5">
        {/* ── Referral Code Box ── */}
        <div>
          <p className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-widest mb-2">
            {L.yourCode[t]}
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-4 py-3 bg-[#F8F8F8] border-[2px] border-black text-center">
              <span className="text-lg font-bold tracking-[0.15em] text-black select-all">
                {stats.code}
              </span>
            </div>
            <button
              onClick={handleCopyCode}
              className="flex items-center justify-center w-12 h-12 border-[3px] border-black bg-white shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all"
              aria-label={L.copyCode[t]}
            >
              {copied === "code" ? (
                <Check className="w-5 h-5 text-black" strokeWidth={2.5} />
              ) : (
                <Copy className="w-5 h-5 text-black" strokeWidth={2.5} />
              )}
            </button>
          </div>
          {copied === "code" && (
            <p className="text-[10px] font-bold text-black mt-1">
              {L.copied[t]}
            </p>
          )}
        </div>

        {/* ── Share Buttons ── */}
        <div>
          <p className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-widest mb-3">
            {L.shareVia[t]}
          </p>

          {cooldown && (
            <p className="text-[10px] text-[#9E9E9E] mb-2 border border-dashed border-[#E0E0E0] px-2 py-1">
              {L.cooldown[t]}
            </p>
          )}

          <div className="grid grid-cols-2 gap-2">
            {/* WhatsApp */}
            <ShareButton
              icon={<MessageCircle className="w-4 h-4" strokeWidth={2.5} />}
              label={L.whatsapp[t]}
              onClick={handleWhatsApp}
              accent
            />
            {/* Instagram */}
            <ShareButton
              icon={<Camera className="w-4 h-4" strokeWidth={2.5} />}
              label={L.instagram[t]}
              onClick={handleInstagram}
            />
            {/* Twitter */}
            <ShareButton
              icon={<ExternalLink className="w-4 h-4" strokeWidth={2.5} />}
              label={L.twitter[t]}
              onClick={handleTwitter}
            />
            {/* Native / Copy */}
            <ShareButton
              icon={<Share2 className="w-4 h-4" strokeWidth={2.5} />}
              label={L.copyLink[t]}
              onClick={handleNativeShare}
            />
          </div>

          {copied === "ig" && (
            <p className="text-[10px] font-bold text-black mt-2">
              {L.igInstructions[t]}
            </p>
          )}
          {copied === "link" && (
            <p className="text-[10px] font-bold text-black mt-2">
              {L.copied[t]}
            </p>
          )}
        </div>

        {/* ── Progress Tracker ── */}
        <div className="border-t-[2px] border-black pt-5">
          <p className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-widest mb-3">
            {L.progress[t]}
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <StatBox
              value={stats.signupCount}
              label={L.friendsJoined[t]}
              icon={<Users className="w-3.5 h-3.5" strokeWidth={2.5} />}
            />
            <StatBox
              value={stats.qualifiedCount}
              label={L.qualified[t]}
              icon={<Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
            />
            <StatBox
              value={stats.premiumDaysEarned}
              label={L.earned[t]}
              icon={<Crown className="w-3.5 h-3.5" strokeWidth={2.5} />}
            />
          </div>

          {/* Reward tiers */}
          <div className="space-y-2">
            {stats.rewards.map((reward) => (
              <RewardTierRow key={reward.tier} reward={reward} language={t} />
            ))}
          </div>

          {/* Next reward hint */}
          <div className="mt-3 px-3 py-2 bg-[#F8F8F8] border border-dashed border-[#E0E0E0]">
            {stats.nextReward ? (
              <p className="text-[10px] text-[#424242] text-center">
                {L.nextReward[t]}{" "}
                <span className="font-bold text-black">
                  {stats.referralsToNextReward}
                </span>{" "}
                {L.moreReferrals[t]}
              </p>
            ) : (
              <p className="text-[10px] font-bold text-black text-center">
                {L.allUnlocked[t]}
              </p>
            )}
          </div>
        </div>

        {/* ── How It Works ── */}
        <div className="border-t border-dashed border-[#E0E0E0] pt-5">
          <p className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-widest mb-3">
            {L.howItWorks[t]}
          </p>
          <div className="space-y-3">
            <StepRow number={1} text={L.step1[t]} />
            <StepRow number={2} text={L.step2[t]} />
            <StepRow number={3} text={L.step3[t]} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function ShareButton({
  icon,
  label,
  onClick,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-3 text-[10px] font-bold uppercase tracking-wider border-[2px] border-black transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] ${
        accent
          ? "bg-black text-white shadow-[3px_3px_0px_#000]"
          : "bg-white text-black shadow-[3px_3px_0px_#000]"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function StatBox({
  value,
  label,
  icon,
}: {
  value: number;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="text-center p-2 border-[2px] border-black bg-[#F8F8F8]">
      <div className="flex items-center justify-center gap-1 mb-1">
        {icon}
        <span className="text-base font-bold text-black">{value}</span>
      </div>
      <p className="text-[8px] text-[#9E9E9E] uppercase tracking-wider leading-tight">
        {label}
      </p>
    </div>
  );
}

function RewardTierRow({
  reward,
  language,
}: {
  reward: ReferralReward;
  language: "en" | "hi";
}) {
  const label = language === "hi" ? reward.labelHi : reward.labelEn;
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 border-[2px] transition-colors ${
        reward.achieved
          ? "border-black bg-black"
          : "border-[#E0E0E0] bg-white"
      }`}
    >
      <div
        className={`flex items-center justify-center w-6 h-6 border-[2px] flex-shrink-0 ${
          reward.achieved
            ? "border-white bg-white"
            : "border-black bg-[#F8F8F8]"
        }`}
      >
        {reward.achieved ? (
          <Check className="w-3.5 h-3.5 text-black" strokeWidth={3} />
        ) : (
          <Star className="w-3.5 h-3.5 text-[#9E9E9E]" strokeWidth={2} />
        )}
      </div>
      <p
        className={`text-[10px] font-bold ${
          reward.achieved ? "text-white" : "text-[#424242]"
        }`}
      >
        {label}
      </p>
    </div>
  );
}

function StepRow({ number, text }: { number: number; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center w-6 h-6 border-[2px] border-black bg-[#F8F8F8] flex-shrink-0">
        <span className="text-[10px] font-bold text-black">{number}</span>
      </div>
      <p className="text-xs text-[#424242]">{text}</p>
    </div>
  );
}

export default ReferralSystem;
