import { useState, useEffect } from 'react';

interface Settings {
  [key: string]: string;
}

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

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);

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
        setSettings(newSettings);
        applySettingsToCSS(newSettings);
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      return { success: false, error: 'Failed to update settings' };
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return {
    settings,
    loading,
    updateSettings,
    refreshSettings: loadSettings
  };
};
