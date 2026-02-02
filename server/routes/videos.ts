import { RequestHandler } from "express";
import { dbRun, dbGet, dbAll } from "../database";
import { VideoItem, CreateVideoItem, UpdateVideoItem, ApiResponse, ListResponse } from "../../shared/api";

// Get all videos
export const getVideos: RequestHandler = async (req, res) => {
  try {
    const items = await dbAll("SELECT * FROM videos ORDER BY createdAt DESC");
    const response: ListResponse<VideoItem> = {
      success: true,
      data: items,
      total: items.length
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch videos' });
  }
};

// Get single video
export const getVideo: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await dbGet("SELECT * FROM videos WHERE id = ?", [id]);

    if (!item) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }

    const response: ApiResponse<VideoItem> = {
      success: true,
      data: item
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch video' });
  }
};

// Create video
export const createVideo: RequestHandler = async (req, res) => {
  try {
    console.log('Create video request body:', req.body);
    const { title, description, videoPath, thumbnail }: { title: string; description: string; videoPath: string; thumbnail?: string } = req.body;

    if (!title || !description || !videoPath) {
      console.log('Missing required fields:', { title: !!title, description: !!description, videoPath: !!videoPath });
      return res.status(400).json({ success: false, error: 'Title, description, and video path are required' });
    }

    console.log('Inserting video:', { title, description, videoPath, thumbnail });

    // First, let's check if the videos table exists
    try {
      await dbRun("SELECT 1 FROM videos LIMIT 1");
      console.log('Videos table exists');
    } catch (tableError) {
      console.log('Videos table does not exist, creating it...');
      await dbRun(`
        CREATE TABLE IF NOT EXISTS videos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          videoPath TEXT NOT NULL,
          thumbnail TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Videos table created');
    }

    const result = await dbRun(
      "INSERT INTO videos (title, description, videoPath, thumbnail) VALUES (?, ?, ?, ?)",
      [title, description, videoPath, thumbnail || '']
    );

    console.log('Insert result:', result);
    const newItem = await dbGet("SELECT * FROM videos WHERE id = ?", [result.lastID]);
    console.log('New item:', newItem);

    const response: ApiResponse<VideoItem> = {
      success: true,
      data: newItem,
      message: 'Video created successfully'
    };
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating video:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ success: false, error: 'Failed to create video: ' + error.message });
  }
};

// Update video
export const updateVideo: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates: UpdateVideoItem = req.body;

    // Check if item exists
    const existingItem = await dbGet("SELECT * FROM videos WHERE id = ?", [id]);
    if (!existingItem) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }

    // Build update query dynamically
    const updateFields = [];
    const values = [];

    if (updates.title !== undefined) {
      updateFields.push("title = ?");
      values.push(updates.title);
    }
    if (updates.description !== undefined) {
      updateFields.push("description = ?");
      values.push(updates.description);
    }
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
      `UPDATE videos SET ${updateFields.join(", ")} WHERE id = ?`,
      values
    );

    const updatedItem = await dbGet("SELECT * FROM videos WHERE id = ?", [id]);

    const response: ApiResponse<VideoItem> = {
      success: true,
      data: updatedItem,
      message: 'Video updated successfully'
    };
    res.json(response);
  } catch (error) {
    console.error('Error updating video:', error);
    res.status(500).json({ success: false, error: 'Failed to update video' });
  }
};

// Delete video
export const deleteVideo: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if item exists
    const existingItem = await dbGet("SELECT * FROM videos WHERE id = ?", [id]);
    if (!existingItem) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }

    await dbRun("DELETE FROM videos WHERE id = ?", [id]);

    res.json({ success: true, message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ success: false, error: 'Failed to delete video' });
  }
};
