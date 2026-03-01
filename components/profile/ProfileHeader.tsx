/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Profile Header
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Top-of-profile hero: avatar initials block, name + age, city,
 * verification badge, intent tag, and "Change Photo" button.
 *
 * Comic-book aesthetic:
 *   • Square avatar with 2px black border + hard shadow
 *   • Gradient background behind avatar
 *   • Thick borders, uppercase heading font, monochromatic
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import {
  Camera,
  MapPin,
  Shield,
  ShieldCheck,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ProfileHeaderData {
  name: string;
  age: number;
  city: string;
  initials: string;
  gradientFrom: string;
  gradientTo: string;
  verificationLevel: "bronze" | "silver" | "gold";
  intent: string;
}

export interface ProfileHeaderProps {
  profile: ProfileHeaderData;
  onChangePhoto?: () => void;
  className?: string;
}

// ─── Verification badge ──────────────────────────────────────────────────────

const VERIF = {
  bronze: { bg: "bg-[#E0E0E0]", text: "text-black", letter: "B", label: "Phone Verified", Icon: Shield },
  silver: { bg: "bg-[#9E9E9E]", text: "text-black", letter: "S", label: "ID Verified", Icon: Shield },
  gold: { bg: "bg-[#424242]", text: "text-white", letter: "G", label: "Gold Verified", Icon: ShieldCheck },
} as const;

// ─── Component ───────────────────────────────────────────────────────────────

export function ProfileHeader({ profile, onChangePhoto, className }: ProfileHeaderProps) {
  const v = VERIF[profile.verificationLevel];

  return (
    <div className={cn("bg-white border-b-[2px] border-black", className)}>
      {/* Gradient banner */}
      <div
        className="h-24 border-b-[2px] border-black"
        style={{
          background: `linear-gradient(135deg, ${profile.gradientFrom}, ${profile.gradientTo})`,
        }}
      />

      {/* Profile info overlapping banner */}
      <div className="px-4 pb-4 -mt-10">
        <div className="flex items-end justify-between mb-3">
          {/* Avatar block */}
          <div className="relative">
            <div
              className="w-20 h-20 border-[2px] border-black shadow-[4px_4px_0px_#000000] bg-white flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${profile.gradientFrom}, ${profile.gradientTo})`,
              }}
            >
              <span className="text-2xl font-heading font-bold text-black select-none leading-none">
                {profile.initials}
              </span>
            </div>
            {/* Camera button */}
            <button
              onClick={onChangePhoto}
              className={cn(
                "absolute -bottom-1 -right-1",
                "w-7 h-7 flex items-center justify-center",
                "bg-black border-[2px] border-black cursor-pointer",
                "hover:bg-[#424242] transition-colors duration-100",
              )}
              aria-label="Change profile photo"
            >
              <Camera className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </button>
          </div>

          {/* Verification badge */}
          <div
            className={cn(
              "flex items-center gap-1 px-2 py-1 border-[2px] border-black",
              v.bg,
            )}
          >
            <v.Icon className={cn("w-3.5 h-3.5", v.text)} strokeWidth={2.5} />
            <span className={cn("text-[8px] font-bold uppercase tracking-wider", v.text)}>
              {v.label}
            </span>
          </div>
        </div>

        {/* Name + age */}
        <h1 className="text-xl font-heading font-bold text-black uppercase tracking-wide m-0 leading-tight">
          {profile.name}, {profile.age}
        </h1>

        {/* City */}
        <div className="flex items-center gap-1 mt-1 mb-2">
          <MapPin className="w-3.5 h-3.5 text-[#9E9E9E]" strokeWidth={2} />
          <span className="text-xs text-[#424242]">{profile.city}</span>
        </div>

        {/* Intent tag */}
        <span className="inline-flex px-2.5 py-1 bg-black text-white border-[2px] border-black text-[8px] font-bold uppercase tracking-widest">
          💍 {profile.intent}
        </span>
      </div>
    </div>
  );
}

export default ProfileHeader;
