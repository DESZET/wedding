import { RequestHandler } from "express";
import { dbRun, dbGet, dbAll } from "../database";

export interface SettingsItem {
  id: number;
  key: string;
  value: string;
  createdAt?: string;
  updatedAt?: string;
}

// Get all settings
export const getSettings: RequestHandler = async (req, res) => {
  try {
    const items = await dbAll("SELECT * FROM settings ORDER BY key");
    const response = {
      success: true,
      data: items,
      total: items.length
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch settings' });
  }
};

// Get single setting
export const getSetting: RequestHandler = async (req, res) => {
  try {
    const { key } = req.params;
    const item = await dbGet("SELECT * FROM settings WHERE key = ?", [key]);

    if (!item) {
      return res.status(404).json({ success: false, error: 'Setting not found' });
    }

    const response = {
      success: true,
      data: item
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching setting:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch setting' });
  }
};

// Update setting
export const updateSetting: RequestHandler = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (!value) {
      return res.status(400).json({ success: false, error: 'Value is required' });
    }

    // Check if setting exists
    const existingItem = await dbGet("SELECT * FROM settings WHERE key = ?", [key]);
    if (!existingItem) {
      // Create new setting
      const result = await dbRun(
        "INSERT INTO settings (key, value) VALUES (?, ?)",
        [key, value]
      );

      const newItem = await dbGet("SELECT * FROM settings WHERE id = ?", [result.lastID]);
      const response = {
        success: true,
        data: newItem,
        message: 'Setting created successfully'
      };
      res.status(201).json(response);
    } else {
      // Update existing setting
      await dbRun(
        "UPDATE settings SET value = ?, updatedAt = CURRENT_TIMESTAMP WHERE key = ?",
        [value, key]
      );

      const updatedItem = await dbGet("SELECT * FROM settings WHERE key = ?", [key]);
      const response = {
        success: true,
        data: updatedItem,
        message: 'Setting updated successfully'
      };
      res.json(response);
    }
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ success: false, error: 'Failed to update setting' });
  }
};

// Bulk update settings
export const updateSettings: RequestHandler = async (req, res) => {
  try {
    const settings = req.body;

    if (!Array.isArray(settings)) {
      return res.status(400).json({ success: false, error: 'Settings must be an array' });
    }

    // Update each setting
    for (const setting of settings) {
      const { key, value } = setting;
      if (!key || !value) continue;

      const existingItem = await dbGet("SELECT * FROM settings WHERE key = ?", [key]);
      if (!existingItem) {
        await dbRun("INSERT INTO settings (key, value) VALUES (?, ?)", [key, value]);
      } else {
        await dbRun("UPDATE settings SET value = ?, updatedAt = CURRENT_TIMESTAMP WHERE key = ?", [value, key]);
      }
    }

    const updatedItems = await dbAll("SELECT * FROM settings ORDER BY key");
    const response = {
      success: true,
      data: updatedItems,
      message: 'Settings updated successfully'
    };
    res.json(response);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ success: false, error: 'Failed to update settings' });
  }
};
