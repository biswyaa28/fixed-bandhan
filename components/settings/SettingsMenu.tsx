/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Settings Menu (Category Navigation)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Renders each settings section as a collapsible accordion panel:
 *   1. Account — Edit Profile, Change Password, Data Export, Delete Account
 *   2. Privacy & Safety — inline PrivacySettings component
 *   3. Notifications — toggle rows for Match, Message, Like
 *   4. Premium — inline PremiumBanner component
 *   5. Language — inline LanguageSelector component
 *   6. Help & Support — FAQ, Contact, Safety Tips
 *   7. Invite Friends — Referral code + share
 *   8. Legal — Terms, Privacy Policy, DPDP Compliance (open in new tab)
 *   9. Logout — red outline button at bottom
 *
 * Comic-book aesthetic: 2px borders, hard shadow, section headers with
 * bold black underline, monochromatic palette.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  User,
  Lock,
  Download,
  Trash2,
  Shield,
  Bell,
  Crown,
  Globe,
  HelpCircle,
  MessageCircle as Chat,
  Phone,
  BookOpen,
  Gift,
  Copy,
  Share2,
  FileText,
  Scale,
  ChevronDown,
  ChevronRight,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { PrivacySettings } from "./PrivacySettings";
import { PremiumBanner } from "./PremiumBanner";
import { type Language, LanguageSelector } from "./LanguageSelector";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

// ─── Comic Toggle Switch (reusable) ─────────────────────────────────────────

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
        "relative h-6 w-11 flex-shrink-0 cursor-pointer border-[2px] border-black",
        "transition-colors duration-150",
        checked ? "bg-black" : "bg-[#E0E0E0]",
      )}
    >
      <div
        className={cn(
          "absolute top-[2px] h-[16px] w-[16px] border-[2px] border-black bg-white",
          "transition-[left] duration-150",
          checked ? "left-[21px]" : "left-[2px]",
        )}
      />
    </button>
  );
}

// ─── Section Header (bold black underline) ───────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
  isOpen,
  onToggle,
}: {
  icon: LucideIcon;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      aria-expanded={isOpen}
      className={cn(
        "flex w-full cursor-pointer items-center justify-between px-4 py-3",
        "border-b-[2px] border-black",
        "transition-colors duration-100 hover:bg-[#F8F8F8]",
      )}
    >
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center border-[2px] border-black bg-[#F8F8F8]">
          <Icon className="h-3.5 w-3.5 text-black" strokeWidth={2} />
        </div>
        <h2 className="m-0 font-heading text-sm font-bold uppercase tracking-wider text-black">
          {title}
        </h2>
      </div>
      <ChevronDown
        className={cn(
          "h-4 w-4 text-[#9E9E9E] transition-transform duration-200",
          isOpen && "rotate-180",
        )}
        strokeWidth={2}
      />
    </button>
  );
}

// ─── Link Row ────────────────────────────────────────────────────────────────

function LinkRow({
  icon: Icon,
  label,
  description,
  href,
  onClick,
  external,
  danger,
  isLast,
}: {
  icon: LucideIcon;
  label: string;
  description?: string;
  href?: string;
  onClick?: () => void;
  external?: boolean;
  danger?: boolean;
  isLast?: boolean;
}) {
  const inner = (
    <>
      <div
        className={cn(
          "flex h-8 w-8 flex-shrink-0 items-center justify-center border-[2px] border-black",
          danger ? "bg-[#FFF0F3]" : "bg-white",
        )}
      >
        <Icon
          className={cn("h-4 w-4", danger ? "text-[#EF476F]" : "text-black")}
          strokeWidth={2}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "m-0 font-heading text-xs font-bold uppercase tracking-wider",
            danger ? "text-[#EF476F]" : "text-[#212121]",
          )}
        >
          {label}
        </p>
        {description && (
          <p className="m-0 mt-0.5 text-[9px] text-[#9E9E9E]">{description}</p>
        )}
      </div>
      <ChevronRight
        className={cn(
          "h-4 w-4 flex-shrink-0",
          danger ? "text-[#EF476F]" : "text-[#9E9E9E]",
        )}
        strokeWidth={2}
      />
    </>
  );

  const cls = cn(
    "flex items-center gap-3 px-4 py-3 no-underline",
    "transition-colors duration-100 hover:bg-[#F8F8F8]",
    !isLast && "border-b border-dashed border-[#E0E0E0]",
    onClick && "cursor-pointer",
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cls}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
      >
        {inner}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={cn(cls, "w-full text-left")}>
      {inner}
    </button>
  );
}

