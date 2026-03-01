/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Life Details Grid
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 2-column grid of key life details:
 *   Location, Education, Career, Family Type, Diet, Religion
 *
 * Each item: icon + label + value, with pencil "Edit" button.
 * Comic-book aesthetic: dashed dividers, thick borders, 8px grid.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import {
  MapPin,
  GraduationCap,
  Briefcase,
  Users,
  Leaf,
  Heart,
  Pencil,
  type LucideIcon,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface LifeDetail {
  id: string;
  icon: LucideIcon;
  label: string;
  value: string;
}

export interface LifeDetailsProps {
  details: LifeDetail[];
  onEdit?: () => void;
  className?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function LifeDetails({ details, onEdit, className }: LifeDetailsProps) {
  return (
    <section className={cn("", className)} aria-label="Life details">
      {/* Section header */}
      <div className="flex items-center justify-between px-4 py-2">
        <h2 className="text-[10px] font-heading font-bold text-[#9E9E9E] uppercase tracking-widest m-0">
          Life Details
        </h2>
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex items-center gap-1 text-[8px] font-heading font-bold text-black uppercase tracking-wider cursor-pointer hover:underline"
            aria-label="Edit life details"
          >
            <Pencil className="w-3 h-3" strokeWidth={2} />
            Edit
          </button>
        )}
      </div>

      {/* Grid card */}
      <div className="mx-4 border-[2px] border-black bg-[#F8F8F8] shadow-[4px_4px_0px_#000000]">
        <div className="grid grid-cols-2">
          {details.map((d, i) => {
            const Icon = d.icon;
            // Add dashed borders for grid separation
            const isOdd = i % 2 === 1;
            const isNotLastRow = i < details.length - 2;
            return (
              <div
                key={d.id}
                className={cn(
                  "px-3 py-3",
                  isOdd && "border-l border-dashed border-black",
                  isNotLastRow && "border-b border-dashed border-black",
                )}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="w-3 h-3 text-[#9E9E9E]" strokeWidth={2} />
                  <span className="text-[8px] font-bold text-[#9E9E9E] uppercase tracking-wider">
                    {d.label}
                  </span>
                </div>
                <p className="text-xs font-heading font-bold text-[#212121] m-0 leading-snug">
                  {d.value || "—"}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Helper: build default details from profile data ─────────────────────────

export function buildLifeDetails(data: {
  city: string;
  education: string;
  career: string;
  familyType: string;
  diet: string;
  religion: string;
}): LifeDetail[] {
  return [
    { id: "city", icon: MapPin, label: "Location", value: data.city },
    { id: "edu", icon: GraduationCap, label: "Education", value: data.education },
    { id: "career", icon: Briefcase, label: "Career", value: data.career },
    { id: "family", icon: Users, label: "Family", value: data.familyType },
    { id: "diet", icon: Leaf, label: "Diet", value: data.diet },
    { id: "religion", icon: Heart, label: "Religion", value: data.religion },
  ];
}

export default LifeDetails;
