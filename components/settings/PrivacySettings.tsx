/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Privacy & Safety Settings
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Toggles for:
 *   • Profile Visibility (visible to all / matches only)
 *   • Photo Privacy (blur until matched)
 *   • Read Receipts (show when messages read)
 *   • Online Status (show when online)
 *   • Profile Visits (show when you view profiles)
 *   • Block List link
 *
 * Comic-book toggle: square slider, 2px border, hard shadow.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ChevronRight, Shield, Ban } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface PrivacyToggle {
  id: string;
  label: string;
  description: string;
  defaultOn: boolean;
}

export interface PrivacySettingsProps {
  className?: string;
}

// ─── Toggle Data ─────────────────────────────────────────────────────────────

const PRIVACY_TOGGLES: PrivacyToggle[] = [
  {
    id: "visibility",
    label: "Profile Visibility",
    description: "Show your profile to everyone in discovery",
    defaultOn: true,
  },
  {
    id: "photo-blur",
    label: "Photo Privacy",
    description: "Blur photos until mutual match",
    defaultOn: true,
  },
  {
    id: "read-receipts",
    label: "Read Receipts",
    description: "Show when you've read messages",
    defaultOn: true,
  },
  {
    id: "online-status",
    label: "Online Status",
    description: "Show when you're currently active",
    defaultOn: true,
  },
  {
    id: "profile-visits",
    label: "Profile Visits",
    description: "Others see when you view their profile",
    defaultOn: false,
  },
];

// ─── Comic Toggle Switch ─────────────────────────────────────────────────────

function ComicToggle({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  ariaLabel: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => {
        onChange(!checked);
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate(8);
        }
      }}
      className={cn(
        "relative w-11 h-6 border-[2px] border-black cursor-pointer flex-shrink-0",
        "transition-colors duration-150",
        checked ? "bg-black" : "bg-[#E0E0E0]",
      )}
    >
      <div
        className={cn(
          "absolute top-[2px] w-[16px] h-[16px] bg-white border-[2px] border-black",
          "transition-[left] duration-150",
          checked ? "left-[21px]" : "left-[2px]",
        )}
      />
    </button>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function PrivacySettings({ className }: PrivacySettingsProps) {
  const [values, setValues] = useState<Record<string, boolean>>(
    Object.fromEntries(PRIVACY_TOGGLES.map((t) => [t.id, t.defaultOn])),
  );

  const handleToggle = useCallback((id: string, val: boolean) => {
    setValues((prev) => ({ ...prev, [id]: val }));
    // TODO: persist to API / Firestore
  }, []);

  return (
    <div className={cn("", className)}>
      {/* Toggles */}
      <div className="border-[2px] border-black bg-white shadow-[4px_4px_0px_#000000]">
        {PRIVACY_TOGGLES.map((t, i) => {
          const isLast = i === PRIVACY_TOGGLES.length - 1;
          return (
            <div
              key={t.id}
              className={cn(
                "flex items-center justify-between gap-3 px-4 py-3",
                !isLast && "border-b border-dashed border-[#E0E0E0]",
              )}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-heading font-bold text-[#212121] m-0">
                  {t.label}
                </p>
                <p className="text-[10px] text-[#9E9E9E] m-0 mt-0.5">
                  {t.description}
                </p>
              </div>
              <ComicToggle
                checked={values[t.id] ?? t.defaultOn}
                onChange={(val) => handleToggle(t.id, val)}
                ariaLabel={t.label}
              />
            </div>
          );
        })}
      </div>

      {/* Block List link */}
      <Link
        href="/settings/blocklist"
        className={cn(
          "flex items-center gap-3 mt-3 px-4 py-3 no-underline",
          "border-[2px] border-black bg-[#F8F8F8]",
          "shadow-[4px_4px_0px_#000000]",
          "hover:bg-[#E0E0E0] transition-colors duration-100",
        )}
      >
        <div className="w-8 h-8 border-[2px] border-black bg-white flex items-center justify-center flex-shrink-0">
          <Ban className="w-4 h-4 text-black" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-heading font-bold text-[#212121] m-0">
            Block List
          </p>
          <p className="text-[10px] text-[#9E9E9E] m-0">
            Manage blocked profiles
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-[#9E9E9E] flex-shrink-0" strokeWidth={2} />
      </Link>

      {/* Safety note */}
      <div className="mt-3 flex items-start gap-2 px-1">
        <Shield className="w-3.5 h-3.5 text-[#9E9E9E] flex-shrink-0 mt-0.5" strokeWidth={2} />
        <p className="text-[9px] text-[#9E9E9E] m-0 leading-snug">
          Your safety is our priority. Reports are reviewed within 24 hours. Blocked
          users cannot see your profile or send you messages.
        </p>
      </div>
    </div>
  );
}

export default PrivacySettings;
