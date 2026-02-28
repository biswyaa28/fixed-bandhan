/**
 * Bandhan AI - Demo Mode Banner
 * Displays when demo mode is active
 *
 * Features:
 * - Red banner at top of screen
 * - "DEMO MODE" indicator
 * - Demo credentials display
 * - Hide/Dismiss option
 * - Link to disable demo mode
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  X,
  Info,
  Smartphone,
  Key,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useDemoMode } from "@/hooks/useDemoMode";
import { getDemoOTP, getDemoCredentials } from "@/hooks/useDemoMode";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export function DemoBanner() {
  const {
    isActive,
    disable,
    showBanner,
    hideBanner,
    availableUsers,
    selectUser,
    currentUser,
  } = useDemoMode();
  const [isExpanded, setIsExpanded] = useState(false);

  const credentials = getDemoCredentials();

  if (!isActive || !showBanner) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-[100] safe-top"
      >
        {/* Main Banner */}
        <div className="bg-lavender-50 border-b border-lavender-200 text-lavender-900 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-2.5">
            <div className="flex items-center justify-between">
              {/* Left: Demo Mode Indicator */}
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-4 h-4 text-lavender-500 shrink-0" />
                <div>
                  <p className="font-semibold text-sm text-lavender-900">
                    Demo Mode
                  </p>
                  <p className="text-xs text-lavender-600">
                    Using mock data — no real authentication
                  </p>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 rounded-lg hover:bg-lavender-100 transition-colors text-lavender-600"
                  title={isExpanded ? "Collapse" : "Expand demo info"}
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                <button
                  onClick={hideBanner}
                  className="p-1.5 rounded-lg hover:bg-lavender-100 transition-colors text-lavender-600"
                  title="Hide banner"
                >
                  <X className="w-4 h-4" />
                </button>

                <button
                  onClick={disable}
                  className="px-3 py-1.5 rounded-lg bg-lavender-200 hover:bg-lavender-300 transition-colors text-xs font-semibold text-lavender-800"
                >
                  Exit Demo
                </button>
              </div>
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 mt-3 border-t border-lavender-200">
                    {/* Demo Credentials */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      {/* OTP Info */}
                      <div className="bg-lavender-50 border border-lavender-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Key className="w-3.5 h-3.5 text-lavender-500" />
                          <span className="text-xs font-semibold text-lavender-800">
                            Demo OTP
                          </span>
                        </div>
                        <code className="text-2xl font-mono text-lavender-900 font-bold tracking-widest">
                          {credentials.otp}
                        </code>
                        <p className="text-xs text-lavender-500 mt-1">
                          Use this OTP for any phone number
                        </p>
                      </div>

                      {/* Phone Info */}
                      <div className="bg-peach-50 border border-peach-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Smartphone className="w-3.5 h-3.5 text-peach-500" />
                          <span className="text-xs font-semibold text-peach-800">
                            Phone Number
                          </span>
                        </div>
                        <code className="text-sm font-mono text-peach-900 font-bold">
                          {credentials.phone}
                        </code>
                        <p className="text-xs text-peach-500 mt-1">
                          {credentials.note}
                        </p>
                      </div>
                    </div>

                    {/* Demo Users */}
                    <div className="bg-ink-50 border border-ink-200 rounded-lg p-3 mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-3.5 h-3.5 text-ink-400" />
                        <span className="text-xs font-semibold text-ink-700">
                          Demo Profiles
                        </span>
                        <span className="text-xs text-ink-400">
                          ({availableUsers.length} available)
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
                        {availableUsers.map((demoUser) => (
                          <button
                            key={demoUser.id}
                            onClick={() => selectUser(demoUser.id)}
                            className={cn(
                              "p-2 rounded-lg text-left transition-colors border text-xs",
                              currentUser?.id === demoUser.id
                                ? "bg-lavender-100 border-lavender-300 text-lavender-900"
                                : "bg-white border-ink-200 text-ink-600 hover:border-ink-300",
                            )}
                          >
                            <p className="font-semibold truncate">
                              {demoUser.name}
                            </p>
                            <p className="text-ink-400 truncate">
                              {demoUser.age} · {demoUser.city}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Info Note */}
                    <div className="flex items-start gap-2 p-3 bg-sky-50 border border-sky-200 rounded-lg">
                      <Info className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
                      <div className="text-xs text-sky-700">
                        <p className="font-semibold mb-1">Demo Mode</p>
                        <ul className="space-y-0.5 text-sky-600">
                          <li>• No real phone numbers or OTPs required</li>
                          <li>• All features unlocked for testing</li>
                          <li>• Data resets when you exit demo mode</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Subtle bottom divider */}
        <div className="h-px bg-lavender-200" />
      </motion.div>
    </AnimatePresence>
  );
}

export function DemoBannerCompact() {
  const { isActive, disable, showBanner, hideBanner } = useDemoMode();

  if (!isActive || !showBanner) return null;

  return (
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -60, opacity: 0 }}
      className="fixed top-0 left-0 right-0 z-[100] safe-top"
    >
      <div className="bg-lavender-100 border-b border-lavender-200 text-lavender-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-lavender-500" />
              <span className="font-bold text-xs">DEMO MODE</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={hideBanner}
                className="p-1 rounded hover:bg-lavender-200 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
              <button
                onClick={disable}
                className="px-2 py-1 rounded bg-lavender-200 text-xs font-medium hover:bg-lavender-300 transition-colors"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default DemoBanner;
