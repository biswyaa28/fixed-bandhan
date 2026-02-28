/**
 * Bandhan AI — Profile Visitors
 * Who viewed your profile list.
 * Blurred photos for non-matches, premium upsell for full history.
 */

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Crown, Clock, Heart, Shield, User } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

// ─── Types ───────────────────────────────────────────────────────────────
export interface ProfileVisitor {
  id: string;
  name: string;
  age: number;
  city: string;
  avatarUrl?: string;
  verificationLevel: "bronze" | "silver" | "gold";
  visitedAt: string;
  isMatched: boolean;
}

export interface ProfileVisitorsProps {
  visitors?: ProfileVisitor[];
  isPremium?: boolean;
  onMatch?: (visitorId: string) => void;
  onUpgrade?: () => void;
  language?: "en" | "hi";
  className?: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────
const MOCK_VISITORS: ProfileVisitor[] = [
  { id: "v1", name: "Ananya", age: 26, city: "Mumbai", verificationLevel: "gold", visitedAt: new Date(Date.now() - 2 * 3600000).toISOString(), isMatched: false },
  { id: "v2", name: "Priya", age: 28, city: "Delhi", verificationLevel: "silver", visitedAt: new Date(Date.now() - 5 * 3600000).toISOString(), isMatched: true },
  { id: "v3", name: "Meera", age: 25, city: "Bangalore", verificationLevel: "bronze", visitedAt: new Date(Date.now() - 12 * 3600000).toISOString(), isMatched: false },
  { id: "v4", name: "Sneha", age: 27, city: "Pune", verificationLevel: "silver", visitedAt: new Date(Date.now() - 24 * 3600000).toISOString(), isMatched: false },
  { id: "v5", name: "Ritu", age: 29, city: "Jaipur", verificationLevel: "gold", visitedAt: new Date(Date.now() - 48 * 3600000).toISOString(), isMatched: true },
];

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const BADGE_CONFIG = {
  bronze: { bg: "bg-[#E0E0E0]", text: "text-black", letter: "B" },
  silver: { bg: "bg-[#9E9E9E]", text: "text-black", letter: "S" },
  gold: { bg: "bg-[#424242]", text: "text-white", letter: "G" },
};

// ─── Component ───────────────────────────────────────────────────────────
export function ProfileVisitors({
  visitors: visitorsProp,
  isPremium = false,
  onMatch,
  onUpgrade,
  language = "en",
  className,
}: ProfileVisitorsProps) {
  const [visitors, setVisitors] = useState<ProfileVisitor[]>(
    visitorsProp || MOCK_VISITORS,
  );

  useEffect(() => {
    if (visitorsProp) setVisitors(visitorsProp);
  }, [visitorsProp]);

  const displayVisitors = isPremium ? visitors : visitors.slice(0, 5);

  if (visitors.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <div className="w-16 h-16 mx-auto mb-4 bg-[#F8F8F8] border-2 border-black flex items-center justify-center">
          <Eye className="w-8 h-8 text-[#9E9E9E]" strokeWidth={1.5} />
        </div>
        <p className="text-sm font-heading font-bold text-[#424242] uppercase m-0">
          {language === "en" ? "No Visitors Yet" : "अभी तक कोई विज़िटर नहीं"}
        </p>
        <p className="text-xs text-[#9E9E9E] m-0 mt-2 max-w-[240px] mx-auto">
          {language === "en"
            ? "Complete your profile to attract more visitors"
            : "अधिक विज़िटर आकर्षित करने के लिए अपनी प्रोफ़ाइल पूरी करें"}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-[#424242]" strokeWidth={2.5} />
          <span className="text-xs font-heading font-bold text-black uppercase tracking-wider">
            {language === "en" ? "Profile Visitors" : "प्रोफ़ाइल विज़िटर"}
          </span>
          <span className="px-1.5 py-0.5 bg-black text-white text-[9px] font-pixel font-bold border-2 border-black leading-none">
            {visitors.length}
          </span>
        </div>
      </div>

      {/* Visitor list */}
      <div className="space-y-2">
        {displayVisitors.map((visitor, i) => {
          const badge = BADGE_CONFIG[visitor.verificationLevel];
          const showBlurred = !visitor.isMatched && !isPremium;

          return (
            <motion.div
              key={visitor.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "flex items-center justify-between p-3",
                "border-2 border-black bg-white",
                "shadow-[2px_2px_0px_#000000]",
              )}
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {visitor.avatarUrl && !showBlurred ? (
                    <img
                      src={visitor.avatarUrl}
                      alt={visitor.name}
                      className="w-10 h-10 object-cover border-2 border-black"
                    />
                  ) : (
                    <div
                      className={cn(
                        "w-10 h-10 border-2 border-black flex items-center justify-center",
                        showBlurred ? "bg-[#E0E0E0]" : "bg-[#F8F8F8]",
                      )}
                    >
                      {showBlurred ? (
                        <span className="text-[9px] font-pixel text-[#9E9E9E]">?</span>
                      ) : (
                        <User className="w-5 h-5 text-[#9E9E9E]" strokeWidth={2} />
                      )}
                    </div>
                  )}
                  {/* Badge */}
                  <div
                    className={cn(
                      "absolute -bottom-1 -right-1 w-4 h-4 border-[1.5px] border-black flex items-center justify-center",
                      "text-[6px] font-pixel font-bold leading-none",
                      badge.bg, badge.text,
                    )}
                  >
                    {badge.letter}
                  </div>
                </div>

                {/* Info */}
                <div>
                  <p className="text-xs font-heading font-bold text-black uppercase m-0 leading-tight">
                    {showBlurred ? "••••••" : visitor.name}, {visitor.age}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-[#9E9E9E]">{visitor.city}</span>
                    <span className="text-[10px] text-[#9E9E9E]">·</span>
                    <span className="text-[10px] text-[#9E9E9E] flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" strokeWidth={2} />
                      {formatTimeAgo(visitor.visitedAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action */}
              {!visitor.isMatched ? (
                showBlurred ? (
                  <button
                    onClick={onUpgrade}
                    className={cn(
                      "px-3 py-1.5 flex items-center gap-1",
                      "bg-[#424242] text-white border-2 border-black",
                      "text-[10px] font-heading font-bold uppercase",
                      "cursor-pointer shadow-[1px_1px_0px_#000000]",
                      "hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none",
                      "transition-[transform,box-shadow] duration-150",
                    )}
                  >
                    <Crown className="w-3 h-3" strokeWidth={2.5} />
                    Reveal
                  </button>
                ) : (
                  <button
                    onClick={() => onMatch?.(visitor.id)}
                    className={cn(
                      "px-3 py-1.5 flex items-center gap-1",
                      "bg-white text-black border-2 border-black",
                      "text-[10px] font-heading font-bold uppercase",
                      "cursor-pointer shadow-[2px_2px_0px_#000000]",
                      "hover:bg-black hover:text-white",
                      "hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000]",
                      "transition-[transform,box-shadow,background,color] duration-150",
                    )}
                  >
                    <Heart className="w-3 h-3" strokeWidth={2.5} />
                    Match
                  </button>
                )
              ) : (
                <span className="text-[10px] font-heading font-bold text-[#9E9E9E] uppercase px-2">
                  Matched ✓
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Premium upsell */}
      {!isPremium && visitors.length > 5 && (
        <button
          onClick={onUpgrade}
          className={cn(
            "w-full p-4 border-2 border-dashed border-black bg-[#F8F8F8]",
            "flex items-center justify-center gap-2",
            "cursor-pointer hover:bg-[#E0E0E0]",
          )}
        >
          <Crown className="w-4 h-4 text-[#424242]" strokeWidth={2} />
          <span className="text-xs font-heading font-bold text-[#424242] uppercase">
            {language === "en"
              ? `See all ${visitors.length} visitors — Go Premium`
              : `सभी ${visitors.length} विज़िटर देखें — प्रीमियम`}
          </span>
        </button>
      )}
    </div>
  );
}

export default ProfileVisitors;
