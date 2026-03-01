/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Safety Modal ("Share My Date Location")
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Multi-step safety flow:
 *   Step 1: Confirm — Red header, duration info (fixed 2 hours), privacy note
 *   Step 2: Contacts — Select up to 3 emergency contacts
 *   Step 3: Review — Map preview (static), SMS preview (Hindi + English),
 *           "Share Location" CTA
 *
 * Comic-book aesthetic: 4px black border, red header bar, hard shadow,
 * 0px radius, monochromatic palette with red accent for safety.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Shield,
  MapPin,
  Clock,
  Users,
  Phone,
  Plus,
  Check,
  MessageSquare,
  Navigation,
  Lock,
  Trash2,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...c: (string | undefined | null | false)[]) {
  return twMerge(clsx(c));
}

// ─── Types ───────────────────────────────────────────────────────────────

interface Contact {
  id: string;
  name: string;
  phone: string;
}

type Step = "confirm" | "contacts" | "review" | "sharing";

export interface SafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchName?: string;
  onShare?: (contacts: Contact[]) => void;
}

// ─── Pre-filled contacts (simulated device contacts) ─────────────────────

const DEVICE_CONTACTS: Contact[] = [
  { id: "c1", name: "Maa (Mom)", phone: "+91 98765 43210" },
  { id: "c2", name: "Papa (Dad)", phone: "+91 98765 43211" },
  { id: "c3", name: "Bhai (Brother)", phone: "+91 98765 43212" },
  { id: "c4", name: "Didi (Sister)", phone: "+91 87654 32109" },
  { id: "c5", name: "Best Friend", phone: "+91 76543 21098" },
];

// ─── Step Indicator ──────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1 border-b border-dashed border-[#E0E0E0] px-4 py-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-1.5 flex-1 border border-black",
            i < current ? "bg-black" : i === current ? "bg-[#EF476F]" : "bg-[#E0E0E0]",
          )}
        />
      ))}
      <span className="ml-2 text-[8px] font-bold text-[#9E9E9E]">
        {current + 1}/{total}
      </span>
    </div>
  );
}

// ─── Step 1: Confirm ─────────────────────────────────────────────────────

function ConfirmStep({
  matchName,
  onContinue,
}: {
  matchName?: string;
  onContinue: () => void;
}) {
  const endTime = new Date(Date.now() + 2 * 60 * 60 * 1000).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-3 px-4 py-4">
      {/* Safety icon */}
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center border-[2px] border-black bg-[#FFF0F3] shadow-[2px_2px_0px_#000000]">
          <Shield className="h-7 w-7 text-[#EF476F]" strokeWidth={1.5} />
        </div>
        <p className="m-0 mx-auto max-w-[280px] text-xs leading-relaxed text-[#424242]">
          Share your live location with trusted contacts for{" "}
          <span className="font-bold text-black">2 hours</span>.
        </p>
      </div>

      {/* Match info */}
      {matchName && (
        <div className="flex items-center gap-2 border-[2px] border-black bg-[#F8F8F8] px-3 py-2">
          <Users className="h-4 w-4 text-black" strokeWidth={2} />
          <span className="text-xs text-[#212121]">
            Meeting: <span className="font-bold">{matchName}</span>
          </span>
        </div>
      )}

      {/* Duration */}
      <div className="flex items-center gap-2 border-[2px] border-dashed border-black bg-white px-3 py-2">
        <Clock className="h-4 w-4 text-[#9E9E9E]" strokeWidth={2} />
        <div>
          <p className="m-0 text-xs font-bold text-[#212121]">Fixed 2-hour sharing</p>
          <p className="m-0 text-[9px] text-[#9E9E9E]">Auto-stops at {endTime}</p>
        </div>
      </div>

      {/* Privacy note */}
      <div className="flex items-start gap-2 border-[2px] border-black bg-[#F8F8F8] px-3 py-2">
        <Lock
          className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#9E9E9E]"
          strokeWidth={2}
        />
        <div>
          <p className="m-0 text-[9px] leading-snug text-[#424242]">
            For safety only — not for surveillance. Location data auto-deleted after
            sharing ends.
          </p>
          <p className="m-0 mt-1 text-[8px] text-[#9E9E9E]">
            केवल सुरक्षा के लिए — निगरानी के लिए नहीं। DPDP Act 2023 compliant.
          </p>
        </div>
      </div>

      {/* Continue */}
      <button
        onClick={onContinue}
        className={cn(
          "flex w-full items-center justify-center gap-2 py-3",
          "border-[3px] border-black bg-[#EF476F] text-white",
          "shadow-[4px_4px_0px_#000000]",
          "cursor-pointer font-heading text-xs font-bold uppercase tracking-wider",
          "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000]",
          "transition-[transform,box-shadow] duration-150",
        )}
      >
        <Users className="h-4 w-4" strokeWidth={2} />
        Select Contacts
      </button>
    </div>
  );
}

// ─── Step 2: Contact Selection ───────────────────────────────────────────

