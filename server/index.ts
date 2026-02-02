import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import { handleDemo } from "./routes/demo";
import { getGallery, getGalleryItem, createGalleryItem, updateGalleryItem, deleteGalleryItem } from "./routes/gallery";
import { getTestimonials, getTestimonial, createTestimonial, updateTestimonial, deleteTestimonial } from "./routes/testimonials";
import { getPackages, getPackage, createPackage, updatePackage, deletePackage } from "./routes/packages";
import { getVenues, getVenue, createVenue, updateVenue, deleteVenue } from "./routes/venues";
import { getVideos, getVideo, createVideo, updateVideo, deleteVideo } from "./routes/videos";
import { getWeddingShowVideos, getWeddingShowVideo, createWeddingShowVideo, updateWeddingShowVideo, deleteWeddingShowVideo } from "./routes/wedding-show-videos";
import { getStats, getStat, createStat, updateStat, deleteStat } from "./routes/stats";
import { getSectionImages, getSectionImage, createSectionImage, updateSectionImage, deleteSectionImage } from "./routes/section-images";
import { initDatabase } from "./database";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve static files from public directory
  app.use('/uploads', express.static('public/uploads'));

  // Initialize database
  initDatabase();

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Gallery routes
  app.get("/api/gallery", getGallery);
  app.get("/api/gallery/:id", getGalleryItem);
  app.post("/api/gallery", createGalleryItem);
  app.put("/api/gallery/:id", updateGalleryItem);
  app.delete("/api/gallery/:id", deleteGalleryItem);

  // File upload route for gallery
  app.post("/api/upload", upload.single('image'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    res.json({
      success: true,
      data: {
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}`
      }
    });
  });

  // File upload route for videos
  app.post("/api/upload-video", upload.single('video'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No video file uploaded' });
    }
    res.json({
      success: true,
      data: {
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}`
      }
    });
  });

  // Testimonials routes
  app.get("/api/testimonials", getTestimonials);
  app.get("/api/testimonials/:id", getTestimonial);
  app.post("/api/testimonials", createTestimonial);
  app.put("/api/testimonials/:id", updateTestimonial);
  app.delete("/api/testimonials/:id", deleteTestimonial);

  // Packages routes
  app.get("/api/packages", getPackages);
  app.get("/api/packages/:id", getPackage);
  app.post("/api/packages", createPackage);
  app.put("/api/packages/:id", updatePackage);
  app.delete("/api/packages/:id", deletePackage);

  // Venues routes
  app.get("/api/venues", getVenues);
  app.get("/api/venues/:id", getVenue);
  app.post("/api/venues", createVenue);
  app.put("/api/venues/:id", updateVenue);
  app.delete("/api/venues/:id", deleteVenue);

  // Videos routes
  app.get("/api/videos", getVideos);
  app.get("/api/videos/:id", getVideo);
  app.post("/api/videos", createVideo);
  app.put("/api/videos/:id", updateVideo);
  app.delete("/api/videos/:id", deleteVideo);

  // Wedding Show Videos routes (simpler than regular videos)
  app.get("/api/wedding-show-videos", getWeddingShowVideos);
  app.get("/api/wedding-show-videos/:id", getWeddingShowVideo);
  app.post("/api/wedding-show-videos", createWeddingShowVideo);
  app.put("/api/wedding-show-videos/:id", updateWeddingShowVideo);
  app.delete("/api/wedding-show-videos/:id", deleteWeddingShowVideo);

  // Stats routes
  app.get("/api/stats", getStats);
  app.get("/api/stats/:id", getStat);
  app.post("/api/stats", createStat);
  app.put("/api/stats/:id", updateStat);
  app.delete("/api/stats/:id", deleteStat);

  // Section images routes
  app.get("/api/section-images", getSectionImages);
  app.get("/api/section-images/:id", getSectionImage);
  app.post("/api/section-images", createSectionImage);
  app.put("/api/section-images/:id", updateSectionImage);
  app.delete("/api/section-images/:id", deleteSectionImage);

  return app;
}
