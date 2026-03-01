/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Optimized Image Component
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Enforces production-grade image best practices:
 *   • next/image for automatic AVIF/WebP, lazy loading, responsive sizing
 *   • Network-aware quality: 80 on 4G, 60 on 3G, 40 on 2G
 *   • Placeholder blur (data URL or CSS)
 *   • Priority flag for above-the-fold images (LCP)
 *   • Correct sizes attribute for accurate responsive loading
 *   • 2px comic-book border style when bordered=true
 *
 * NEVER use <img> directly — always use this component or next/image.
 *
 * @example
 *   <OptimizedImage
 *     src="/photos/profile.jpg"
 *     alt="Priya's profile photo"
 *     width={400}
 *     height={400}
 *     priority  // above-the-fold → no lazy loading
 *     bordered  // comic-book 2px black border
 *   />
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import Image, { type ImageProps } from "next/image";
import { memo, useState, useCallback } from "react";
import { getImageQuality, shouldReduceData } from "@/lib/performance";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

// ── 1x1 transparent pixel as default blurDataURL ─────────────────────────
const BLUR_PLACEHOLDER =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88OjpfwAI+QN53cRKkQAAAABJRU5ErkJggg==";

export interface OptimizedImageProps
  extends Omit<ImageProps, "quality" | "placeholder" | "blurDataURL"> {
  /** Show 2px comic-book black border */
  bordered?: boolean;
  /** Custom blur data URL (overrides default) */
  blurDataURL?: string;
  /** Show hard 8-bit shadow on the image container */
  shadow?: boolean;
  /** Fallback displayed when image fails to load */
  fallbackSrc?: string;
}

/**
 * Optimized Image — wraps next/image with performance defaults.
 *
 * Memoised with React.memo to prevent unnecessary re-renders
 * when parent components update.
 */
export const OptimizedImage = memo(function OptimizedImage({
  bordered = false,
  shadow = false,
  blurDataURL,
  fallbackSrc,
  className,
  alt,
  onError,
  ...props
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);

  // Network-aware quality
  const quality = getImageQuality();
  const isLowData = shouldReduceData();

  const handleError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setHasError(true);
      onError?.(e);
    },
    [onError],
  );

  // If the image failed and we have a fallback, use it
  const src = hasError && fallbackSrc ? fallbackSrc : props.src;

  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      quality={quality}
      loading={props.priority ? undefined : "lazy"}
      placeholder={props.fill || typeof src !== "string" ? undefined : "blur"}
      blurDataURL={blurDataURL ?? BLUR_PLACEHOLDER}
      // On 2G, load the smallest possible device size
      sizes={
        props.sizes ??
        (isLowData
          ? "(max-width: 640px) 50vw, 33vw"
          : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw")
      }
      className={cn(
        bordered && "border-2 border-black",
        shadow && "shadow-[4px_4px_0px_#000000]",
        className,
      )}
      onError={handleError}
    />
  );
});

/**
 * Profile Photo — pre-configured for the most common image use case.
 * Square aspect ratio, bordered, with avatar fallback.
 */
export const ProfilePhoto = memo(function ProfilePhoto({
  src,
  alt,
  size = 64,
  priority = false,
  className,
}: {
  src: string | null | undefined;
  alt: string;
  size?: number;
  priority?: boolean;
  className?: string;
}) {
  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(alt)}&size=${size}&background=F8F8F8&color=212121&bold=true&format=svg`;

  return (
    <OptimizedImage
      src={src || fallback}
      alt={alt}
      width={size}
      height={size}
      bordered
      priority={priority}
      fallbackSrc={fallback}
      className={cn("object-cover", className)}
    />
  );
});

export default OptimizedImage;
