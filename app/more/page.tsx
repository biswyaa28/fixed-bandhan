/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — "More" Page (Settings Hub)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Quick-access links to all secondary features:
 * Premium, Referrals, Privacy Settings, Help, Safety, Logout.
 *
 * Comic-book aesthetic: thick borders, hard shadows, monochromatic.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import Link from "next/link";
import {
  Crown,
  Gift,
  Shield,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  FileText,
  Users,
  Heart,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

// ─────────────────────────────────────────────────────────────────────────────
// Menu Items
// ─────────────────────────────────────────────────────────────────────────────

interface MenuItem {
  href: string;
  icon: typeof Crown;
  label: string;
  description: string;
  badge?: string;
}

const MENU_SECTIONS: { title: string; items: MenuItem[] }[] = [
  {
    title: "Account",
    items: [
      {
        href: "/premium",
        icon: Crown,
        label: "Premium",
        description: "Unlock unlimited matches",
        badge: "Upgrade",
      },
      {
        href: "/referral",
        icon: Gift,
        label: "Invite Friends",
        description: "Earn free Premium",
      },
      {
        href: "/profile/family-view",
        icon: Users,
        label: "Family View",
        description: "Share profile with parents",
      },
    ],
  },
  {
    title: "Settings",
    items: [
      {
        href: "/settings",
        icon: Settings,
        label: "All Settings",
        description: "Privacy, notifications, language & more",
      },
    ],
  },
  {
    title: "Support",
    items: [
      {
        href: "/safety",
        icon: Shield,
        label: "Safety Center",
        description: "Resources & emergency help",
      },
      {
        href: "/help",
        icon: HelpCircle,
        label: "Help & FAQ",
        description: "Common questions answered",
      },
      {
        href: "/legal/privacy-policy",
        icon: FileText,
        label: "Legal & Privacy",
        description: "Terms, DPDP Act compliance",
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function MorePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b-[2px] border-black px-5 pb-3 pt-4">
        <h1 className="font-heading text-xl font-bold uppercase tracking-wide text-black">
          More
        </h1>
        <p className="mt-0.5 text-xs text-[#9E9E9E]">Settings, invites & support</p>
      </div>

      {/* Menu Sections */}
      <div className="space-y-6 px-4 py-4">
        {MENU_SECTIONS.map((section) => (
          <div key={section.title}>
            {/* Section title */}
            <h2 className="mb-2 px-1 font-heading text-[10px] font-bold uppercase tracking-widest text-[#9E9E9E]">
              {section.title}
            </h2>

            {/* Items */}
            <div className="border-[2px] border-black bg-[#F8F8F8] shadow-[4px_4px_0px_#000000]">
              {section.items.map((item, idx) => {
                const Icon = item.icon;
                const isLast = idx === section.items.length - 1;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3.5 no-underline",
                      "transition-colors duration-100 hover:bg-[#E0E0E0]",
                      !isLast && "border-b border-dashed border-[#E0E0E0]",
                    )}
                  >
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center border-[2px] border-black bg-white">
                      <Icon className="h-4 w-4 text-black" strokeWidth={2} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-heading text-sm font-bold text-[#212121]">
                        {item.label}
                      </p>
                      <p className="truncate text-[10px] text-[#9E9E9E]">
                        {item.description}
                      </p>
                    </div>
                    {item.badge ? (
                      <span className="border-[2px] border-black bg-black px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-white">
                        {item.badge}
                      </span>
                    ) : (
                      <ChevronRight
                        className="h-4 w-4 flex-shrink-0 text-[#9E9E9E]"
                        strokeWidth={2}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Logout */}
        <button
          onClick={() => {
            // TODO: Wire to auth context signOut
            if (typeof window !== "undefined") {
              localStorage.clear();
              window.location.href = "/login";
            }
          }}
          className={cn(
            "flex w-full items-center gap-3 px-4 py-3.5",
            "border-[2px] border-black bg-white",
            "shadow-[4px_4px_0px_#000000]",
            "hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-[#E0E0E0]",
            "hover:shadow-[2px_2px_0px_#000000]",
            "cursor-pointer transition-all duration-100",
          )}
        >
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center border-[2px] border-black bg-white">
            <LogOut className="h-4 w-4 text-black" strokeWidth={2} />
          </div>
          <span className="font-heading text-sm font-bold text-[#212121]">Log Out</span>
        </button>

        {/* Version */}
        <p className="pb-8 pt-2 text-center text-[10px] text-[#9E9E9E]">
          Bandhan AI v1.0.0 · Made with ❤️ in India
        </p>
      </div>
    </div>
  );
}
