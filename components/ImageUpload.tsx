/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Image Upload Component (Comic Book / 8-Bit)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Multi-photo uploader for profile photos with:
 *   • Drag-and-drop support
 *   • Click-to-browse fallback
 *   • Client-side compression preview (before upload)
 *   • Per-slot progress bars
 *   • Reorder / set-primary / delete
 *   • Max 5 photos enforced in UI
 *   • Comic book thick-border monochrome aesthetic
 *   • Accessible: keyboard nav, ARIA labels, screen reader text
 *
 * Also exports a compact ChatPhotoUpload for in-chat image sending.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useRef, useCallback, useEffect, type ChangeEvent, type DragEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ImagePlus,
  X,
  Star,
  Upload,
  Loader2,
  AlertTriangle,
  Check,
  Trash2,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import {
  uploadProfilePhoto,
  uploadChatPhoto,
  deleteFile,
  compressImage,
  type UploadResult,
  type UploadProgress,
  type StorageServiceError,
} from "@/lib/firebase/storage";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

// ─── Types ───────────────────────────────────────────────────────────────

export interface ExistingPhoto {
  url: string;
  storagePath?: string;
  isPrimary?: boolean;
}

export interface ImageUploadProps {
  /** Current user UID */
  userId: string;
  /** Already-uploaded photos */
  existingPhotos?: ExistingPhoto[];
  /** Max number of photo slots (default 5) */
  maxPhotos?: number;
  /** Called after a successful upload */
  onUploadComplete?: (result: UploadResult, index: number) => void;
  /** Called after a photo is deleted */
  onDelete?: (index: number, storagePath?: string) => void;
  /** Called when a photo is set as primary */
  onSetPrimary?: (index: number) => void;
  /** Whether the whole grid is disabled */
  disabled?: boolean;
}

interface PhotoSlot {
  /** Preview (local object URL or existing remote URL) */
  previewUrl: string | null;
  /** Storage path for deletion */
  storagePath: string | null;
  /** Upload progress 0–100 or null if not uploading */
  progress: number | null;
  /** Whether this is the primary photo */
  isPrimary: boolean;
  /** Error message if upload failed */
  error: string | null;
  /** Whether upload completed */
  uploaded: boolean;
}

const EMPTY_SLOT: PhotoSlot = {
  previewUrl: null,
  storagePath: null,
  progress: null,
  isPrimary: false,
  error: null,
  uploaded: false,
};

// ─── Helpers ─────────────────────────────────────────────────────────────

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ═══════════════════════════════════════════════════════════════════════════
// PROFILE IMAGE UPLOAD GRID
// ═══════════════════════════════════════════════════════════════════════════

