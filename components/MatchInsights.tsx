/**
 * Bandhan AI — Match Insights (Compatibility Breakdown)
 * Accordion section showing why two users matched.
 * Shows top 5 compatibility factors with strength indicators.
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, ChevronUp, Heart, MapPin, Target,
  Users, Utensils, GraduationCap, Sparkles,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

// ─── Types ───────────────────────────────────────────────────────────────
export interface CompatibilityFactor {
  id: string;
  label: string;
  labelHi: string;
  description: string;
  descriptionHi: string;
  strength: 1 | 2 | 3 | 4 | 5;
  icon: string;
}

export interface MatchInsightsProps {
  /** Overall compatibility percentage */
  compatibilityScore: number;
  /** Compatibility factors (max 5 shown) */
  factors: CompatibilityFactor[];
  language?: "en" | "hi";
  className?: string;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  heart: Heart,
  mappin: MapPin,
  target: Target,
  users: Users,
  utensils: Utensils,
  graduation: GraduationCap,
  sparkles: Sparkles,
};

/** Create mock factors for demo purposes */
export function createMockFactors(score: number): CompatibilityFactor[] {
  const factors: CompatibilityFactor[] = [
    {
      id: "f1", label: "Shared Values", labelHi: "साझा मूल्य",
      description: "You both value family time and personal growth",
      descriptionHi: "आप दोनों परिवार के समय और व्यक्तिगत विकास को महत्व देते हैं",
      strength: score > 80 ? 5 : score > 60 ? 4 : 3, icon: "heart",
    },
    {
      id: "f2", label: "Location Match", labelHi: "स्थान मिलान",
      description: "Both in the same city — easy to meet!",
      descriptionHi: "दोनों एक ही शहर में — मिलना आसान!",
      strength: 4, icon: "mappin",
    },
    {
      id: "f3", label: "Life Goals", labelHi: "जीवन लक्ष्य",
      description: "Similar intent: looking for marriage",
      descriptionHi: "समान इरादा: विवाह की तलाश",
      strength: score > 85 ? 5 : 4, icon: "target",
    },
    {
      id: "f4", label: "Family Background", labelHi: "पारिवारिक पृष्ठभूमि",
      description: "Compatible family values and traditions",
      descriptionHi: "संगत पारिवारिक मूल्य और परंपराएं",
      strength: 3, icon: "users",
    },
    {
      id: "f5", label: "Lifestyle", labelHi: "जीवनशैली",
      description: "Similar dietary preferences and habits",
      descriptionHi: "समान आहार प्राथमिकताएं और आदतें",
      strength: score > 70 ? 4 : 3, icon: "utensils",
    },
  ];
  return factors.slice(0, 5);
}

// ─── Strength Dots ───────────────────────────────────────────────────────
function StrengthDots({ strength }: { strength: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Strength: ${strength} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-2 h-2 border border-black",
            i < strength ? "bg-black" : "bg-white",
          )}
        />
      ))}
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────
export function MatchInsights({
  compatibilityScore,
  factors,
  language = "en",
  className,
}: MatchInsightsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Don't show for weak matches
  if (compatibilityScore < 60) return null;

  const displayFactors = factors.slice(0, 5);

  return (
    <div
      className={cn(
        "border-2 border-black bg-white shadow-[2px_2px_0px_#000000]",
        className,
      )}
    >
      {/* ── Accordion Header ── */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center justify-between p-4",
          "bg-transparent border-none cursor-pointer text-left",
        )}
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-[#424242]" strokeWidth={2.5} />
          <span className="text-xs font-heading font-bold text-black uppercase tracking-wider">
            {language === "en" ? "Compatibility Insights" : "अनुकूलता विवरण"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Score badge */}
          <span className="px-2 py-1 bg-black text-white border-2 border-black text-[10px] font-pixel font-bold leading-none">
            {compatibilityScore}%
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-[#424242]" strokeWidth={2} />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#424242]" strokeWidth={2} />
          )}
        </div>
      </button>

      {/* ── Expanded Content ── */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-dashed border-black pt-4 space-y-3">
              {displayFactors.map((factor) => {
                const Icon = ICON_MAP[factor.icon] || Sparkles;
                return (
                  <div key={factor.id} className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-[#F8F8F8] border-2 border-black">
                      <Icon className="w-4 h-4 text-black" strokeWidth={2} />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-heading font-bold text-black uppercase">
                          {language === "en" ? factor.label : factor.labelHi}
                        </span>
                        <StrengthDots strength={factor.strength} />
                      </div>
                      <p className="text-xs text-[#424242] m-0 leading-normal">
                        {language === "en" ? factor.description : factor.descriptionHi}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MatchInsights;
