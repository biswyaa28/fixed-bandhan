/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Star Rating Component
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Reusable 1-5 star rating with comic book styling.
 * Keyboard accessible (arrow keys + Enter).
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface RatingComponentProps {
  value: number;
  onChange: (rating: number) => void;
  size?: number;
  label?: string;
}

export default function RatingComponent({
  value,
  onChange,
  size = 28,
  label = "Rate your experience",
}: RatingComponentProps) {
  const [hovered, setHovered] = useState(0);

  const display = hovered || value;

  return (
    <div role="radiogroup" aria-label={label}>
      {label && (
        <p className="text-xs font-bold text-[#212121] mb-2 uppercase tracking-wider">
          {label}
        </p>
      )}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" && star < 5) onChange(star + 1);
              if (e.key === "ArrowLeft" && star > 1) onChange(star - 1);
            }}
            className="
              p-0.5
              transition-transform duration-100
              hover:scale-110
              active:scale-95
              focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2
            "
          >
            <Star
              size={size}
              strokeWidth={2.5}
              className={
                star <= display
                  ? "fill-[#212121] text-[#000000]"
                  : "fill-transparent text-[#E0E0E0]"
              }
            />
          </button>
        ))}
      </div>
      {value > 0 && (
        <p className="text-[10px] text-[#9E9E9E] mt-1">
          {value === 1 && "Poor"}
          {value === 2 && "Fair"}
          {value === 3 && "Good"}
          {value === 4 && "Great"}
          {value === 5 && "Excellent!"}
        </p>
      )}
    </div>
  );
}