export function ImageUpload({
  userId,
  existingPhotos = [],
  maxPhotos = 5,
  onUploadComplete,
  onDelete,
  onSetPrimary,
  disabled = false,
}: ImageUploadProps) {
  // ── Initialise slots from existing photos ──
  const [slots, setSlots] = useState<PhotoSlot[]>(() => {
    const initial: PhotoSlot[] = existingPhotos.map((p, i) => ({
      previewUrl: p.url,
      storagePath: p.storagePath ?? null,
      progress: null,
      isPrimary: p.isPrimary ?? i === 0,
      error: null,
      uploaded: true,
    }));
    while (initial.length < maxPhotos) initial.push({ ...EMPTY_SLOT });
    return initial.slice(0, maxPhotos);
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // ── Sync external changes ──
  useEffect(() => {
    setSlots((prev) => {
      const next: PhotoSlot[] = existingPhotos.map((p, i) => ({
        previewUrl: p.url,
        storagePath: p.storagePath ?? null,
        progress: null,
        isPrimary: p.isPrimary ?? i === 0,
        error: null,
        uploaded: true,
      }));
      // Preserve in-progress slots
      for (let i = next.length; i < prev.length && i < maxPhotos; i++) {
        next.push(prev[i].progress !== null ? prev[i] : { ...EMPTY_SLOT });
      }
      while (next.length < maxPhotos) next.push({ ...EMPTY_SLOT });
      return next.slice(0, maxPhotos);
    });
  }, [existingPhotos, maxPhotos]);

  // ── Upload a file to a specific slot ──
  const uploadToSlot = useCallback(
    async (file: File, slotIndex: number) => {
      // Generate local preview immediately
      const localUrl = URL.createObjectURL(file);
      setSlots((prev) => {
        const next = [...prev];
        next[slotIndex] = {
          previewUrl: localUrl,
          storagePath: null,
          progress: 0,
          isPrimary: prev[slotIndex].isPrimary,
          error: null,
          uploaded: false,
        };
        return next;
      });

      try {
        const currentCount = slots.filter((s) => s.uploaded).length;
        const result = await uploadProfilePhoto(userId, file, slotIndex, currentCount, {
          onProgress: (p: UploadProgress) => {
            setSlots((prev) => {
              const next = [...prev];
              next[slotIndex] = { ...next[slotIndex], progress: p.percent };
              return next;
            });
          },
        });

        setSlots((prev) => {
          const next = [...prev];
          next[slotIndex] = {
            previewUrl: result.downloadUrl,
            storagePath: result.storagePath,
            progress: null,
            isPrimary: prev[slotIndex].isPrimary,
            error: null,
            uploaded: true,
          };
          return next;
        });

        URL.revokeObjectURL(localUrl);
        onUploadComplete?.(result, slotIndex);
      } catch (err) {
        const e = err as StorageServiceError;
        setSlots((prev) => {
          const next = [...prev];
          next[slotIndex] = {
            previewUrl: localUrl,
            storagePath: null,
            progress: null,
            isPrimary: false,
            error: e.en || "Upload failed.",
            uploaded: false,
          };
          return next;
        });
      }
    },
    [userId, slots, onUploadComplete],
  );

  // ── Handle file selection ──
  const handleFileSelect = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || activeSlot === null) return;
      uploadToSlot(file, activeSlot);
      // Clear input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [activeSlot, uploadToSlot],
  );

  // ── Handle slot click ──
  const handleSlotClick = useCallback(
    (index: number) => {
      if (disabled) return;
      if (slots[index].uploaded) return; // Already has photo — show actions instead
      setActiveSlot(index);
      fileInputRef.current?.click();
    },
    [disabled, slots],
  );

  // ── Handle delete ──
  const handleDelete = useCallback(
    async (index: number) => {
      const slot = slots[index];
      if (slot.storagePath) {
        try {
          await deleteFile(slot.storagePath);
        } catch {
          /* best-effort */
        }
      }
      if (slot.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(slot.previewUrl);
      }
      setSlots((prev) => {
        const next = [...prev];
        next[index] = { ...EMPTY_SLOT };
        return next;
      });
      onDelete?.(index, slot.storagePath ?? undefined);
    },
    [slots, onDelete],
  );

  // ── Set primary ──
  const handleSetPrimary = useCallback(
    (index: number) => {
      setSlots((prev) =>
        prev.map((s, i) => ({ ...s, isPrimary: i === index })),
      );
      onSetPrimary?.(index);
    },
    [onSetPrimary],
  );

  // ── Drag and drop ──
  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (!file?.type.startsWith("image/")) return;
      // Find first empty slot
      const emptyIndex = slots.findIndex((s) => !s.previewUrl && s.progress === null);
      if (emptyIndex === -1) return;
      uploadToSlot(file, emptyIndex);
    },
    [slots, uploadToSlot],
  );

  const uploadedCount = slots.filter((s) => s.uploaded).length;

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        className="hidden"
        onChange={handleFileSelect}
        aria-hidden="true"
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <label className="text-[10px] font-bold text-[#424242] uppercase tracking-wider">
          Photos ({uploadedCount}/{maxPhotos})
        </label>
        {isDragging && (
          <span className="text-[9px] font-bold text-black uppercase tracking-wider animate-pulse">
            Drop here!
          </span>
        )}
      </div>

      {/* Grid */}
      <div className={cn(
        "grid gap-2",
        maxPhotos <= 3 ? "grid-cols-3" : "grid-cols-3 sm:grid-cols-5",
      )}>
        {slots.map((slot, i) => (
          <PhotoSlotCard
            key={i}
            index={i}
            slot={slot}
            disabled={disabled}
            onClick={() => handleSlotClick(i)}
            onDelete={() => handleDelete(i)}
            onSetPrimary={() => handleSetPrimary(i)}
          />
        ))}
      </div>

      {/* Help text */}
      <p className="mt-2 text-[9px] text-[#9E9E9E]">
        JPEG, PNG, or WebP · Max 500 KB after compression · Drag &amp; drop supported
      </p>
    </div>
  );
}

// ─── Single photo slot ───────────────────────────────────────────────────

