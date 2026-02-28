/**
 * Bandhan AI — Privacy Settings Hook
 * LocalStorage-persisted privacy toggles.
 * Safe defaults: maximum privacy out-of-the-box.
 */

"use client";

import { useState, useCallback, useEffect } from "react";

export interface PrivacySetting {
  key: string;
  label: string;
  labelHi: string;
  description: string;
  descriptionHi: string;
  category: "visibility" | "activity" | "communication";
  defaultValue: boolean;
}

export const PRIVACY_SETTINGS: PrivacySetting[] = [
  {
    key: "profileVisible",
    label: "Profile Visible",
    labelHi: "प्रोफ़ाइल दिखाई दे",
    description: "Your profile appears in discovery feed",
    descriptionHi: "आपकी प्रोफ़ाइल डिस्कवरी फ़ीड में दिखाई देगी",
    category: "visibility",
    defaultValue: true,
  },
  {
    key: "showOnlineStatus",
    label: "Online Status",
    labelHi: "ऑनलाइन स्थिति",
    description: "Others can see when you're active",
    descriptionHi: "दूसरे देख सकते हैं कि आप कब सक्रिय हैं",
    category: "activity",
    defaultValue: true,
  },
  {
    key: "showLastSeen",
    label: "Last Seen",
    labelHi: "अंतिम बार देखा",
    description: "Show when you were last active",
    descriptionHi: "दिखाएं कि आप आखिरी बार कब सक्रिय थे",
    category: "activity",
    defaultValue: false,
  },
  {
    key: "readReceipts",
    label: "Read Receipts",
    labelHi: "पठन रसीद",
    description: "Let others know when you've read their messages",
    descriptionHi: "दूसरों को बताएं कि आपने उनके संदेश पढ़ लिए हैं",
    category: "communication",
    defaultValue: true,
  },
  {
    key: "profileVisits",
    label: "Profile Visit Tracking",
    labelHi: "प्रोफ़ाइल विज़िट ट्रैकिंग",
    description: "Allow others to see when you visit their profile",
    descriptionHi: "दूसरों को देखने दें कि आपने उनकी प्रोफ़ाइल कब देखी",
    category: "visibility",
    defaultValue: true,
  },
  {
    key: "showDistance",
    label: "Show Distance",
    labelHi: "दूरी दिखाएं",
    description: "Show approximate distance on your profile",
    descriptionHi: "अपनी प्रोफ़ाइल पर अनुमानित दूरी दिखाएं",
    category: "visibility",
    defaultValue: false,
  },
];

const STORAGE_KEY = "bandhan-privacy-settings";

export interface UsePrivacySettingsReturn {
  settings: Record<string, boolean>;
  toggleSetting: (key: string) => void;
  getSetting: (key: string) => boolean;
  resetToDefaults: () => void;
  settingDefs: PrivacySetting[];
}

function getDefaults(): Record<string, boolean> {
  const defaults: Record<string, boolean> = {};
  PRIVACY_SETTINGS.forEach((s) => {
    defaults[s.key] = s.defaultValue;
  });
  return defaults;
}

export function usePrivacySettings(): UsePrivacySettingsReturn {
  const [settings, setSettings] =
    useState<Record<string, boolean>>(getDefaults);

  // Hydrate from localStorage on client mount (SSR-safe)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSettings({ ...getDefaults(), ...JSON.parse(stored) });
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* ignore */
    }
  }, [settings]);

  const toggleSetting = useCallback((key: string) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const getSetting = useCallback(
    (key: string) => settings[key] ?? getDefaults()[key] ?? false,
    [settings],
  );

  const resetToDefaults = useCallback(() => {
    setSettings(getDefaults());
  }, []);

  return {
    settings,
    toggleSetting,
    getSetting,
    resetToDefaults,
    settingDefs: PRIVACY_SETTINGS,
  };
}
