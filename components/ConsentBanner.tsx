/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — DPDP Act 2023 Compliant Consent Banner
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * The Digital Personal Data Protection Act, 2023 (India) requires:
 *   §6  — Consent must be free, specific, informed, unconditional, unambiguous
 *   §6(3) — Consent must be for each specified purpose separately
 *   §6(7) — Data principal may withdraw consent at any time
 *   §8(7) — Consent must be in clear, plain language (incl. local languages)
 *   §11  — Right to access personal data
 *   §12  — Right to correction and erasure
 *   §13  — Right to grievance redressal
 *
 * This banner:
 *   • Shows on first visit (or when policy version changes)
 *   • Provides granular per-purpose toggles (matching, safety, marketing)
 *   • Bilingual: English + Hindi
 *   • "Essential" is always on (legitimate interest for app functionality)
 *   • Persists choice to localStorage
 *   • Links to full privacy policy
 *   • Provides data export + deletion buttons in expanded view
 *   • Comic book monochromatic design language
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Shield,
  ChevronDown,
  ChevronUp,
  Download,
  Trash2,
  X,
  ExternalLink,
  Check,
} from "lucide-react";
import {
  getConsent,
  updateConsent,
  acceptAllConsent,
  rejectOptionalConsent,
  hasConsentResponse,
  downloadUserData,
  deleteUserData,
  type ConsentPurpose,
  type ConsentState,
} from "@/lib/analytics";

// ─────────────────────────────────────────────────────────────────────────────
// Strings (bilingual)
// ─────────────────────────────────────────────────────────────────────────────

const STRINGS = {
  en: {
    title: "Your Privacy Matters",
    subtitle:
      "We use privacy-first analytics (no Google, no third parties) to improve your experience. All data stays in India.",
    essential: "Essential",
    essentialDesc: "App functionality, safety features, error reporting. Always on.",
    matching: "Matching Analytics",
    matchingDesc: "Help us improve match quality, compatibility scoring, and discovery.",
    safety: "Safety Analytics",
    safetyDesc: "Detect fake profiles, prevent harassment, improve verification.",
    marketing: "Product Improvement",
    marketingDesc: "Usage patterns to build better features. Never sold to third parties.",
    acceptAll: "Accept All",
    rejectOptional: "Essential Only",
    saveChoices: "Save My Choices",
    customize: "Customize",
    hideCustomize: "Hide Options",
    privacyPolicy: "Privacy Policy",
    dataRights: "Your Data Rights",
    exportData: "Export My Data",
    deleteData: "Delete My Data",
    deleteConfirm: "Are you sure? This will clear all analytics data from your device.",
    dataSaved: "✓ Data stored in India only. Auto-deleted after 90 days.",
    dpdpNotice:
      "Under the Digital Personal Data Protection Act 2023, you have the right to access, correct, and erase your personal data.",
  },
  hi: {
    title: "आपकी गोपनीयता महत्वपूर्ण है",
    subtitle:
      "हम आपके अनुभव को बेहतर बनाने के लिए गोपनीयता-प्रथम एनालिटिक्स का उपयोग करते हैं (कोई Google नहीं, कोई तृतीय पक्ष नहीं)। सभी डेटा भारत में रहता है।",
    essential: "आवश्यक",
    essentialDesc: "ऐप कार्यक्षमता, सुरक्षा सुविधाएं, त्रुटि रिपोर्टिंग। हमेशा चालू।",
    matching: "मैचिंग एनालिटिक्स",
    matchingDesc: "मैच गुणवत्ता, अनुकूलता स्कोरिंग और खोज को बेहतर बनाने में मदद करें।",
    safety: "सुरक्षा एनालिटिक्स",
    safetyDesc: "फर्जी प्रोफाइल का पता लगाएं, उत्पीड़न रोकें, सत्यापन सुधारें।",
    marketing: "उत्पाद सुधार",
    marketingDesc: "बेहतर सुविधाएं बनाने के लिए उपयोग पैटर्न। कभी तीसरे पक्ष को नहीं बेचा जाता।",
    acceptAll: "सभी स्वीकार करें",
    rejectOptional: "केवल आवश्यक",
    saveChoices: "मेरी पसंद सहेजें",
    customize: "अनुकूलित करें",
    hideCustomize: "विकल्प छुपाएं",
    privacyPolicy: "गोपनीयता नीति",
    dataRights: "आपके डेटा अधिकार",
    exportData: "मेरा डेटा निर्यात करें",
    deleteData: "मेरा डेटा हटाएं",
    deleteConfirm: "क्या आप सुनिश्चित हैं? यह आपके डिवाइस से सभी एनालिटिक्स डेटा हटा देगा।",
    dataSaved: "✓ डेटा केवल भारत में संग्रहीत। 90 दिनों के बाद स्वतः हटाया जाता है।",
    dpdpNotice:
      "डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम 2023 के तहत, आपको अपने व्यक्तिगत डेटा तक पहुंचने, सुधारने और मिटाने का अधिकार है।",
  },
} as const;

