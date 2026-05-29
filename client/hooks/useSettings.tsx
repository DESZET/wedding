import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface Settings {
  [key: string]: string;
}

interface SettingsContextType {
  settings: Settings;
  loading: boolean;
  updateSettings: (newSettings: Settings) => Promise<{ success: boolean; error?: string }>;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const API_BASE = '/api';

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  return response.json();
};

// Function to apply settings to CSS variables
const applySettingsToCSS = (settings: Settings) => {
  const root = document.documentElement;

  // Map setting keys to CSS variable names
  const cssVariableMap: { [key: string]: string } = {
    'primary-color': '--primary',
    'secondary-color': '--secondary',
    'accent-color': '--accent',
    'background-color': '--background',
  };

  Object.entries(settings).forEach(([key, value]) => {
    if (cssVariableMap[key] && value) {
      // Convert hex color to HSL for Tailwind CSS
      const hsl = hexToHsl(value);
      if (hsl) {
        root.style.setProperty(cssVariableMap[key], hsl);
      }
    }
  });
};

// Helper function to convert hex to HSL
const hexToHsl = (hex: string): string | null => {
  // Handle 3-digit hex codes (e.g., #F00 -> #FF0000)
  if (/^#?([a-f\d])([a-f\d])([a-f\d])$/i.test(hex)) {
    hex = hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, '#$1$1$2$2$3$3');
  }
  
  // Handle 6-digit hex codes
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `${h} ${s}% ${l}%`;
};

// Settings Provider Component
export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);

  // Load settings from API
  const loadSettings = async () => {
    try {
      const response = await apiRequest('/settings');
      if (response.success) {
        const settingsObj: Settings = {};
        response.data.forEach((setting: any) => {
          settingsObj[setting.key] = setting.value;
        });
        setSettings(settingsObj);
        applySettingsToCSS(settingsObj);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update settings
  const updateSettings = async (newSettings: Settings) => {
    const oldSettings = { ...settings };

    // Update local state immediately
    setSettings(newSettings);
    applySettingsToCSS(newSettings);

    try {
      const settingsArray = Object.entries(newSettings).map(([key, value]) => ({
        key,
        value
      }));

      const response = await apiRequest('/settings', {
        method: 'POST',
        body: JSON.stringify(settingsArray)
      });

      if (response.success) {
        const settingsObj: Settings = {};
        response.data.forEach((setting: any) => {
          settingsObj[setting.key] = setting.value;
        });
        setSettings(settingsObj);
        applySettingsToCSS(settingsObj);
        // Notify other tabs/windows about the update
        localStorage.setItem('settings-updated', Date.now().toString());
        // Notify same tab about the update
        window.dispatchEvent(new CustomEvent('settingsUpdated'));
        return { success: true };
      } else {
        // Revert on failure
        setSettings(oldSettings);
        applySettingsToCSS(oldSettings);
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      // Revert on failure
      setSettings(oldSettings);
      applySettingsToCSS(oldSettings);
      return { success: false, error: 'Failed to update settings' };
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Listen for settings updates from other tabs/windows and same tab
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'settings-updated') {
        loadSettings();
      }
    };

    const handleCustomEvent = () => {
      loadSettings();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('settingsUpdated', handleCustomEvent);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('settingsUpdated', handleCustomEvent);
    };
  }, []);

  return (
    <SettingsContext.Provider value={{
      settings,
      loading,
      updateSettings,
      refreshSettings: loadSettings
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
