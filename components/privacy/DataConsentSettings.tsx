/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Data Consent Settings (Privacy UI)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Full-featured consent management panel for Settings → Privacy.
 * Shows current consent state, allows per-purpose toggle, and
 * provides data export/deletion buttons.
 *
 * Comic book aesthetic: thick borders, hard shadows, monochromatic.
 * ─────────────────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Shield,
  Download,
  Trash2,
  ChevronDown,
  ChevronUp,
  Check,
  Clock,
  ExternalLink,
  Info,
} from "lucide-react";
import {
  getLocalConsent,
  updateConsent,
  PURPOSE_LABELS,
  type ConsentPurpose,
} from "@/lib/privacy/consent-manager";
import { getRetentionSummary, type RetentionRule } from "@/lib/privacy/retention-policy";

// ─── Types ───────────────────────────────────────────────────────────────

interface DataConsentSettingsProps {
  /** Callback when user requests data export */
  onExportData?: () => void;
  /** Callback when user requests account deletion */
  onDeleteAccount?: () => void;
  /** Language */
  language?: "en" | "hi";
  className?: string;
}

// ─── Strings ─────────────────────────────────────────────────────────────

const STRINGS = {
  en: {
    title: "Data & Privacy",
    subtitle: "Manage how your data is collected and processed",
    consentSection: "Consent Preferences",
    consentDesc: "Control which data processing activities you allow",
    alwaysOn: "ALWAYS ON",
    lastUpdated: "Last updated",
    never: "Never",
    saveChanges: "Save Changes",
    saved: "Saved ✓",
    retentionSection: "Data Retention",
    retentionDesc: "How long we keep different types of data",
    legalRequired: "Legal requirement",
    canRequest: "You can request early deletion",
    dataRights: "Your Data Rights (DPDP Act 2023)",
    rightAccess: "Right to Access (§11)",
    rightAccessDesc: "Download all your personal data in JSON format",
    rightErasure: "Right to Erasure (§12)",
    rightErasureDesc: "Permanently delete your account and all data",
    rightCorrection: "Right to Correction (§12)",
    rightCorrectionDesc: "Edit your profile to correct any information",
    rightGrievance: "Right to Grievance (§13)",
    rightGrievanceDesc: "Contact our Grievance Officer at grievance@bandhan.ai",
    exportBtn: "Export My Data",
    deleteBtn: "Delete My Account",
    editProfile: "Edit Profile",
    contactGrievance: "Contact Officer",
    dataLocalization: "All personal data is stored in India (Mumbai — asia-south1)",
    policyVersion: "Privacy Policy Version",
  },
  hi: {
    title: "डेटा और गोपनीयता",
    subtitle: "आपका डेटा कैसे एकत्र और संसाधित किया जाता है, इसे प्रबंधित करें",
    consentSection: "सहमति प्राथमिकताएं",
    consentDesc: "नियंत्रित करें कि आप किन डेटा प्रसंस्करण गतिविधियों की अनुमति देते हैं",
    alwaysOn: "हमेशा चालू",
    lastUpdated: "अंतिम अपडेट",
    never: "कभी नहीं",
    saveChanges: "परिवर्तन सहेजें",
    saved: "सहेजा गया ✓",
    retentionSection: "डेटा प्रतिधारण",
    retentionDesc: "हम विभिन्न प्रकार के डेटा को कितने समय तक रखते हैं",
    legalRequired: "कानूनी आवश्यकता",
    canRequest: "आप शीघ्र हटाने का अनुरोध कर सकते हैं",
    dataRights: "आपके डेटा अधिकार (DPDP अधिनियम 2023)",
    rightAccess: "पहुँच का अधिकार (§11)",
    rightAccessDesc: "JSON प्रारूप में अपना सभी व्यक्तिगत डेटा डाउनलोड करें",
    rightErasure: "मिटाने का अधिकार (§12)",
    rightErasureDesc: "अपना खाता और सभी डेटा स्थायी रूप से हटाएं",
    rightCorrection: "सुधार का अधिकार (§12)",
    rightCorrectionDesc: "किसी भी जानकारी को सही करने के लिए अपनी प्रोफ़ाइल संपादित करें",
    rightGrievance: "शिकायत का अधिकार (§13)",
    rightGrievanceDesc: "हमारे शिकायत अधिकारी से संपर्क करें: grievance@bandhan.ai",
    exportBtn: "मेरा डेटा निर्यात करें",
    deleteBtn: "मेरा खाता हटाएं",
    editProfile: "प्रोफ़ाइल संपादित करें",
    contactGrievance: "अधिकारी से संपर्क करें",
    dataLocalization: "सभी व्यक्तिगत डेटा भारत में संग्रहीत है (मुंबई — asia-south1)",
    policyVersion: "गोपनीयता नीति संस्करण",
  },
} as const;

// ─── Component ───────────────────────────────────────────────────────────

