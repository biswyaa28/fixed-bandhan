/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Profile Card (Comic Book / 8-Bit Style)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Used in: Discovery Feed, Daily Picks, Received Interests.
 *
 * Features:
 *   • Hard-edge card with 2px black border, 4px block shadow
 *   • Avatar + initials fallback (no blur/glassmorphism)
 *   • Compatibility ring (retro blocky)
 *   • Verification badge
 *   • Expandable details accordion
 *   • "Perfect Match" banner
 *   • Comic speech-bubble for appreciation comments
 *   • Accessible — keyboard navigable, ARIA labels
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  GraduationCap,
  Briefcase,
  ChevronDown,
  Star,
  Crown,
  Heart,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { VerificationBadge } from "@/components/VerificationBadge";
import type { UserDocument, VerificationLevel } from "@/lib/firebase/schema";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

// ─── Types ───────────────────────────────────────────────────────────────

export interface ProfileCardProps {
  /** User profile data */
  user: UserDocument;
  /** Compatibility percentage 0–100 */
  compatibility: number;
  /** Top reasons for compatibility (max 3) */
  compatibilityReasons?: string[];
  /** Whether this is the "Perfect Match of the Day" */
  isPerfectMatch?: boolean;
  /** Optional comment (from "Appreciate This" feature) */
  appreciationComment?: string | null;
  /** Children rendered in the card footer (action buttons) */
  children?: React.ReactNode;
  /** Called when the card is tapped/clicked (opens profile modal) */
  onTap?: () => void;
  /** Compact mode for lists (less padding, no expand) */
  compact?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const INTENT_LABELS: Record<string, string> = {
  "marriage-soon": "Marriage",
  "serious-relationship": "Serious",
  friendship: "Friendship",
  healing: "Healing",
};

// ─── Compatibility Ring (blocky 8-bit style) ─────────────────────────────

function CompatRing({ pct }: { pct: number }) {
  const r = 16;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="relative flex items-center justify-center w-[40px] h-[40px] bg-white border-2 border-black">
      <svg
        className="absolute inset-0 w-full h-full -rotate-90"
        viewBox="0 0 40 40"
      >
        <circle
          cx="20"
          cy="20"
          r={r}
          fill="none"
          stroke="#E0E0E0"
          strokeWidth="3"
        />
        <circle
          cx="20"
          cy="20"
          r={r}
          fill="none"
          stroke="#000000"
          strokeWidth="3"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="butt"
        />
      </svg>
      <span className="text-[10px] font-bold text-black z-10">{pct}%</span>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────

export function ProfileCard({
  user,
  compatibility,
  compatibilityReasons,
  isPerfectMatch = false,
  appreciationComment,
  children,
  onTap,
  compact = false,
}: ProfileCardProps) {
  const [expanded, setExpanded] = useState(false);
  const intentLabel = user.intent ? INTENT_LABELS[user.intent] ?? user.intent : null;
  const initials = getInitials(user.name || "?");
  const primaryPhoto = user.photos?.find((p) => p.isPrimary) ?? user.photos?.[0];
  const avatarUrl = primaryPhoto?.url ?? user.avatarUrl;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "bg-white border-2 border-black",
        "shadow-[4px_4px_0px_#000000]",
        "transition-[transform,box-shadow] duration-150",
        "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000]",
        isPerfectMatch && "border-[3px]",
      )}
    >
      {/* ── Perfect Match banner ── */}
      {isPerfectMatch && (
        <div className="flex items-center gap-1.5 px-4 py-2 bg-black text-white border-b-2 border-black">
          <Crown className="w-3.5 h-3.5" strokeWidth={2.5} />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            Perfect Match of the Day
          </span>
        </div>
      )}

