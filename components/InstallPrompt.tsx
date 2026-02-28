/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — PWA Install Prompt (Android + iOS)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Smart "Add to Home Screen" banner that:
 *   - Shows on Android when beforeinstallprompt fires (native prompt)
 *   - Shows iOS-specific instructions on iPhone/iPad (Safari share → A2HS)
 *   - Hides when already installed (standalone mode)
 *   - Hides for 7 days after user dismisses
 *   - Tracks install events to localStorage (ZERO cost)
 *   - Shows after 2nd visit (not on first load — let them explore first)
 *   - Comic book / 8-bit monochromatic aesthetic
 *   - Bilingual: English + Hindi
 *
 * ZERO external dependencies beyond React.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Download, Share, Plus } from "lucide-react";
import {
  initInstallPrompt,
  triggerInstallPrompt,
  canShowInstallPrompt,
  isInstallDismissed,
  setInstallDismissed,
  isStandalone,
  isIOS,
  isAndroid,
  getPlatform,
} from "@/lib/pwa";

// ─── Visit counter (show prompt on 2nd+ visit) ──────────────────────────────
const VISIT_COUNT_KEY = "bandhan_visit_count";

function getVisitCount(): number {
  if (typeof localStorage === "undefined") return 0;
  try {
    return parseInt(localStorage.getItem(VISIT_COUNT_KEY) || "0", 10);
  } catch {
    return 0;
  }
}

function incrementVisitCount(): void {
  if (typeof localStorage === "undefined") return;
  try {
    const count = getVisitCount() + 1;
    localStorage.setItem(VISIT_COUNT_KEY, count.toString());
  } catch {
    // ignore
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [promptReady, setPromptReady] = useState(false);

  useEffect(() => {
    // Don't show if already installed
    if (isStandalone()) return;

    // Don't show if user dismissed recently
    if (isInstallDismissed()) return;

    // Increment visit count
    incrementVisitCount();

    // Don't show on first visit — let them explore
    if (getVisitCount() < 2) return;

    // Initialize the beforeinstallprompt listener (Android/Desktop)
    const cleanup = initInstallPrompt(() => {
      setPromptReady(true);
      setVisible(true);
    });

    // iOS doesn't fire beforeinstallprompt — show manual instructions
    if (isIOS()) {
      // Delay showing iOS prompt by 5 seconds
      const timer = setTimeout(() => {
        setVisible(true);
      }, 5000);
      return () => {
        clearTimeout(timer);
        cleanup();
      };
    }

    return cleanup;
  }, []);

  const handleInstall = useCallback(async () => {
    if (isIOS()) {
      setShowIOSInstructions(true);
      return;
    }

    const accepted = await triggerInstallPrompt();
    if (accepted) {
      setVisible(false);
    }
  }, []);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    setInstallDismissed();
  }, []);

  if (!visible) return null;

  // ── iOS Instructions Modal ─────────────────────────────────────────────
  if (showIOSInstructions) {
    return (
      <div
        className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/80 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ios-install-title"
      >
        <div className="w-full max-w-sm bg-white border-[3px] border-black shadow-[4px_4px_0px_#000] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 id="ios-install-title" className="text-sm font-bold text-black uppercase tracking-wider">
              Install Bandhan AI
            </h2>
            <button
              onClick={handleDismiss}
              className="w-8 h-8 flex items-center justify-center border-2 border-black bg-white hover:bg-black hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 border-2 border-black flex items-center justify-center flex-shrink-0 font-bold text-sm">
                1
              </div>
              <div>
                <p className="text-sm text-black font-bold">
                  Tap the Share button
                  <Share className="w-4 h-4 inline-block ml-1 mb-0.5" />
                </p>
                <p className="text-xs text-[#9E9E9E]" lang="hi">शेयर बटन दबाएं</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 border-2 border-black flex items-center justify-center flex-shrink-0 font-bold text-sm">
                2
              </div>
              <div>
                <p className="text-sm text-black font-bold">
                  Scroll down and tap{" "}
                  <span className="inline-flex items-center gap-1 bg-[#F8F8F8] border border-black px-1.5 py-0.5 text-xs">
                    <Plus className="w-3 h-3" /> Add to Home Screen
                  </span>
                </p>
                <p className="text-xs text-[#9E9E9E]" lang="hi">&quot;होम स्क्रीन में जोड़ें&quot; पर टैप करें</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 border-2 border-black flex items-center justify-center flex-shrink-0 font-bold text-sm">
                3
              </div>
              <div>
                <p className="text-sm text-black font-bold">Tap &quot;Add&quot; to confirm</p>
                <p className="text-xs text-[#9E9E9E]" lang="hi">&quot;जोड़ें&quot; पर टैप करें</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="w-full mt-4 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white bg-black border-[3px] border-black shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] transition-all"
          >
            Got it!
          </button>
        </div>
      </div>
    );
  }

  // ── Main Install Banner (Android / Desktop) ────────────────────────────
  return (
    <div
      className="fixed bottom-16 left-0 right-0 z-[100] px-4 pb-2 md:bottom-0"
      role="banner"
      aria-label="Install Bandhan AI app"
    >
      <div className="max-w-md mx-auto bg-white border-[3px] border-black shadow-[4px_4px_0px_#000] p-4">
        <div className="flex items-start gap-3">
          {/* App icon */}
          <div className="w-12 h-12 border-2 border-black flex-shrink-0 flex items-center justify-center bg-black">
            <svg viewBox="0 0 512 512" className="w-8 h-8">
              <path
                d="M256 420 C180 350,90 280,90 200 C90 150,130 110,175 110 C210 110,240 135,256 160 C272 135,302 110,337 110 C382 110,422 150,422 200 C422 280,332 350,256 420Z"
                fill="#FFF"
              />
            </svg>
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-black uppercase tracking-wider">
              Install Bandhan AI
            </h3>
            <p className="text-xs text-[#424242] mt-0.5">
              {isIOS()
                ? "Add to your home screen for the best experience"
                : "Get instant access — works offline too"}
            </p>
            <p className="text-[10px] text-[#9E9E9E] mt-0.5" lang="hi">
              {isIOS()
                ? "बेहतर अनुभव के लिए होम स्क्रीन में जोड़ें"
                : "ऑफ़लाइन भी काम करता है — अभी इंस्टॉल करें"}
            </p>
          </div>

          {/* Dismiss */}
          <button
            onClick={handleDismiss}
            className="w-6 h-6 flex items-center justify-center flex-shrink-0 hover:bg-[#E0E0E0] transition-colors"
            aria-label="Dismiss install prompt"
          >
            <X className="w-4 h-4 text-[#9E9E9E]" />
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleInstall}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-black border-[3px] border-black shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            {isIOS() ? "How to Install" : "Install Now"}
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-black bg-white border-[3px] border-black shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] transition-all"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}

export default InstallPrompt;