const ALL_PURPOSES: ConsentPurpose[] = ["essential", "matching", "safety", "marketing"];

export function DataConsentSettings({
  onExportData,
  onDeleteAccount,
  language = "en",
  className = "",
}: DataConsentSettingsProps) {
  const t = STRINGS[language];
  const isHi = language === "hi";

  const [purposes, setPurposes] = useState<Record<ConsentPurpose, boolean>>({
    essential: true, matching: false, safety: false, marketing: false,
  });
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [policyVersion, setPolicyVersion] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showRetention, setShowRetention] = useState(false);
  const [retentionRules, setRetentionRules] = useState<ReturnType<typeof getRetentionSummary>["rules"]>([]);

  // Load current state
  useEffect(() => {
    const consent = getLocalConsent();
    setPurposes(consent.purposes);
    setLastUpdated(consent.updatedAt);
    setPolicyVersion(consent.policyVersion);
    setRetentionRules(getRetentionSummary(language).rules);
  }, [language]);

  const handleToggle = useCallback((purpose: ConsentPurpose) => {
    if (purpose === "essential") return;
    setPurposes((prev) => ({ ...prev, [purpose]: !prev[purpose] }));
    setDirty(true);
    setSaved(false);
  }, []);

  const handleSave = useCallback(() => {
    updateConsent(purposes, "settings");
    setDirty(false);
    setSaved(true);
    setLastUpdated(new Date().toISOString());
    setTimeout(() => setSaved(false), 3000);
  }, [purposes]);

  const formatDate = (iso: string): string => {
    if (!iso) return t.never;
    try {
      return new Date(iso).toLocaleDateString(isHi ? "hi-IN" : "en-IN", {
        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className={className}>
      {/* ── Section Header ── */}
      <div className="flex items-center gap-2 mb-1">
        <Shield size={18} strokeWidth={2.5} className="text-black" />
        <h2 className="text-base font-bold text-[#212121] uppercase tracking-wider font-heading">
          {t.title}
        </h2>
      </div>
      <p className="text-[11px] text-[#9E9E9E] mb-4">{t.subtitle}</p>

      {/* ── Consent Toggles ── */}
      <div className="border-[2px] border-black shadow-[4px_4px_0px_#000] bg-white mb-4">
        <div className="border-b-[2px] border-black bg-[#212121] text-white px-4 py-2.5">
          <h3 className="text-[11px] font-bold uppercase tracking-wider">{t.consentSection}</h3>
          <p className="text-[9px] text-[#9E9E9E] mt-0.5">{t.consentDesc}</p>
        </div>

        {ALL_PURPOSES.map((purpose, i) => {
          const labels = PURPOSE_LABELS[purpose];
          const isLocked = purpose === "essential";
          const isLast = i === ALL_PURPOSES.length - 1;

          return (
            <div
              key={purpose}
              className={`flex items-start gap-3 px-4 py-3 ${!isLast ? "border-b border-dashed border-[#E0E0E0]" : ""}`}
            >
              {/* Toggle */}
              <button
                role="switch"
                aria-checked={purposes[purpose]}
                aria-label={isHi ? labels.hi : labels.en}
                disabled={isLocked}
                onClick={() => handleToggle(purpose)}
                className={`relative w-10 h-5 border-[2px] border-black mt-0.5 flex-shrink-0 transition-colors ${
                  isLocked ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                } ${purposes[purpose] ? "bg-black" : "bg-[#E0E0E0]"}`}
              >
                <div
                  className={`absolute top-[2px] w-[14px] h-[14px] bg-white border-[1px] border-black transition-[left] duration-150 ${
                    purposes[purpose] ? "left-[20px]" : "left-[2px]"
                  }`}
                />
              </button>

              {/* Labels */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#212121]">
                    {isHi ? labels.hi : labels.en}
                  </span>
                  {isLocked && (
                    <span className="text-[8px] font-bold text-[#9E9E9E] border border-[#E0E0E0] px-1.5 py-0.5">
                      {t.alwaysOn}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-[#9E9E9E] mt-0.5 leading-relaxed">
                  {isHi ? labels.descHi : labels.descEn}
                </p>
              </div>
            </div>
          );
        })}

        {/* Last updated + Save */}
        <div className="border-t-[2px] border-dashed border-[#E0E0E0] px-4 py-3 flex items-center justify-between">
          <span className="text-[9px] text-[#9E9E9E]">
            {t.lastUpdated}: {formatDate(lastUpdated)}
          </span>
          {dirty && (
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 border-[2px] border-black bg-black text-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider shadow-[3px_3px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000] transition-all"
            >
              <Check size={10} strokeWidth={3} />
              {t.saveChanges}
            </button>
          )}
          {saved && (
            <span className="text-[10px] font-bold text-black">{t.saved}</span>
          )}
        </div>
      </div>

      {/* ── Data Retention ── */}
      <div className="border-[2px] border-black shadow-[4px_4px_0px_#000] bg-white mb-4">
        <button
          onClick={() => setShowRetention((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#F8F8F8] transition-colors"
          aria-expanded={showRetention}
        >
          <div className="flex items-center gap-2">
            <Clock size={14} strokeWidth={2.5} className="text-black" />
            <div className="text-left">
              <h3 className="text-[11px] font-bold text-[#212121] uppercase tracking-wider">
                {t.retentionSection}
              </h3>
              <p className="text-[9px] text-[#9E9E9E]">{t.retentionDesc}</p>
            </div>
          </div>
          {showRetention
            ? <ChevronUp size={14} strokeWidth={3} className="text-[#9E9E9E]" />
            : <ChevronDown size={14} strokeWidth={3} className="text-[#9E9E9E]" />}
        </button>

        {showRetention && (
          <div className="border-t-[2px] border-black">
            {retentionRules.map((rule, i) => (
              <div
                key={i}
                className={`px-4 py-2.5 flex items-center justify-between ${
                  i < retentionRules.length - 1 ? "border-b border-dashed border-[#E0E0E0]" : ""
                }`}
              >
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-bold text-[#212121]">{rule.label}</span>
                  {rule.legalBasis && (
                    <span className="ml-1.5 text-[8px] text-[#9E9E9E] border border-[#E0E0E0] px-1 py-0.5">
                      {t.legalRequired}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-bold text-[#424242] flex-shrink-0 ml-2">
                  {rule.period}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Data Rights (DPDP Act §11-§14) ── */}
      <div className="border-[2px] border-black shadow-[4px_4px_0px_#000] bg-white mb-4">
        <div className="border-b-[2px] border-black bg-[#212121] text-white px-4 py-2.5">
          <h3 className="text-[11px] font-bold uppercase tracking-wider">{t.dataRights}</h3>
        </div>

        {/* Right to Access */}
        <div className="px-4 py-3 border-b border-dashed border-[#E0E0E0]">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#212121]">{t.rightAccess}</p>
              <p className="text-[10px] text-[#9E9E9E] mt-0.5">{t.rightAccessDesc}</p>
            </div>
            <button
              onClick={onExportData}
              className="flex items-center gap-1.5 border-[2px] border-black px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider hover:bg-[#F8F8F8] transition-colors flex-shrink-0 shadow-[2px_2px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000]"
            >
              <Download size={10} strokeWidth={3} />
              {t.exportBtn}
            </button>
          </div>
        </div>

        {/* Right to Correction */}
        <div className="px-4 py-3 border-b border-dashed border-[#E0E0E0]">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#212121]">{t.rightCorrection}</p>
              <p className="text-[10px] text-[#9E9E9E] mt-0.5">{t.rightCorrectionDesc}</p>
            </div>
            <a
              href="/profile"
              className="flex items-center gap-1.5 border-[2px] border-black px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider no-underline text-black hover:bg-[#F8F8F8] transition-colors flex-shrink-0 shadow-[2px_2px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000]"
            >
              {t.editProfile}
            </a>
          </div>
        </div>

        {/* Right to Erasure */}
        <div className="px-4 py-3 border-b border-dashed border-[#E0E0E0]">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#212121]">{t.rightErasure}</p>
              <p className="text-[10px] text-[#9E9E9E] mt-0.5">{t.rightErasureDesc}</p>
            </div>
            <button
              onClick={onDeleteAccount}
              className="flex items-center gap-1.5 border-[2px] border-black px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors flex-shrink-0 shadow-[2px_2px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000]"
            >
              <Trash2 size={10} strokeWidth={3} />
              {t.deleteBtn}
            </button>
          </div>
        </div>

        {/* Right to Grievance */}
        <div className="px-4 py-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#212121]">{t.rightGrievance}</p>
              <p className="text-[10px] text-[#9E9E9E] mt-0.5">{t.rightGrievanceDesc}</p>
            </div>
            <a
              href="mailto:grievance@bandhan.ai"
              className="flex items-center gap-1.5 border-[2px] border-black px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider no-underline text-black hover:bg-[#F8F8F8] transition-colors flex-shrink-0 shadow-[2px_2px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000]"
            >
              <ExternalLink size={10} strokeWidth={3} />
              {t.contactGrievance}
            </a>
          </div>
        </div>
      </div>

      {/* ── Footer Info ── */}
      <div className="flex items-start gap-2 px-1">
        <Info size={12} strokeWidth={2} className="text-[#9E9E9E] mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-[9px] text-[#9E9E9E] leading-relaxed">{t.dataLocalization}</p>
          <p className="text-[9px] text-[#9E9E9E] mt-1">
            {t.policyVersion}: {policyVersion}
          </p>
        </div>
      </div>
    </div>
  );
}

export default DataConsentSettings;
