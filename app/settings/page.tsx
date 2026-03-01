/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Settings Page
 * ─────────────────────────────────────────────────────────────────────────────
 * Route: /settings
 *
 * Full settings screen with all sections:
 *   Account, Privacy, Notifications, Premium, Language,
 *   Help & Support, Invite Friends, Legal, Logout.
 *
 * Wrapped by root AppShell (AppBar + BottomNav).
 * Comic-book aesthetic throughout.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { SettingsMenu } from "@/components/settings/SettingsMenu";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      {/* ── Header ── */}
      <div className="px-4 pt-2 pb-2 border-b-[2px] border-black flex items-center gap-3">
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className={cn(
            "w-9 h-9 flex items-center justify-center",
            "border-[2px] border-black bg-white cursor-pointer",
            "shadow-[2px_2px_0px_#000000]",
            "hover:bg-[#F8F8F8] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000]",
            "transition-all duration-100",
          )}
        >
          <ArrowLeft className="w-4 h-4 text-black" strokeWidth={2.5} />
        </button>
        <div>
          <h1 className="text-lg font-heading font-bold text-black uppercase tracking-wide m-0">
            Settings
          </h1>
          <p className="text-[8px] text-[#9E9E9E] uppercase tracking-widest m-0">
            Account, privacy & preferences
          </p>
        </div>
      </div>

      {/* ── Settings Menu ── */}
      <SettingsMenu isPremium={false} />
    </div>
  );
}
