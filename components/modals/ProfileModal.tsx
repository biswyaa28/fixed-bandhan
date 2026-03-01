/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Profile Modal (Full Profile View)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Full-screen modal with:
 *   • Photo carousel with arrow navigation + counter
 *   • Name, age, city, verification badge, intent tag
 *   • Life details grid (Education, Career, Family, Diet, etc.)
 *   • Match Insights accordion (Why you matched)
 *   • Action buttons: Like, Special Interest, Pass (fixed bottom)
 *   • Close button (X) top right
 *
 * Comic-book aesthetic: 4px black border, black header, hard shadow,
 * 0px radius, monochromatic palette.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  Star,
  Shield,
  ShieldCheck,
  MapPin,
  GraduationCap,
  Briefcase,
  Home,
  Utensils,
  Ruler,
  Globe,
  ChevronDown,
  Sparkles,
  Mic,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

// ─── Types ───────────────────────────────────────────────────────────────

export interface ProfileModalProfile {
  id: string;
  name: string;
  age: number;
  city: string;
  initials: string;
  gradientFrom: string;
  gradientTo: string;
  verificationLevel: "bronze" | "silver" | "gold";
  intent: string;
  compatibility: number;
  bio: string;
  education: string;
  career: string;
  family: string;
  diet: string;
  height?: string;
  motherTongue?: string;
  religion?: string;
  /** Life story prompts */
  prompts?: { question: string; answer: string }[];
  /** Compatibility factors */
  matchFactors?: {
    label: string;
    strength: 1 | 2 | 3 | 4 | 5;
    description: string;
  }[];
}

export interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileModalProfile | null;
  onLike?: (id: string) => void;
  onSpecialInterest?: (id: string) => void;
  onPass?: (id: string) => void;
}

// ─── Verification Badge ──────────────────────────────────────────────────

const VERIF = {
  bronze: { bg: "#FDF4E8", color: "#CD7F32", letter: "B", label: "Phone Verified" },
  silver: { bg: "#F5F5F5", color: "#C0C0C0", letter: "S", label: "ID Verified" },
  gold: { bg: "#FFFEF0", color: "#FFD700", letter: "G", label: "Gold Verified" },
} as const;

function Badge({ level }: { level: "bronze" | "silver" | "gold" }) {
  const v = VERIF[level];
  const isGold = level === "gold";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 border-[2px] font-heading font-bold text-[8px] uppercase tracking-wider",
        isGold && "perfect-match-pulse",
      )}
      style={{ backgroundColor: v.bg, borderColor: v.color, color: v.color }}
      aria-label={v.label}
    >
      <ShieldCheck className="w-3 h-3" strokeWidth={2.5} style={{ color: v.color }} />
      {v.label}
    </span>
  );
}

// ─── Photo Carousel ──────────────────────────────────────────────────────