// ─── Notification Toggle Row ─────────────────────────────────────────────────

function NotifRow({
  label,
  description,
  defaultOn,
  isLast,
}: {
  label: string;
  description: string;
  defaultOn: boolean;
  isLast?: boolean;
}) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 px-4 py-3",
        !isLast && "border-b border-dashed border-[#E0E0E0]",
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="m-0 font-heading text-xs font-bold uppercase tracking-wider text-[#212121]">
          {label}
        </p>
        <p className="m-0 mt-0.5 text-[9px] text-[#9E9E9E]">{description}</p>
      </div>
      <ComicToggle checked={on} onChange={setOn} ariaLabel={label} />
    </div>
  );
}

// ─── Referral Section ────────────────────────────────────────────────────────

function ReferralSection() {
  const code = "BANDHAN-RS28";
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleShare = useCallback(() => {
    const text = `Join Bandhan AI — India's trusted matchmaking app!\n\nUse my referral code: ${code}\n\nDownload: https://bandhan.ai/invite/${code}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: "Bandhan AI", text }).catch(() => {});
    } else if (typeof window !== "undefined") {
      // WhatsApp fallback
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    }
  }, []);

  return (
    <div className="space-y-3 px-4 py-3">
      {/* Referral code */}
      <div className="flex items-center gap-2">
        <div className="flex-1 select-all border-[2px] border-dashed border-black bg-[#F8F8F8] px-3 py-2 text-center font-heading text-sm font-bold tracking-widest text-black">
          {code}
        </div>
        <button
          onClick={handleCopy}
          className={cn(
            "flex h-10 w-10 cursor-pointer items-center justify-center border-[2px] border-black",
            "shadow-[2px_2px_0px_#000000]",
            "transition-all duration-100",
            copied ? "bg-black text-white" : "bg-white text-black hover:bg-[#F8F8F8]",
            "hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000]",
          )}
          aria-label="Copy referral code"
        >
          <Copy className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      <p className="m-0 text-[9px] text-[#9E9E9E]">
        Invite 3 friends → Get 1 week Premium free!
      </p>

      {/* Share buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleShare}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 py-2",
            "border-[2px] border-black bg-white text-black",
            "shadow-[2px_2px_0px_#000000]",
            "cursor-pointer font-heading text-[9px] font-bold uppercase tracking-wider",
            "hover:translate-x-[1px] hover:translate-y-[1px] hover:bg-[#F8F8F8] hover:shadow-[1px_1px_0px_#000000]",
            "transition-all duration-100",
          )}
        >
          <Share2 className="h-3.5 w-3.5" strokeWidth={2} />
          Share via WhatsApp
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export interface SettingsMenuProps {
  isPremium?: boolean;
  className?: string;
}

export function SettingsMenu({ isPremium = false, className }: SettingsMenuProps) {
  const [openSection, setOpenSection] = useState<string | null>("account");
  const [language, setLanguage] = useState<Language>("en");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const toggle = (id: string) => setOpenSection((prev) => (prev === id ? null : id));

  const handleLogout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.clear();
      window.location.href = "/login";
    }
  }, []);

  const handleDeleteAccount = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    // TODO: Wire to API
    await new Promise((r) => setTimeout(r, 1500));
    if (typeof window !== "undefined") {
      localStorage.clear();
      window.location.href = "/login";
    }
  }, []);

  return (
    <div className={cn("space-y-0", className)}>
      {/* ════════════════════════════════════════════════════════════════
          1. ACCOUNT
         ════════════════════════════════════════════════════════════════ */}
      <div>
        <SectionHeader
          icon={User}
          title="Account"
          isOpen={openSection === "account"}
          onToggle={() => toggle("account")}
        />
        <AnimatePresence initial={false}>
          {openSection === "account" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="border-x-[2px] border-b-[2px] border-black bg-white">
                <LinkRow icon={User} label="Edit Profile" href="/profile" />
                <LinkRow
                  icon={Lock}
                  label="Change Password"
                  href="/settings/password"
                  description="Update your account password"
                />
                <LinkRow
                  icon={Download}
                  label="Export My Data"
                  description="Download all your data (DPDP Act)"
                  onClick={() => console.log("Export data")}
                />
                <LinkRow
                  icon={Trash2}
                  label="Delete Account"
                  description="Permanently remove your account"
                  danger
                  onClick={handleDeleteAccount}
                  isLast
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          2. PRIVACY & SAFETY
         ════════════════════════════════════════════════════════════════ */}
      <div>
        <SectionHeader
          icon={Shield}
          title="Privacy & Safety"
          isOpen={openSection === "privacy"}
          onToggle={() => toggle("privacy")}
        />
        <AnimatePresence initial={false}>
          {openSection === "privacy" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="border-x-[2px] border-b-[2px] border-black px-4 py-4">
                <PrivacySettings />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          3. NOTIFICATIONS
         ════════════════════════════════════════════════════════════════ */}
      <div>
        <SectionHeader
          icon={Bell}
          title="Notifications"
          isOpen={openSection === "notifications"}
          onToggle={() => toggle("notifications")}
        />
        <AnimatePresence initial={false}>
          {openSection === "notifications" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="border-x-[2px] border-b-[2px] border-black bg-white">
                <NotifRow
                  label="New Match"
                  description="When someone matches with you"
                  defaultOn
                />
                <NotifRow
                  label="New Message"
                  description="When you receive a message"
                  defaultOn
                />
                <NotifRow
                  label="Likes Received"
                  description="When someone likes your profile"
                  defaultOn
                />
                <NotifRow
                  label="Special Interest"
                  description="When someone sends Special Interest"
                  defaultOn
                />
                <NotifRow
                  label="Profile Visitors"
                  description="When someone views your profile"
                  defaultOn={false}
                />
                <NotifRow
                  label="Daily Picks"
                  description="Daily match recommendations"
                  defaultOn
                  isLast
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          4. PREMIUM
         ════════════════════════════════════════════════════════════════ */}
      <div>
        <SectionHeader
          icon={Crown}
          title="Premium"
          isOpen={openSection === "premium"}
          onToggle={() => toggle("premium")}
        />
        <AnimatePresence initial={false}>
          {openSection === "premium" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="border-x-[2px] border-b-[2px] border-black p-4">
                <PremiumBanner isPremium={isPremium} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          5. LANGUAGE
         ════════════════════════════════════════════════════════════════ */}
      <div>
        <SectionHeader
          icon={Globe}
          title="Language"
          isOpen={openSection === "language"}
          onToggle={() => toggle("language")}
        />
        <AnimatePresence initial={false}>
          {openSection === "language" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="border-x-[2px] border-b-[2px] border-black px-4 py-4">
                <LanguageSelector language={language} onLanguageChange={setLanguage} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          6. HELP & SUPPORT
         ════════════════════════════════════════════════════════════════ */}
      <div>
        <SectionHeader
          icon={HelpCircle}
          title="Help & Support"
          isOpen={openSection === "help"}
          onToggle={() => toggle("help")}
        />
        <AnimatePresence initial={false}>
          {openSection === "help" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="border-x-[2px] border-b-[2px] border-black bg-white">
                <LinkRow
                  icon={BookOpen}
                  label="FAQ"
                  description="Common questions answered"
                  href="/help"
                />
                <LinkRow
                  icon={Chat}
                  label="Contact Support"
                  description="Chat with our team"
                  href="mailto:support@bandhan.ai"
                  external
                />
                <LinkRow
                  icon={Phone}
                  label="Women Helpline"
                  description="1091 — 24/7 emergency"
                  href="tel:1091"
                />
                <LinkRow
                  icon={Shield}
                  label="Safety Tips"
                  description="Stay safe while dating"
                  href="/safety"
                  isLast
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          7. INVITE FRIENDS
         ════════════════════════════════════════════════════════════════ */}
      <div>
        <SectionHeader
          icon={Gift}
          title="Invite Friends"
          isOpen={openSection === "referral"}
          onToggle={() => toggle("referral")}
        />
        <AnimatePresence initial={false}>
          {openSection === "referral" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="border-x-[2px] border-b-[2px] border-black bg-white">
                <ReferralSection />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          8. LEGAL
         ════════════════════════════════════════════════════════════════ */}
      <div>
        <SectionHeader
          icon={FileText}
          title="Legal"
          isOpen={openSection === "legal"}
          onToggle={() => toggle("legal")}
        />
        <AnimatePresence initial={false}>
          {openSection === "legal" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="border-x-[2px] border-b-[2px] border-black bg-white">
                <LinkRow
                  icon={FileText}
                  label="Terms of Service"
                  href="/legal/terms"
                  external
                />
                <LinkRow
                  icon={Shield}
                  label="Privacy Policy"
                  href="/legal/privacy-policy"
                  external
                />
                <LinkRow
                  icon={Scale}
                  label="DPDP Act Compliance"
                  description="Digital Personal Data Protection Act 2023"
                  href="/legal/dpdp"
                  external
                  isLast
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          9. LOGOUT
         ════════════════════════════════════════════════════════════════ */}
      <div className="px-4 pb-8 pt-4">
        <button
          onClick={handleLogout}
          className={cn(
            "flex w-full cursor-pointer items-center justify-center gap-2 py-3",
            "border-[2px] border-[#EF476F] bg-white",
            "shadow-[4px_4px_0px_#000000]",
            "font-heading text-sm font-bold uppercase tracking-wider text-[#EF476F]",
            "transition-all duration-100",
            "hover:translate-x-[1px] hover:translate-y-[1px] hover:bg-[#FFF0F3] hover:shadow-[3px_3px_0px_#000000]",
            "active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
          )}
        >
          <LogOut className="h-4 w-4 text-[#EF476F]" strokeWidth={2} />
          Log Out
        </button>

        <p className="m-0 mt-4 text-center text-[10px] text-[#9E9E9E]">
          Bandhan AI v1.0.0 · Made with ❤️ in India
        </p>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          DELETE ACCOUNT CONFIRM DIALOG
         ════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70"
              onClick={() => setShowDeleteConfirm(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-5"
            >
              <div className="w-full max-w-sm border-[3px] border-black bg-white p-6 shadow-[8px_8px_0px_#000000]">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center border-[2px] border-[#EF476F] bg-[#FFF0F3]">
                    <Trash2 className="h-5 w-5 text-[#EF476F]" strokeWidth={2} />
                  </div>
                  <h3 className="m-0 font-heading text-sm font-bold uppercase text-black">
                    Delete Account?
                  </h3>
                </div>
                <p className="m-0 mb-4 text-xs leading-relaxed text-[#424242]">
                  This action is <span className="font-bold">permanent</span>. All your
                  data, matches, messages, and profile information will be erased. This
                  cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className={cn(
                      "flex-1 border-[2px] border-black bg-white py-2.5",
                      "cursor-pointer font-heading text-[10px] font-bold uppercase tracking-wider text-black",
                      "shadow-[2px_2px_0px_#000000]",
                      "hover:translate-x-[1px] hover:translate-y-[1px] hover:bg-[#F8F8F8] hover:shadow-[1px_1px_0px_#000000]",
                      "transition-all duration-100",
                    )}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className={cn(
                      "flex-1 border-[2px] border-[#EF476F] bg-[#EF476F] py-2.5",
                      "cursor-pointer font-heading text-[10px] font-bold uppercase tracking-wider text-white",
                      "shadow-[2px_2px_0px_#000000]",
                      "hover:translate-x-[1px] hover:translate-y-[1px] hover:bg-[#D43F63] hover:shadow-[1px_1px_0px_#000000]",
                      "transition-all duration-100",
                    )}
                  >
                    Delete Forever
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SettingsMenu;