function PhotoSlotCard({
  index,
  slot,
  disabled,
  onClick,
  onDelete,
  onSetPrimary,
}: {
  index: number;
  slot: PhotoSlot;
  disabled: boolean;
  onClick: () => void;
  onDelete: () => void;
  onSetPrimary: () => void;
}) {
  const isEmpty = !slot.previewUrl && slot.progress === null;
  const isUploading = slot.progress !== null;
  const hasError = !!slot.error;

  return (
    <div
      className={cn(
        "relative aspect-square",
        "border-2 border-black overflow-hidden",
        "transition-all duration-100",
        isEmpty && !disabled
          ? "cursor-pointer hover:bg-[#E0E0E0] bg-[#F8F8F8]"
          : slot.uploaded
            ? "bg-white"
            : "bg-[#F8F8F8]",
        hasError && "border-dashed",
      )}
      role={isEmpty ? "button" : undefined}
      tabIndex={isEmpty && !disabled ? 0 : undefined}
      aria-label={isEmpty ? `Upload photo to slot ${index + 1}` : `Photo ${index + 1}`}
      onClick={isEmpty ? onClick : undefined}
      onKeyDown={(e) => {
        if (isEmpty && !disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* ── Empty state ── */}
      {isEmpty && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <ImagePlus className="w-5 h-5 text-[#9E9E9E]" strokeWidth={2} />
          <span className="text-[8px] font-bold text-[#9E9E9E] uppercase tracking-wider">
            {index === 0 ? "Primary" : `Photo ${index + 1}`}
          </span>
        </div>
      )}

      {/* ── Preview image ── */}
      {slot.previewUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={slot.previewUrl}
          alt={`Photo ${index + 1}`}
          className={cn(
            "w-full h-full object-cover",
            isUploading && "opacity-60",
          )}
        />
      )}

      {/* ── Upload progress overlay ── */}
      {isUploading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70">
          <Loader2 className="w-5 h-5 text-black animate-spin mb-1" strokeWidth={2.5} />
          <span className="text-[10px] font-bold text-black">{slot.progress}%</span>
          {/* Progress bar */}
          <div className="absolute bottom-0 inset-x-0 h-1 bg-[#E0E0E0]">
            <motion.div
              className="h-full bg-black"
              initial={{ width: 0 }}
              animate={{ width: `${slot.progress}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
        </div>
      )}

      {/* ── Error overlay ── */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 p-2">
          <AlertTriangle className="w-4 h-4 text-black mb-1" strokeWidth={2.5} />
          <p className="text-[8px] text-[#424242] text-center font-bold leading-tight">
            {slot.error}
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="mt-1 text-[8px] font-bold text-[#9E9E9E] underline bg-transparent border-none cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Primary badge ── */}
      {slot.isPrimary && slot.uploaded && (
        <div className="absolute top-0.5 left-0.5 bg-black text-white px-1 py-0.5 flex items-center gap-0.5">
          <Star className="w-2.5 h-2.5" strokeWidth={2.5} fill="white" />
          <span className="text-[7px] font-bold uppercase tracking-wider">Primary</span>
        </div>
      )}

      {/* ── Upload success badge ── */}
      {slot.uploaded && !slot.isPrimary && (
        <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-black flex items-center justify-center">
          <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
        </div>
      )}

      {/* ── Action buttons (on uploaded photos) ── */}
      {slot.uploaded && (
        <div className="absolute bottom-0 inset-x-0 flex">
          {!slot.isPrimary && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSetPrimary();
              }}
              className={cn(
                "flex-1 py-1 bg-[#F8F8F8] border-t-2 border-r border-black",
                "text-[7px] font-bold text-[#424242] uppercase tracking-wider",
                "hover:bg-[#E0E0E0] transition-colors cursor-pointer",
              )}
              aria-label="Set as primary photo"
            >
              ★ Primary
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className={cn(
              "py-1 px-2 bg-[#F8F8F8] border-t-2 border-black",
              "hover:bg-[#E0E0E0] transition-colors cursor-pointer",
              slot.isPrimary && "flex-1",
            )}
            aria-label="Delete photo"
          >
            <Trash2 className="w-3 h-3 text-[#424242] mx-auto" strokeWidth={2.5} />
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CHAT PHOTO UPLOAD (compact, inline)
// ═══════════════════════════════════════════════════════════════════════════

export interface ChatPhotoUploadProps {
  /** Match ID for the conversation */
  matchId: string;
  /** Sender user ID */
  senderId: string;
  /** Called after successful upload with the download URL */
  onUploadComplete: (downloadUrl: string, storagePath: string) => void;
  /** Called on error */
  onError?: (error: StorageServiceError) => void;
  /** Whether the upload trigger is disabled */
  disabled?: boolean;
}

/**
 * Compact chat photo upload — renders a single icon button.
 * Clicking opens the file picker; selecting a file uploads + compresses.
 */
export function ChatPhotoUpload({
  matchId,
  senderId,
  onUploadComplete,
  onError,
  disabled = false,
}: ChatPhotoUploadProps) {
  const [progress, setProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setProgress(0);
      try {
        const result = await uploadChatPhoto(file, matchId, senderId, {
          onProgress: (p) => setProgress(p.percent),
        });
        setProgress(null);
        onUploadComplete(result.downloadUrl, result.storagePath);
      } catch (err) {
        setProgress(null);
        onError?.(err as StorageServiceError);
      }

      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [matchId, senderId, onUploadComplete, onError],
  );

  const isUploading = progress !== null;

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFile}
        aria-hidden="true"
      />
      <button
        onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
        disabled={disabled || isUploading}
        aria-label="Upload photo"
        className={cn(
          "relative w-10 h-10 flex items-center justify-center",
          "border-2 border-black cursor-pointer",
          "transition-all duration-100",
          isUploading
            ? "bg-[#E0E0E0]"
            : "bg-white hover:bg-[#F8F8F8] shadow-[2px_2px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000]",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        {isUploading ? (
          <Loader2 className="w-4 h-4 text-black animate-spin" strokeWidth={2.5} />
        ) : (
          <ImagePlus className="w-4 h-4 text-[#424242]" strokeWidth={2.5} />
        )}
        {/* Mini progress bar */}
        {isUploading && (
          <div className="absolute bottom-0 inset-x-0 h-0.5 bg-[#E0E0E0]">
            <div className="h-full bg-black transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}
      </button>
    </>
  );
}

export default ImageUpload;