function PhotoCarousel({
  initials,
  gradientFrom,
  gradientTo,
  name,
}: {
  initials: string;
  gradientFrom: string;
  gradientTo: string;
  name: string;
}) {
  // Simulated multi-photo with initials blocks
  const [idx, setIdx] = useState(0);
  const total = 3; // Simulated photo count

  const prev = useCallback(() => setIdx((i) => (i - 1 + total) % total), []);
  const next = useCallback(() => setIdx((i) => (i + 1) % total), []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [prev, next]);

  return (
    <div className="relative h-64 sm:h-72 border-b-[2px] border-black">
      {/* Photo area (initials block placeholder) */}
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
      >
        <span className="text-6xl font-heading font-bold text-black/30 select-none">
          {initials}
        </span>
      </div>

      {/* Nav arrows */}
      {total > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border-[2px] border-black shadow-[2px_2px_0px_#000000] flex items-center justify-center cursor-pointer hover:bg-[#F8F8F8]"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-4 h-4 text-black" strokeWidth={2.5} />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border-[2px] border-black shadow-[2px_2px_0px_#000000] flex items-center justify-center cursor-pointer hover:bg-[#F8F8F8]"
            aria-label="Next photo"
          >
            <ChevronRight className="w-4 h-4 text-black" strokeWidth={2.5} />
          </button>
        </>
      )}

      {/* Counter */}
      {total > 1 && (
        <div className="absolute top-3 right-3 px-2 py-1 bg-white border-[2px] border-black text-[8px] font-bold text-black">
          {idx + 1} / {total}
        </div>
      )}

      {/* Dots */}
      {total > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={cn(
                "h-1.5 border border-black cursor-pointer",
                i === idx ? "w-5 bg-black" : "w-1.5 bg-white",
              )}
              aria-label={`Photo ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Life Details Grid ───────────────────────────────────────────────────

function DetailCell({
  icon: Icon,
  label,
  value,
  isLast,
}: {
  icon: typeof GraduationCap;
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <div className={cn("px-3 py-2.5", !isLast && "border-b border-dashed border-[#E0E0E0]")}>
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-[#9E9E9E]" strokeWidth={2} />
        <span className="text-[8px] text-[#9E9E9E] uppercase tracking-widest font-bold">{label}</span>
      </div>
      <p className="text-xs font-bold text-[#212121] m-0 mt-0.5">{value}</p>
    </div>
  );
}

// ─── Match Insights Accordion ────────────────────────────────────────────

function MatchInsightsAccordion({
  score,
  factors,
}: {
  score: number;
  factors: { label: string; strength: 1 | 2 | 3 | 4 | 5; description: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-[2px] border-black bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[#F8F8F8] transition-colors duration-100"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-black" strokeWidth={2} />
          <span className="text-[10px] font-heading font-bold text-black uppercase tracking-widest">
            Compatibility Insights
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-black text-white text-[8px] font-bold border border-black">
            {score}% Match
          </span>
          <ChevronDown
            className={cn("w-4 h-4 text-[#9E9E9E] transition-transform duration-200", open && "rotate-180")}
            strokeWidth={2}
          />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t-[2px] border-black">
              {factors.map((f, i) => (
                <div
                  key={f.label}
                  className={cn(
                    "px-4 py-2.5",
                    i < factors.length - 1 && "border-b border-dashed border-[#E0E0E0]",
                  )}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-heading font-bold text-[#212121]">{f.label}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, d) => (
                        <span
                          key={d}
                          className={cn(
                            "w-2 h-2 border border-black",
                            d < f.strength ? "bg-black" : "bg-[#E0E0E0]",
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-[10px] text-[#9E9E9E] m-0">{f.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────

export function ProfileModal({
  isOpen,
  onClose,
  profile,
  onLike,
  onSpecialInterest,
  onPass,
}: ProfileModalProps) {
  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!profile) return null;

  const defaultFactors = [
    { label: "Intent Alignment", strength: 5 as const, description: "Both seeking marriage" },
    { label: "Shared Values", strength: 4 as const, description: "Family-oriented, similar lifestyle" },
    { label: "Location Match", strength: 3 as const, description: `Both in ${profile.city} area` },
    { label: "Lifestyle", strength: 4 as const, description: "Compatible diet and habits" },
    { label: "Education Level", strength: 3 as const, description: "Similar academic background" },
  ];

  const factors = profile.matchFactors ?? defaultFactors;

  const details: { icon: typeof GraduationCap; label: string; value: string }[] = [
    { icon: GraduationCap, label: "Education", value: profile.education },
    { icon: Briefcase, label: "Career", value: profile.career },
    { icon: Home, label: "Family", value: profile.family },
    { icon: Utensils, label: "Diet", value: profile.diet },
    ...(profile.height ? [{ icon: Ruler, label: "Height", value: profile.height }] : []),
    ...(profile.motherTongue ? [{ icon: Globe, label: "Mother Tongue", value: profile.motherTongue }] : []),
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "8px 8px",
            }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Full-screen modal card */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute inset-0 sm:inset-4 sm:left-auto sm:right-auto sm:mx-auto sm:max-w-[480px] bg-white border-4 border-black shadow-[8px_8px_0px_#000000] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label={`${profile.name}'s profile`}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-20 w-8 h-8 bg-white border-[2px] border-black shadow-[2px_2px_0px_#000000] flex items-center justify-center cursor-pointer hover:bg-[#F8F8F8]"
              aria-label="Close profile"
            >
              <X className="w-4 h-4 text-black" strokeWidth={3} />
            </button>

            {/* Photo carousel */}
            <PhotoCarousel
              initials={profile.initials}
              gradientFrom={profile.gradientFrom}
              gradientTo={profile.gradientTo}
              name={profile.name}
            />

            {/* Content */}
            <div className="pb-28">
              {/* Name + verification + intent */}
              <div className="px-4 py-4 border-b-[2px] border-black">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h2 className="text-lg font-heading font-bold text-black m-0">
                      {profile.name}, {profile.age}
                    </h2>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#9E9E9E]" strokeWidth={2} />
                      <span className="text-[10px] text-[#9E9E9E] uppercase tracking-wider">{profile.city}</span>
                    </div>
                  </div>
                  <Badge level={profile.verificationLevel} />
                </div>

                {/* Intent tag */}
                <span className="inline-flex items-center gap-1 px-2 py-1 border-[2px] border-black bg-[#F8F8F8] text-[9px] font-heading font-bold text-black uppercase tracking-wider">
                  <Heart className="w-3 h-3" strokeWidth={2} />
                  {profile.intent}
                </span>
              </div>

              {/* Bio */}
              {profile.bio && (
                <div className="px-4 py-3 border-b border-dashed border-[#E0E0E0]">
                  <p className="text-[10px] font-heading font-bold text-[#9E9E9E] uppercase tracking-widest m-0 mb-1">About</p>
                  <p className="text-xs text-[#424242] leading-relaxed m-0">{profile.bio}</p>
                </div>
              )}

              {/* Life details grid */}
              <div className="px-4 py-3 border-b-[2px] border-black">
                <p className="text-[10px] font-heading font-bold text-[#9E9E9E] uppercase tracking-widest m-0 mb-2">Life Details</p>
                <div className="border-[2px] border-black bg-[#F8F8F8]">
                  <div className="grid grid-cols-2">
                    {details.map((d, i) => {
                      const isRight = i % 2 === 1;
                      return (
                        <div
                          key={d.label}
                          className={cn(
                            "px-3 py-2.5",
                            isRight && "border-l border-dashed border-[#E0E0E0]",
                            i < details.length - 2 && "border-b border-dashed border-[#E0E0E0]",
                          )}
                        >
                          <div className="flex items-center gap-1 mb-0.5">
                            <d.icon className="w-3 h-3 text-[#9E9E9E]" strokeWidth={2} />
                            <span className="text-[7px] text-[#9E9E9E] uppercase tracking-widest font-bold">{d.label}</span>
                          </div>
                          <p className="text-xs font-bold text-[#212121] m-0">{d.value}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Life story prompts */}
              {profile.prompts && profile.prompts.length > 0 && (
                <div className="px-4 py-3 border-b border-dashed border-[#E0E0E0]">
                  <p className="text-[10px] font-heading font-bold text-[#9E9E9E] uppercase tracking-widest m-0 mb-2">Life Story</p>
                  <div className="space-y-2">
                    {profile.prompts.map((p, i) => (
                      <div key={i} className="border-[2px] border-black bg-[#F8F8F8] px-3 py-2">
                        <p className="text-[8px] text-[#9E9E9E] uppercase tracking-widest font-bold m-0 mb-0.5">{p.question}</p>
                        <p className="text-xs font-bold text-[#212121] m-0">{p.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Match Insights accordion */}
              <div className="px-4 py-3">
                <MatchInsightsAccordion score={profile.compatibility} factors={factors} />
              </div>
            </div>

            {/* Fixed bottom action buttons */}
            <div className="fixed bottom-0 left-0 right-0 sm:relative border-t-[3px] border-black bg-white safe-bottom z-10">
              <div className="flex">
                {/* Pass */}
                <button
                  onClick={() => { onPass?.(profile.id); onClose(); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3.5 border-r-[2px] border-black bg-white text-[10px] font-heading font-bold uppercase tracking-wider text-[#9E9E9E] cursor-pointer hover:bg-[#F8F8F8] transition-colors duration-100"
                  aria-label="Pass"
                >
                  <X className="w-4 h-4" strokeWidth={2} />
                  Pass
                </button>

                {/* Like */}
                <button
                  onClick={() => { onLike?.(profile.id); onClose(); }}
                  className="flex-[2] flex items-center justify-center gap-1.5 py-3.5 border-r-[2px] border-black bg-black text-white text-[10px] font-heading font-bold uppercase tracking-wider cursor-pointer hover:bg-[#424242] transition-colors duration-100"
                  aria-label="Send like"
                >
                  <Heart className="w-4 h-4" strokeWidth={2.5} />
                  Like
                </button>

                {/* Special Interest */}
                <button
                  onClick={() => { onSpecialInterest?.(profile.id); onClose(); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3.5 bg-[#FFFEF0] text-[10px] font-heading font-bold uppercase tracking-wider cursor-pointer hover:bg-[#FEF3C7] transition-colors duration-100"
                  style={{ color: "#FFD700" }}
                  aria-label="Send Special Interest"
                >
                  <Star className="w-4 h-4" strokeWidth={2.5} fill="#FFD700" />
                  Special
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default ProfileModal;
