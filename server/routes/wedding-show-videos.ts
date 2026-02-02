import { RequestHandler } from "express";
import { dbRun, dbGet, dbAll } from "../database";
import { ApiResponse, ListResponse } from "../../shared/api";
import fs from "fs";
import path from "path";

// Get all wedding show videos
export const getWeddingShowVideos: RequestHandler = async (req, res) => {
  try {
    const items = await dbAll("SELECT * FROM wedding_show_videos ORDER BY createdAt DESC");
    const response: ListResponse<any> = {
      success: true,
      data: items,
      total: items.length
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching wedding show videos:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch wedding show videos' });
  }
};

// Get single wedding show video
export const getWeddingShowVideo: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await dbGet("SELECT * FROM wedding_show_videos WHERE id = ?", [id]);

    if (!item) {
      return res.status(404).json({ success: false, error: 'Wedding show video not found' });
    }

    const response: ApiResponse<any> = {
      success: true,
      data: item
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching wedding show video:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch wedding show video' });
  }
};

// Create wedding show video (simpler - just videoPath and optional thumbnail)
export const createWeddingShowVideo: RequestHandler = async (req, res) => {
  try {
    const { videoPath, thumbnail }: { videoPath: string; thumbnail?: string } = req.body;

    if (!videoPath) {
      return res.status(400).json({ success: false, error: 'Video path is required' });
    }

    const result = await dbRun(
      "INSERT INTO wedding_show_videos (videoPath, thumbnail) VALUES (?, ?)",
      [videoPath, thumbnail || '']
    );

    const newItem = await dbGet("SELECT * FROM wedding_show_videos WHERE id = ?", [result.lastID]);

    const response: ApiResponse<any> = {
      success: true,
      data: newItem,
      message: 'Wedding show video created successfully'
    };
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating wedding show video:', error);
    res.status(500).json({ success: false, error: 'Failed to create wedding show video' });
  }
};

// Update wedding show video (simpler - just videoPath and optional thumbnail)
export const updateWeddingShowVideo: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates: { videoPath?: string; thumbnail?: string } = req.body;

    // Check if item exists
    const existingItem = await dbGet("SELECT * FROM wedding_show_videos WHERE id = ?", [id]);
    if (!existingItem) {
      return res.status(404).json({ success: false, error: 'Wedding show video not found' });
    }

    // Build update query dynamically
    const updateFields = [];
    const values = [];

    if (updates.videoPath !== undefined) {
      updateFields.push("videoPath = ?");
      values.push(updates.videoPath);
    }
    if (updates.thumbnail !== undefined) {
      updateFields.push("thumbnail = ?");
      values.push(updates.thumbnail);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    updateFields.push("updatedAt = CURRENT_TIMESTAMP");
    values.push(id);

    await dbRun(
      `UPDATE wedding_show_videos SET ${updateFields.join(", ")} WHERE id = ?`,
      values
    );

    const updatedItem = await dbGet("SELECT * FROM wedding_show_videos WHERE id = ?", [id]);

    const response: ApiResponse<any> = {
      success: true,
      data: updatedItem,
      message: 'Wedding show video updated successfully'
    };
    res.json(response);
  } catch (error) {
    console.error('Error updating wedding show video:', error);
    res.status(500).json({ success: false, error: 'Failed to update wedding show video' });
  }
};

// Delete wedding show video
export const deleteWeddingShowVideo: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if item exists
    const existingItem = await dbGet("SELECT * FROM wedding_show_videos WHERE id = ?", [id]);
    if (!existingItem) {
      return res.status(404).json({ success: false, error: 'Wedding show video not found' });
    }

    // Delete physical files before removing from database
    const publicDir = path.join(process.cwd(), 'public');

    // Delete video file
    if (existingItem.videoPath) {
      const videoFilePath = path.join(publicDir, existingItem.videoPath.substring(1));
      try {
        if (fs.existsSync(videoFilePath)) {
          fs.unlinkSync(videoFilePath);
          console.log(`Deleted video file: ${videoFilePath}`);
        } else {
          console.log(`Video file not found: ${videoFilePath}`);
        }
      } catch (fileError) {
        console.error('Error deleting video file:', fileError);
        // Continue with deletion even if file deletion fails
      }
    }

    // Delete thumbnail file
    if (existingItem.thumbnail) {
      const thumbnailFilePath = path.join(publicDir, existingItem.thumbnail.substring(1));
      try {
        if (fs.existsSync(thumbnailFilePath)) {
          fs.unlinkSync(thumbnailFilePath);
          console.log(`Deleted thumbnail file: ${thumbnailFilePath}`);
        } else {
          console.log(`Thumbnail file not found: ${thumbnailFilePath}`);
        }
      } catch (fileError) {
        console.error('Error deleting thumbnail file:', fileError);
        // Continue with deletion even if file deletion fails
      }
    }

    // Delete from database
    await dbRun("DELETE FROM wedding_show_videos WHERE id = ?", [id]);

    res.json({ success: true, message: 'Wedding show video deleted successfully' });
  } catch (error) {
    console.error('Error deleting wedding show video:', error);
    res.status(500).json({ success: false, error: 'Failed to delete wedding show video' });
  }
};
