"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

// ─── Variant Definitions (0px radius comic panels) ───────────────────────
const cardVariants = {
  default: cn(
    "bg-[#F8F8F8] pixel-grid",
    "border-2 border-black",
    "shadow-[4px_4px_0px_#000000]",
  ),
  flat: cn("bg-[#F8F8F8]", "border-2 border-black"),
  raised: cn(
    "bg-white",
    "border-[3px] border-black",
    "shadow-[6px_6px_0px_#000000]",
  ),
  panel: cn(
    "bg-[#F8F8F8] pixel-grid",
    "border-[3px] border-black",
    "shadow-[4px_4px_0px_#000000]",
  ),
  dark: cn(
    "bg-[#212121] text-white",
    "border-[3px] border-black",
    "shadow-[4px_4px_0px_#000000]",
  ),
  premium: cn(
    "bg-[#424242] text-white",
    "border-[3px] border-black",
    "shadow-[6px_6px_0px_#000000]",
  ),
} as const;

// ─── Card Types ──────────────────────────────────────────────────────────
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof cardVariants;
  hoverable?: boolean;
  pressable?: boolean;
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  children: ReactNode;
}

// Padding: strict 8px grid
const paddingMap = {
  none: "",
  sm: "p-2", // 8px
  md: "p-4", // 16px
  lg: "p-6", // 24px  (spec: card padding = 24px)
  xl: "p-8", // 32px
};

// ─── Card Component ──────────────────────────────────────────────────────
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "default",
      hoverable = false,
      pressable = false,
      padding = "lg",
      children,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base: sharp 0px radius for 8-bit panels
          "relative overflow-hidden",
          cardVariants[variant],
          paddingMap[padding],
          // Hover: smooth press-in (translate 2px, shadow shrinks)
          hoverable &&
            cn(
              "cursor-pointer",
              "transition-[transform,box-shadow] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]",
              "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000]",
            ),
          // Press: full inset
          pressable &&
            cn(
              "cursor-pointer",
              "active:!translate-x-[2px] active:!translate-y-[2px] active:!shadow-[inset_2px_2px_0px_rgba(0,0,0,0.2)]",
            ),
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = "Card";

// ─── Card Sub-components (pixel-perfect spacing) ─────────────────────────

export function CardHeader({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-between",
        "pb-3 mb-4",
        "border-b-2 border-black",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardBody({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex-1 text-[#212121] leading-relaxed", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center gap-4",
        "pt-4 mt-4",
        "border-t border-dashed border-black",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── Profile Card ────────────────────────────────────────────────────────
export interface ProfileCardProps {
  name: string;
  age?: number;
  location?: string;
  imageUrl?: string;
  verified?: boolean;
  children?: ReactNode;
  onLike?: () => void;
  onPass?: () => void;
  onVoiceNote?: () => void;
  className?: string;
}

export function ProfileCard({
  name,
  age,
  location,
  imageUrl,
  verified,
  children,
  className,
}: ProfileCardProps) {
  return (
    <Card
      variant="raised"
      hoverable
      pressable
      padding="none"
      className={cn("overflow-hidden", className)}
    >
      {imageUrl && (
        <div className="relative aspect-[3/4] w-full overflow-hidden border-b-[3px] border-black">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center gap-2">
              <h3 className="text-h4 font-heading font-bold text-white uppercase tracking-wide">
                {name}
                {age && (
                  <span className="font-normal text-white/80">, {age}</span>
                )}
              </h3>
              {verified && (
                <span className="w-6 h-6 bg-white border-2 border-black flex items-center justify-center text-[10px] font-pixel font-bold">
                  ✓
                </span>
              )}
            </div>
            {location && (
              <p className="text-body-sm text-white/70 mt-1 font-bold uppercase tracking-wider">
                {location}
              </p>
            )}
          </div>
        </div>
      )}
      {children && <div className="p-6">{children}</div>}
    </Card>
  );
}

// ─── Skeleton Card ───────────────────────────────────────────────────────
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <Card variant="flat" padding="lg" className={className}>
      <div className="w-full aspect-[3/4] shimmer-bg border-2 border-[#E0E0E0] mb-4" />
      <div className="h-6 w-3/4 shimmer-bg border border-[#E0E0E0] mb-2" />
      <div className="h-4 w-1/2 shimmer-bg border border-[#E0E0E0] mb-4" />
      <div className="flex gap-4">
        <div className="h-12 w-12 shimmer-bg border-2 border-[#E0E0E0]" />
        <div className="h-12 w-12 shimmer-bg border-2 border-[#E0E0E0]" />
        <div className="h-12 w-12 shimmer-bg border-2 border-[#E0E0E0]" />
      </div>
    </Card>
  );
}

export default Card;