type Lang = keyof typeof STRINGS;

// ─────────────────────────────────────────────────────────────────────────────
// Purpose Definitions
// ─────────────────────────────────────────────────────────────────────────────

interface PurposeDef {
  id: ConsentPurpose;
  labelKey: keyof (typeof STRINGS)["en"];
  descKey: keyof (typeof STRINGS)["en"];
  locked: boolean; // If true, toggle is disabled (always on)
}

const PURPOSES: PurposeDef[] = [
  { id: "essential", labelKey: "essential", descKey: "essentialDesc", locked: true },
  { id: "matching", labelKey: "matching", descKey: "matchingDesc", locked: false },
  { id: "safety", labelKey: "safety", descKey: "safetyDesc", locked: false },
  { id: "marketing", labelKey: "marketing", descKey: "marketingDesc", locked: false },
];

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showDataRights, setShowDataRights] = useState(false);
  const [purposes, setPurposes] = useState<Record<ConsentPurpose, boolean>>({
    essential: true,
    matching: false,
    safety: false,
    marketing: false,
  });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [lang, setLang] = useState<Lang>("en");

  const t = STRINGS[lang];

  // ── Show banner if user hasn't responded yet ──
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect language from <html lang> or localStorage
    const htmlLang = document.documentElement.lang;
    if (htmlLang === "hi") setLang("hi");

    // Read existing consent
    const consent = getConsent();
    if (!consent.hasResponded) {
      // Delay showing by 2s — let user see the app first
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }

    // Load existing preferences into toggles
    setPurposes(consent.purposes);
  }, []);

  const handleAcceptAll = useCallback(() => {
    acceptAllConsent();
    setVisible(false);
  }, []);

  const handleRejectOptional = useCallback(() => {
    rejectOptionalConsent();
    setVisible(false);
  }, []);

  const handleSaveChoices = useCallback(() => {
    updateConsent(purposes);
    setVisible(false);
  }, [purposes]);

  const togglePurpose = useCallback((purpose: ConsentPurpose) => {
    if (purpose === "essential") return; // Can't toggle essential
    setPurposes((prev) => ({ ...prev, [purpose]: !prev[purpose] }));
  }, []);

  const handleExportData = useCallback(() => {
    downloadUserData();
  }, []);

  const handleDeleteData = useCallback(() => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    deleteUserData();
    setConfirmDelete(false);
    setVisible(false);
  }, [confirmDelete]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[9998] px-4 pb-16 md:pb-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-title"
      aria-describedby="consent-subtitle"
    >
      <div className="max-w-lg mx-auto bg-white border-[3px] border-black shadow-[6px_6px_0px_#000] overflow-hidden">
        {/* ── Header ────────────────────────────────────────────────── */}
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-black flex-shrink-0" aria-hidden="true" />
              <h2 id="consent-title" className="text-sm font-bold text-black uppercase tracking-wider">
                {t.title}
              </h2>
            </div>
            {/* Language toggle */}
            <button
              onClick={() => setLang((l) => (l === "en" ? "hi" : "en"))}
              className="text-[10px] font-bold border-2 border-black px-2 py-0.5 hover:bg-black hover:text-white transition-colors flex-shrink-0"
              aria-label={lang === "en" ? "हिंदी में देखें" : "View in English"}
            >
              {lang === "en" ? "हिंदी" : "EN"}
            </button>
          </div>
          <p id="consent-subtitle" className="text-xs text-[#424242] mt-2 leading-relaxed">
            {t.subtitle}
          </p>
          <p className="text-[10px] text-[#9E9E9E] mt-1">{t.dataSaved}</p>
        </div>

        {/* ── Quick Actions ─────────────────────────────────────────── */}
        {!expanded && (
          <div className="px-5 pb-4 space-y-2">
            <div className="flex gap-2">
              <button
                onClick={handleAcceptAll}
                className="flex-1 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-black border-[3px] border-black shadow-[3px_3px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all"
              >
                {t.acceptAll}
              </button>
              <button
                onClick={handleRejectOptional}
                className="flex-1 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-black bg-white border-[3px] border-black shadow-[3px_3px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all"
              >
                {t.rejectOptional}
              </button>
            </div>
            <button
              onClick={() => setExpanded(true)}
              className="w-full flex items-center justify-center gap-1 px-3 py-2 text-[11px] font-bold text-[#424242] hover:text-black transition-colors"
              aria-expanded={expanded}
            >
              {t.customize}
              <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* ── Expanded: Granular Toggles ─────────────────────────────── */}
        {expanded && (
          <div className="px-5 pb-5 space-y-3">
            {/* Purpose toggles */}
            <div className="space-y-2">
              {PURPOSES.map(({ id, labelKey, descKey, locked }) => (
                <label
                  key={id}
                  className={`flex items-start gap-3 p-3 border-2 cursor-pointer transition-colors ${
                    purposes[id]
                      ? "border-black bg-[#F8F8F8]"
                      : "border-[#E0E0E0] bg-white"
                  } ${locked ? "cursor-not-allowed opacity-80" : "hover:border-black"}`}
                >
                  {/* Toggle */}
                  <div className="mt-0.5 flex-shrink-0">
                    <div
                      role="switch"
                      aria-checked={purposes[id]}
                      aria-label={t[labelKey]}
                      tabIndex={locked ? -1 : 0}
                      className={`w-9 h-5 border-2 border-black relative transition-colors ${
                        purposes[id] ? "bg-black" : "bg-white"
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (!locked) togglePurpose(id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === " " || e.key === "Enter") {
                          e.preventDefault();
                          if (!locked) togglePurpose(id);
                        }
                      }}
                    >
                      <div
                        className={`absolute top-0.5 w-3 h-3 border border-black transition-all ${
                          purposes[id]
                            ? "left-[18px] bg-white"
                            : "left-0.5 bg-[#9E9E9E]"
                        }`}
                      />
                    </div>
                  </div>
                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-black uppercase tracking-wider">
                        {t[labelKey]}
                      </span>
                      {locked && (
                        <span className="text-[9px] font-bold text-[#9E9E9E] border border-[#E0E0E0] px-1.5 py-0.5">
                          {lang === "en" ? "ALWAYS ON" : "हमेशा चालू"}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#424242] mt-0.5 leading-relaxed">
                      {t[descKey]}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            {/* Save button */}
            <button
              onClick={handleSaveChoices}
              className="w-full px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-black border-[3px] border-black shadow-[3px_3px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000] transition-all flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
              {t.saveChoices}
            </button>

            {/* Data Rights section */}
            <button
              onClick={() => setShowDataRights((v) => !v)}
              className="w-full flex items-center justify-center gap-1 text-[11px] font-bold text-[#424242] hover:text-black transition-colors pt-1"
              aria-expanded={showDataRights}
            >
              {t.dataRights}
              {showDataRights ? (
                <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
              )}
            </button>

            {showDataRights && (
              <div className="space-y-2 pt-1">
                <p className="text-[10px] text-[#9E9E9E] leading-relaxed">{t.dpdpNotice}</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleExportData}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-black bg-white border-2 border-black hover:bg-[#F8F8F8] transition-colors"
                  >
                    <Download className="w-3 h-3" aria-hidden="true" />
                    {t.exportData}
                  </button>
                  <button
                    onClick={handleDeleteData}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider border-2 transition-colors ${
                      confirmDelete
                        ? "bg-black text-white border-black"
                        : "text-black bg-white border-black hover:bg-[#F8F8F8]"
                    }`}
                  >
                    <Trash2 className="w-3 h-3" aria-hidden="true" />
                    {confirmDelete
                      ? lang === "en"
                        ? "Confirm Delete"
                        : "हटाने की पुष्टि करें"
                      : t.deleteData}
                  </button>
                </div>
                {confirmDelete && (
                  <p className="text-[10px] text-[#424242] text-center">{t.deleteConfirm}</p>
                )}
              </div>
            )}

            {/* Collapse */}
            <button
              onClick={() => setExpanded(false)}
              className="w-full flex items-center justify-center gap-1 text-[11px] font-bold text-[#9E9E9E] hover:text-black transition-colors"
            >
              {t.hideCustomize}
              <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* ── Footer: Privacy Policy Link ───────────────────────────── */}
        <div className="px-5 py-2 bg-[#F8F8F8] border-t-2 border-[#E0E0E0] flex items-center justify-between">
          <a
            href="/privacy"
            className="text-[10px] font-bold text-black underline flex items-center gap-1 hover:no-underline"
          >
            {t.privacyPolicy}
            <ExternalLink className="w-2.5 h-2.5" aria-hidden="true" />
          </a>
          <span className="text-[9px] text-[#9E9E9E]">DPDP Act 2023</span>
        </div>
      </div>
    </div>
  );
}

export default ConsentBanner;
