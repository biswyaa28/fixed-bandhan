/**
 * Bandhan AI — Privacy Settings
 * Granular toggle list for privacy controls.
 * Grouped by category, with helper text and safe defaults.
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Eye, Radio, MessageCircle, RotateCcw } from "lucide-react";
import { usePrivacySettings, type PrivacySetting } from "@/hooks/usePrivacySettings";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

const CATEGORY_CONFIG: Record<string, { label: string; labelHi: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }> = {
  visibility: { label: "Profile Visibility", labelHi: "प्रोफ़ाइल दृश्यता", icon: Eye },
  activity: { label: "Activity Status", labelHi: "गतिविधि स्थिति", icon: Radio },
  communication: { label: "Communication", labelHi: "संचार", icon: MessageCircle },
};

export interface PrivacySettingsProps {
  language?: "en" | "hi";
  className?: string;
}

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className={cn(
        "relative w-10 h-6 border-2 border-black cursor-pointer",
        "transition-colors duration-150",
        checked ? "bg-black" : "bg-[#E0E0E0]",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      <motion.div
        className={cn(
          "absolute top-0.5 w-4 h-4 border-2 border-black",
          checked ? "bg-white" : "bg-white",
        )}
        animate={{ left: checked ? 18 : 2 }}
        transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
      />
    </button>
  );
}

export function PrivacySettings({ language = "en", className }: PrivacySettingsProps) {
  const { settings, toggleSetting, resetToDefaults, settingDefs } = usePrivacySettings();
  const [showConfirm, setShowConfirm] = useState(false);

  // Group settings by category
  const categories = ["visibility", "activity", "communication"];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 flex items-center justify-center bg-[#F8F8F8] border-2 border-black shadow-[2px_2px_0px_#000000]">
          <Shield className="w-5 h-5 text-black" strokeWidth={2} />
        </div>
        <div>
          <h3 className="text-sm font-heading font-bold text-black uppercase tracking-wide m-0">
            {language === "en" ? "Privacy Controls" : "गोपनीयता नियंत्रण"}
          </h3>
          <p className="text-xs text-[#9E9E9E] m-0 mt-0.5">
            {language === "en" ? "Manage your visibility and data" : "अपनी दृश्यता और डेटा प्रबंधित करें"}
          </p>
        </div>
      </div>

      {/* Categories */}
      {categories.map((cat) => {
        const config = CATEGORY_CONFIG[cat];
        const catSettings = settingDefs.filter((s) => s.category === cat);
        const Icon = config.icon;

        return (
          <div key={cat} className="border-2 border-black bg-white shadow-[2px_2px_0px_#000000]">
            {/* Category header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-[#F8F8F8] border-b-2 border-black">
              <Icon className="w-4 h-4 text-[#424242]" strokeWidth={2.5} />
              <span className="text-xs font-heading font-bold text-black uppercase tracking-wider">
                {language === "en" ? config.label : config.labelHi}
              </span>
            </div>

            {/* Settings */}
            <div>
              {catSettings.map((setting, i) => (
                <div
                  key={setting.key}
                  className={cn(
                    "flex items-center justify-between px-4 py-4",
                    i < catSettings.length - 1 && "border-b border-[#E0E0E0]",
                  )}
                >
                  <div className="flex-1 mr-4">
                    <p className="text-sm font-bold text-black m-0 leading-tight">
                      {language === "en" ? setting.label : setting.labelHi}
                    </p>
                    <p className="text-xs text-[#9E9E9E] m-0 mt-1 leading-normal max-w-[280px]">
                      {language === "en" ? setting.description : setting.descriptionHi}
                    </p>
                  </div>
                  <Toggle
                    checked={settings[setting.key] ?? setting.defaultValue}
                    onChange={() => toggleSetting(setting.key)}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Reset to defaults */}
      <button
        onClick={() => setShowConfirm(true)}
        className={cn(
          "w-full flex items-center justify-center gap-2",
          "px-4 py-3 bg-transparent border-2 border-dashed border-[#9E9E9E]",
          "text-xs font-heading font-bold uppercase text-[#9E9E9E]",
          "cursor-pointer hover:border-black hover:text-black",
        )}
      >
        <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
        {language === "en" ? "Reset to Defaults" : "डिफ़ॉल्ट पर रीसेट करें"}
      </button>

      {/* Confirm reset */}
      {showConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 border-2 border-black bg-[#F8F8F8] shadow-[4px_4px_0px_#000000]"
        >
          <p className="text-xs font-bold text-black m-0 mb-3">
            {language === "en"
              ? "Reset all privacy settings to defaults?"
              : "सभी गोपनीयता सेटिंग्स को डिफ़ॉल्ट पर रीसेट करें?"}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                resetToDefaults();
                setShowConfirm(false);
              }}
              className="px-4 py-2 bg-black text-white border-2 border-black text-xs font-heading font-bold uppercase cursor-pointer"
            >
              {language === "en" ? "Reset" : "रीसेट"}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="px-4 py-2 bg-white text-black border-2 border-black text-xs font-heading font-bold uppercase cursor-pointer"
            >
              {language === "en" ? "Cancel" : "रद्द"}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default PrivacySettings;