function ContactsStep({
  selected,
  onToggle,
  onContinue,
  onBack,
}: {
  selected: Contact[];
  onToggle: (c: Contact) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  const isSelected = (id: string) => selected.some((c) => c.id === id);
  const canAdd = selected.length < 3;

  return (
    <div className="space-y-3 px-4 py-4">
      <div className="mb-1 flex items-center justify-between">
        <p className="m-0 font-heading text-xs font-bold uppercase tracking-wider text-black">
          Emergency Contacts
        </p>
        <span className="text-[8px] font-bold text-[#9E9E9E]">
          {selected.length}/3 selected
        </span>
      </div>

      {/* Contact list */}
      <div className="max-h-[240px] overflow-y-auto border-[2px] border-black bg-white">
        {DEVICE_CONTACTS.map((c, i) => {
          const active = isSelected(c.id);
          const disabled = !active && !canAdd;
          return (
            <button
              key={c.id}
              onClick={() => !disabled && onToggle(c)}
              disabled={disabled}
              className={cn(
                "flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left",
                "transition-colors duration-100",
                i < DEVICE_CONTACTS.length - 1 &&
                  "border-b border-dashed border-[#E0E0E0]",
                active ? "bg-[#F8F8F8]" : "bg-white hover:bg-[#F8F8F8]",
                disabled && "cursor-not-allowed opacity-40",
              )}
            >
              <div
                className={cn(
                  "flex h-5 w-5 flex-shrink-0 items-center justify-center border-[2px] border-black",
                  active ? "bg-black" : "bg-white",
                )}
              >
                {active && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="m-0 text-xs font-bold text-[#212121]">{c.name}</p>
                <p className="m-0 text-[9px] text-[#9E9E9E]">{c.phone}</p>
              </div>
              <Phone className="h-3.5 w-3.5 text-[#9E9E9E]" strokeWidth={2} />
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onBack}
          className="flex-1 cursor-pointer border-[2px] border-black bg-white py-2.5 font-heading text-[10px] font-bold uppercase tracking-wider transition-colors hover:bg-[#F8F8F8]"
        >
          Back
        </button>
        <button
          onClick={onContinue}
          disabled={selected.length === 0}
          className={cn(
            "flex-[2] cursor-pointer border-[3px] border-black py-2.5 font-heading text-[10px] font-bold uppercase tracking-wider",
            selected.length > 0
              ? "bg-black text-white shadow-[4px_4px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000]"
              : "cursor-not-allowed border-[#9E9E9E] bg-[#E0E0E0] text-[#9E9E9E] shadow-none",
            "transition-[transform,box-shadow] duration-150",
          )}
        >
          Review ({selected.length})
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Review ──────────────────────────────────────────────────────

function ReviewStep({
  contacts,
  matchName,
  onConfirm,
  onBack,
}: {
  contacts: Contact[];
  matchName?: string;
  onConfirm: () => void;
  onBack: () => void;
}) {
  const endTime = new Date(Date.now() + 2 * 60 * 60 * 1000).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-3 px-4 py-4">
      {/* Map preview (static placeholder) */}
      <div className="relative h-28 overflow-hidden border-[2px] border-black bg-[#F8F8F8]">
        {/* Grid pattern as map placeholder */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(#E0E0E0 1px, transparent 1px), linear-gradient(90deg, #E0E0E0 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-8 w-8 items-center justify-center border-[2px] border-black bg-[#EF476F]">
            <Navigation className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
        </div>
        <div className="absolute bottom-2 left-2 right-2 border border-black bg-white px-2 py-1 text-[8px] font-bold text-[#424242]">
          <MapPin className="mr-1 inline h-2.5 w-2.5" strokeWidth={2} />
          Your current location · Auto-stops at {endTime}
        </div>
      </div>

      {/* Selected contacts */}
      <div>
        <p className="m-0 mb-1 font-heading text-[8px] font-bold uppercase tracking-widest text-[#9E9E9E]">
          Sharing with:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {contacts.map((c) => (
            <span
              key={c.id}
              className="border-[2px] border-black bg-[#F8F8F8] px-2 py-1 text-[9px] font-bold text-[#212121]"
            >
              {c.name}
            </span>
          ))}
        </div>
      </div>

      {/* SMS Preview */}
      <div>
        <div className="mb-1 flex items-center gap-1">
          <MessageSquare className="h-3 w-3 text-[#9E9E9E]" strokeWidth={2} />
          <p className="m-0 font-heading text-[8px] font-bold uppercase tracking-widest text-[#9E9E9E]">
            SMS Preview · English + हिंदी
          </p>
        </div>
        <div className="space-y-2 border-[2px] border-dashed border-black bg-white px-3 py-2">
          <p className="m-0 text-[10px] leading-snug text-[#424242]">
            🛡️ Hi, I&apos;m on a date{matchName ? ` with ${matchName}` : ""} using Bandhan
            AI. My live location:{" "}
            <span className="font-bold underline">bandhan.ai/track/abc123</span>.
            Auto-expires at {endTime}. For safety only.
          </p>
          <div className="border-t border-dashed border-[#E0E0E0] pt-2">
            <p className="m-0 font-hindi text-[10px] leading-snug text-[#424242]">
              🛡️ नमस्ते, मैं बंधन AI से{matchName ? ` ${matchName} के साथ` : ""} डेट पर
              हूँ। मेरा लाइव स्थान:{" "}
              <span className="font-bold underline">bandhan.ai/track/abc123</span>।
              {endTime} पर स्वतः बंद। केवल सुरक्षा के लिए।
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onBack}
          className="flex-1 cursor-pointer border-[2px] border-black bg-white py-2.5 font-heading text-[10px] font-bold uppercase tracking-wider transition-colors hover:bg-[#F8F8F8]"
        >
          Back
        </button>
        <button
          onClick={onConfirm}
          className={cn(
            "flex flex-[2] items-center justify-center gap-2 py-2.5",
            "border-[3px] border-black bg-[#EF476F] text-white",
            "shadow-[4px_4px_0px_#000000]",
            "cursor-pointer font-heading text-[10px] font-bold uppercase tracking-wider",
            "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000]",
            "transition-[transform,box-shadow] duration-150",
          )}
        >
          <Shield className="h-4 w-4" strokeWidth={2} />
          Share Location
        </button>
      </div>
    </div>
  );
}

// ─── Sharing Active State ────────────────────────────────────────────────

function SharingState({ contacts, onStop }: { contacts: Contact[]; onStop: () => void }) {
  return (
    <div className="px-4 py-6 text-center">
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="mx-auto mb-3 flex h-14 w-14 items-center justify-center border-[2px] border-black bg-[#EF476F] shadow-[2px_2px_0px_#000000]"
      >
        <Navigation className="h-7 w-7 text-white" strokeWidth={2} />
      </motion.div>
      <p className="m-0 mb-1 font-heading text-sm font-bold uppercase text-black">
        Location Sharing Active
      </p>
      <p className="m-0 mb-3 text-xs text-[#9E9E9E]">
        Sharing with {contacts.map((c) => c.name).join(", ")}
      </p>
      <p className="m-0 mb-4 text-[10px] text-[#9E9E9E]">स्थान साझाकरण सक्रिय · 2 घंटे</p>
      <button
        onClick={onStop}
        className="cursor-pointer border-[2px] border-[#EF476F] px-6 py-2 font-heading text-[10px] font-bold uppercase tracking-wider text-[#EF476F] transition-colors hover:bg-[#FFF0F3]"
      >
        Stop Sharing
      </button>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────

export function SafetyModal({ isOpen, onClose, matchName, onShare }: SafetyModalProps) {
  const [step, setStep] = useState<Step>("confirm");
  const [selected, setSelected] = useState<Contact[]>([]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setStep("confirm");
      setSelected([]);
    }
  }, [isOpen]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  const toggleContact = useCallback((c: Contact) => {
    setSelected((prev) =>
      prev.some((s) => s.id === c.id)
        ? prev.filter((s) => s.id !== c.id)
        : prev.length < 3
          ? [...prev, c]
          : prev,
    );
  }, []);

  const handleConfirm = useCallback(() => {
    onShare?.(selected);
    setStep("sharing");
  }, [selected, onShare]);

  const stepIndex =
    step === "confirm" ? 0 : step === "contacts" ? 1 : step === "review" ? 2 : 2;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "8px 8px",
            }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-label="Share My Date Location"
            className="relative w-[90%] max-w-[420px] overflow-hidden border-4 border-black bg-white shadow-[8px_8px_0px_#000000]"
          >
            {/* Header — Red for safety */}
            <div className="flex items-center justify-between border-b-[2px] border-black bg-[#EF476F] px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" strokeWidth={2.5} />
                <span className="font-heading text-xs font-bold uppercase tracking-wider">
                  Share My Date Location
                </span>
              </div>
              <button
                onClick={onClose}
                className="flex h-6 w-6 cursor-pointer items-center justify-center border-none bg-white text-[#EF476F]"
                aria-label="Close"
              >
                <X className="h-3.5 w-3.5" strokeWidth={3} />
              </button>
            </div>

            {/* Step indicator */}
            {step !== "sharing" && <StepIndicator current={stepIndex} total={3} />}

            {/* Step content */}
            <AnimatePresence mode="wait">
              {step === "confirm" && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ConfirmStep
                    matchName={matchName}
                    onContinue={() => setStep("contacts")}
                  />
                </motion.div>
              )}
              {step === "contacts" && (
                <motion.div
                  key="contacts"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ContactsStep
                    selected={selected}
                    onToggle={toggleContact}
                    onContinue={() => setStep("review")}
                    onBack={() => setStep("confirm")}
                  />
                </motion.div>
              )}
              {step === "review" && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ReviewStep
                    contacts={selected}
                    matchName={matchName}
                    onConfirm={handleConfirm}
                    onBack={() => setStep("contacts")}
                  />
                </motion.div>
              )}
              {step === "sharing" && (
                <motion.div
                  key="sharing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <SharingState contacts={selected} onStop={onClose} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default SafetyModal;
