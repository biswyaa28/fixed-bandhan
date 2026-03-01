/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Discovery Page (After-Login Main Screen)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Route: /discover
 *
 * The primary screen users see after login. Uses the new tap/long-press
 * interaction model (no swipe). Comic-book aesthetic throughout.
 *
 * Sections (top to bottom):
 *   1. Perfect Match of the Day (gold border, pulse animation)
 *   2. Quick Filters (horizontal scroll: Verified, Same City, etc.)
 *   3. Suggested Matches (vertical card stack)
 *   4. Fixed Action Buttons (❤️ Like, ✖️ Pass, 💬 Appreciate)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { DiscoveryFeed } from "@/components/discovery/DiscoveryFeed";
import type { DiscoveryProfile } from "@/components/discovery/ProfileCard";

export default function DiscoverPage() {
  const [modalProfile, setModalProfile] = useState<DiscoveryProfile | null>(null);
  const [appreciateProfile, setAppreciateProfile] = useState<DiscoveryProfile | null>(null);

  // ── Profile detail modal ──
  const handleProfileTap = useCallback((profile: DiscoveryProfile) => {
    setModalProfile(profile);
  }, []);

  // ── Appreciate modal ──
  const handleProfileLongPress = useCallback((profile: DiscoveryProfile) => {
    setAppreciateProfile(profile);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* ── Main Feed ── */}
      <DiscoveryFeed
        onProfileTap={handleProfileTap}
        onProfileLongPress={handleProfileLongPress}
      />

      {/* ── Profile Detail Modal ── */}
      <AnimatePresence>
        {modalProfile && (
          <ProfileDetailModal
            profile={modalProfile}
            onClose={() => setModalProfile(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Appreciate Modal ── */}
      <AnimatePresence>
        {appreciateProfile && (
          <AppreciateModal
            profile={appreciateProfile}
            onClose={() => setAppreciateProfile(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Profile Detail Modal (slide up)
// ─────────────────────────────────────────────────────────────────────────────

function ProfileDetailModal({
  profile,
  onClose,
}: {
  profile: DiscoveryProfile;
  onClose: () => void;
}) {
  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-50"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-[3px] border-black max-h-[85vh] overflow-y-auto safe-bottom"
        role="dialog"
        aria-modal="true"
        aria-label={`Profile: ${profile.name}`}
      >
        {/* Header bar */}
        <div className="sticky top-0 bg-white border-b-[2px] border-black px-4 py-3 flex items-center justify-between z-10">
          <h2 className="text-sm font-heading font-bold text-black uppercase tracking-wide m-0">
            {profile.name}, {profile.age}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center border-[2px] border-black bg-white hover:bg-[#F8F8F8] cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-black" strokeWidth={2.5} />
          </button>
        </div>

        {/* Avatar */}
        <div
          className="h-48 w-full flex items-center justify-center border-b-[2px] border-black"
          style={{
            background: `linear-gradient(135deg, ${profile.gradientFrom}, ${profile.gradientTo})`,
          }}
        >
          <div className="w-24 h-24 bg-white border-[2px] border-black shadow-[4px_4px_0px_#000000] flex items-center justify-center">
            <span className="text-3xl font-heading font-bold text-black select-none">
              {profile.initials}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="p-5 space-y-4">
          {/* Location + Verification + Intent */}
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-[#F8F8F8] border-[2px] border-black text-[10px] font-bold uppercase tracking-wider">
              📍 {profile.city}
            </span>
            <span className="px-2 py-1 bg-[#F8F8F8] border-[2px] border-black text-[10px] font-bold uppercase tracking-wider capitalize">
              🛡️ {profile.verificationLevel}
            </span>
            <span className="px-2 py-1 bg-black text-white border-[2px] border-black text-[10px] font-bold uppercase tracking-wider">
              ❤️ {profile.compatibility}% Match
            </span>
          </div>

          {/* Bio */}
          <div>
            <h3 className="text-[10px] font-heading font-bold text-[#9E9E9E] uppercase tracking-widest mb-1 m-0">
              About
            </h3>
            <p className="text-sm text-[#424242] leading-relaxed m-0">
              {profile.bio}
            </p>
          </div>

          {/* Education */}
          <div>
            <h3 className="text-[10px] font-heading font-bold text-[#9E9E9E] uppercase tracking-widest mb-1 m-0">
              Education
            </h3>
            <p className="text-sm text-[#424242] m-0">🎓 {profile.education}</p>
          </div>

          {/* Intent */}
          <div>
            <h3 className="text-[10px] font-heading font-bold text-[#9E9E9E] uppercase tracking-widest mb-1 m-0">
              Looking For
            </h3>
            <p className="text-sm text-[#424242] m-0">💍 {profile.intent}</p>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Appreciate Modal (comment on a specific element)
// ─────────────────────────────────────────────────────────────────────────────

function AppreciateModal({
  profile,
  onClose,
}: {
  profile: DiscoveryProfile;
  onClose: () => void;
}) {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!message.trim()) return;
    setSent(true);
    // TODO: wire to API — createInterest(userId, profile.id, "appreciate", message)
    setTimeout(onClose, 1500);
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-50"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-[3px] border-black safe-bottom"
        role="dialog"
        aria-modal="true"
        aria-label={`Appreciate ${profile.name}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b-[2px] border-black">
          <h2 className="text-sm font-heading font-bold text-black uppercase tracking-wide m-0">
            💬 Appreciate {profile.name}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center border-[2px] border-black bg-white hover:bg-[#F8F8F8] cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-black" strokeWidth={2.5} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          {sent ? (
            <div className="text-center py-6">
              <p className="text-sm font-heading font-bold text-black">
                ✅ Appreciation sent!
              </p>
              <p className="text-xs text-[#9E9E9E] mt-1">
                {profile.name} will see your message with your interest.
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs text-[#424242] mb-3 m-0">
                Send a message with your interest. Tell them what caught your eye!
              </p>

              {/* Suggestions */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {[
                  "Love your bio!",
                  `Great taste in ${profile.education}`,
                  "We share the same values",
                  `${profile.city} is amazing!`,
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => setMessage(s)}
                    className="px-2 py-1 bg-[#F8F8F8] border-[2px] border-[#E0E0E0] text-[10px] text-[#424242] cursor-pointer hover:border-black hover:bg-white transition-colors duration-100"
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Text input */}
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 100))}
                placeholder="Write your message..."
                maxLength={100}
                rows={2}
                className="w-full px-3 py-2 text-sm border-[2px] border-black bg-white placeholder:text-[#9E9E9E] placeholder:italic focus:outline-none focus:shadow-[0_0_0_3px_#fff,0_0_0_6px_#000] resize-none"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-[#9E9E9E]">
                  {message.length}/100
                </span>
                <button
                  onClick={handleSend}
                  disabled={!message.trim()}
                  className={`px-4 py-2 border-[2px] border-black text-[10px] font-heading font-bold uppercase tracking-wider transition-all duration-100 ${
                    message.trim()
                      ? "bg-black text-white shadow-[3px_3px_0px_#000] cursor-pointer hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000]"
                      : "bg-[#E0E0E0] text-[#9E9E9E] cursor-not-allowed"
                  }`}
                >
                  Send with ❤️
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </>
  );
}