      {/* ── Photo / avatar ── */}
      <div
        className={cn(
          "relative overflow-hidden bg-[#F8F8F8]",
          compact ? "h-40" : "h-56",
          onTap && "cursor-pointer",
        )}
        onClick={onTap}
        role={onTap ? "button" : undefined}
        tabIndex={onTap ? 0 : undefined}
        aria-label={onTap ? `View ${user.name}'s profile` : undefined}
        onKeyDown={(e) => {
          if (onTap && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onTap();
          }
        }}
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={user.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#E0E0E0]">
            <div className="w-16 h-16 flex items-center justify-center bg-white border-2 border-black">
              <span className="text-xl font-bold text-black">{initials}</span>
            </div>
          </div>
        )}

        {/* ── Top overlay: verification + intent ── */}
        <div className="absolute top-2 left-2 right-2 flex items-start justify-between">
          <VerificationBadge tier={user.verificationLevel as VerificationLevel} size="sm" />
          {intentLabel && (
            <span className="px-2 py-0.5 bg-white border-2 border-black text-[9px] font-bold uppercase text-black">
              {intentLabel}
            </span>
          )}
        </div>

        {/* ── Bottom overlay: name + compat ── */}
        <div className="absolute bottom-0 inset-x-0 px-3 pb-2 pt-8 bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-white text-base font-bold leading-tight">
                {user.name}
                {user.age ? `, ${user.age}` : ""}
              </h3>
              {user.city && (
                <p className="text-white/80 text-[11px] flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" strokeWidth={2} />
                  {user.city}
                </p>
              )}
            </div>
            <CompatRing pct={compatibility} />
          </div>
        </div>
      </div>

      {/* ── Card body ── */}
      <div className={cn("border-t-2 border-black", compact ? "p-3" : "p-4")}>
        {/* Quick info chips */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {user.education && (
            <InfoChip icon={GraduationCap} text={user.education} />
          )}
          {user.occupation && (
            <InfoChip icon={Briefcase} text={user.occupation} />
          )}
        </div>

        {/* Bio */}
        {user.bio && !compact && (
          <p className="text-xs text-[#424242] leading-relaxed mb-2 line-clamp-2">
            {user.bio}
          </p>
        )}

        {/* Compatibility reasons */}
        {compatibilityReasons && compatibilityReasons.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {compatibilityReasons.map((reason) => (
              <span
                key={reason}
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-[#F8F8F8] border border-[#E0E0E0] text-[9px] font-bold text-[#424242] uppercase"
              >
                <Heart className="w-2.5 h-2.5" strokeWidth={2.5} />
                {reason}
              </span>
            ))}
          </div>
        )}

        {/* Appreciation comment (speech bubble style) */}
        {appreciationComment && (
          <div className="relative mb-3 p-3 bg-[#F8F8F8] border-2 border-black">
            <p className="text-[11px] text-[#212121] font-medium italic leading-snug">
              "{appreciationComment}"
            </p>
            {/* Tail */}
            <div
              className="absolute -bottom-[7px] left-4 w-0 h-0"
              style={{
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderTop: "7px solid #000000",
              }}
            />
          </div>
        )}

        {/* ── Expandable details ── */}
        {!compact && (
          <>
            <button
              onClick={() => setExpanded((v) => !v)}
              className={cn(
                "flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider",
                "text-[#9E9E9E] hover:text-black transition-colors",
                "bg-transparent border-none p-0 cursor-pointer mb-2",
              )}
            >
              {expanded ? "Less" : "More details"}
              <motion.div
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.15 }}
              >
                <ChevronDown className="w-3 h-3" strokeWidth={2.5} />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pt-2 border-t border-dashed border-[#E0E0E0] space-y-1.5">
                    {user.religion && (
                      <DetailRow label="Religion" value={user.religion} />
                    )}
                    {user.motherTongue && (
                      <DetailRow label="Language" value={user.motherTongue} />
                    )}
                    {user.height && (
                      <DetailRow label="Height" value={user.height} />
                    )}
                    {user.diet && (
                      <DetailRow label="Diet" value={capitalize(user.diet)} />
                    )}
                    {user.familyType && (
                      <DetailRow
                        label="Family"
                        value={capitalize(user.familyType)}
                      />
                    )}
                    {user.smoking && (
                      <DetailRow
                        label="Smoking"
                        value={capitalize(user.smoking)}
                      />
                    )}
                    {user.drinking && (
                      <DetailRow
                        label="Drinking"
                        value={capitalize(user.drinking)}
                      />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* ── Footer (action buttons slot) ── */}
        {children && (
          <div className="mt-3 pt-3 border-t border-dashed border-black">
            {children}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────

function InfoChip({
  icon: Icon,
  text,
}: {
  icon: React.ElementType;
  text: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#F8F8F8] border border-[#E0E0E0] text-[10px] text-[#424242] font-medium max-w-[180px] truncate">
      <Icon className="w-3 h-3 text-[#9E9E9E] flex-shrink-0" strokeWidth={2} />
      {text}
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] text-[#9E9E9E] font-bold uppercase tracking-wider">
        {label}
      </span>
      <span className="text-[11px] text-[#212121] font-medium">{value}</span>
    </div>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ");
}

export default ProfileCard;
