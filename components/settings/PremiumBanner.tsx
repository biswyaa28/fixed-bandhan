/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Premium Banner (Halftone Pattern Background)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * • ₹499/month prominently displayed
 * • "7-day free trial" badge
 * • Features checklist
 * • UPI QR code placeholder
 * • "Upgrade Now" CTA
 *
 * Comic-book aesthetic: 2px border, halftone pattern bg, hard shadow.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import Link from "next/link";
import {
  Crown,
  Check,
  Heart,
  Filter,
  MessageCircle,
  Eye,
  Shield,
  QrCode,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

// ─── Features ────────────────────────────────────────────────────────────────

const PREMIUM_FEATURES = [
  { icon: Heart, label: "Unlimited likes & Special Interests" },
  { icon: Filter, label: "Advanced filters (age, city, diet)" },
  { icon: Eye, label: "See who viewed your profile" },
  { icon: MessageCircle, label: "Unlimited messages" },
  { icon: Shield, label: "Priority safety support" },
] as const;

// ─── Props ───────────────────────────────────────────────────────────────────

export interface PremiumBannerProps {
  isPremium?: boolean;
  className?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function PremiumBanner({ isPremium = false, className }: PremiumBannerProps) {
  if (isPremium) {
    return (
      <div
        className={cn(
          "border-[2px] border-black bg-white px-4 py-3",
          "shadow-[4px_4px_0px_#000000]",
          className,
        )}
      >
        <div className="flex items-center gap-2 mb-1">
          <Crown className="w-4 h-4 text-black" strokeWidth={2.5} />
          <span className="text-sm font-heading font-bold text-black uppercase">
            Premium Active
          </span>
        </div>
        <p className="text-[10px] text-[#9E9E9E] m-0">
          Your premium subscription is active. All features unlocked.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "border-[2px] border-black overflow-hidden",
        "shadow-[4px_4px_0px_#000000]",
        className,
      )}
    >
      {/* Header with halftone pattern */}
      <div
        className="relative bg-black px-4 py-4"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)",
          backgroundSize: "6px 6px",
        }}
      >
        {/* 7-day trial badge */}
        <div className="absolute top-3 right-3 px-2 py-1 bg-white border-[2px] border-black text-[7px] font-bold uppercase tracking-wider text-black shadow-[2px_2px_0px_rgba(255,255,255,0.3)]">
          7-Day Free Trial
        </div>

        <div className="flex items-center gap-2 mb-2">
          <Crown className="w-5 h-5 text-white" strokeWidth={2.5} />
          <span className="text-base font-heading font-bold text-white uppercase tracking-wide">
            Go Premium
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-heading font-bold text-white leading-none">
            ₹499
          </span>
          <span className="text-xs text-white/60 font-bold uppercase">/month</span>
        </div>
        <p className="text-[10px] text-white/50 mt-1 m-0">
          Less than ₹17/day · Cancel anytime
        </p>
      </div>

      {/* Features checklist */}
      <div className="bg-white px-4 py-3 space-y-2">
        {PREMIUM_FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.label} className="flex items-center gap-2">
              <div className="w-5 h-5 border-[2px] border-black bg-black flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-white" strokeWidth={3} />
              </div>
              <span className="text-xs text-[#212121]">{f.label}</span>
            </div>
          );
        })}
      </div>

      {/* UPI QR Code Placeholder */}
      <div className="border-t border-dashed border-[#E0E0E0] px-4 py-3 bg-[#F8F8F8]">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 border-[2px] border-black bg-white flex items-center justify-center flex-shrink-0">
            <QrCode className="w-8 h-8 text-[#9E9E9E]" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-heading font-bold text-[#212121] m-0 mb-0.5 uppercase tracking-wider">
              Scan to Pay
            </p>
            <p className="text-[9px] text-[#9E9E9E] m-0">
              PhonePe / GPay / Paytm / BHIM
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="border-t-[2px] border-black">
        <Link
          href="/premium"
          className={cn(
            "flex items-center justify-center gap-2 py-3 no-underline",
            "bg-black text-white",
            "text-xs font-heading font-bold uppercase tracking-wider",
            "hover:bg-[#424242] transition-colors duration-100",
          )}
        >
          <Crown className="w-4 h-4" strokeWidth={2} />
          Upgrade Now — ₹499/mo
        </Link>
      </div>
    </div>
  );
}

export default PremiumBanner;
