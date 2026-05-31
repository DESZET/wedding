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
import { getSettings, getSetting, updateSetting, updateSettings } from "./routes/settings";
import { adminLogin, getAdminCredentials, updateAdminCredentials, initAdminCredentials, restartDb } from "./routes/admin-auth";
import { getUmrahPackages, getUmrahPackage, createUmrahPackage, updateUmrahPackage, deleteUmrahPackage } from "./routes/umrah-packages";
import { getHajiPackages, getHajiPackage, createHajiPackage, updateHajiPackage, deleteHajiPackage } from "./routes/haji-packages";
import { getServiceFAQs, getServiceFAQ, createServiceFAQ, updateServiceFAQ, deleteServiceFAQ } from "./routes/service-faqs";
import { getPrintingCategories, getPrintingCategory, createPrintingCategory, updatePrintingCategory, deletePrintingCategory } from "./routes/printing-categories";
import { getPrintingProducts, getPrintingProduct, createPrintingProduct, updatePrintingProduct, deletePrintingProduct } from "./routes/printing-products";
import { getPrintingPackages, getPrintingPackage, createPrintingPackage, updatePrintingPackage, deletePrintingPackage } from "./routes/printing-packages";
import customersRouter from "./routes/customers";
import customerDebtsRouter from "./routes/customer-debts";
import { getReligiousBookings, getReligiousBooking, createReligiousBooking, updateReligiousBooking, deleteReligiousBooking } from "./routes/religious-bookings";
import { getPrintingOrders, getPrintingOrder, createPrintingOrder, updatePrintingOrder, deletePrintingOrder } from "./routes/printing-orders";
import { migrateImport, migrateReset } from "./routes/migrate-import";
import { initDatabase } from "./database";

const isServerless = Boolean(process.env.VERCEL);

// Configure multer for file uploads
const storage = isServerless
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (_req, _file, cb) => {
        cb(null, "public/uploads/");
      },
      filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
      },
    });

const upload = multer({ storage });

export async function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve static files from public directory
  app.use('/uploads', express.static('public/uploads'));

  // Initialize database and admin credentials.
  // Important: During Vite config evaluation, sqlite3 native bindings may not be available.
  // Guard DB init so the SPA dev server can still start.
  try {
    await initDatabase();
    await initAdminCredentials();
  } catch (err) {
    console.error("[server] Database init failed:", err);
    if (isServerless && !process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL and DATABASE_AUTH_TOKEN must be set on Vercel (Turso). See VERCEL_DEPLOYMENT.md",
      );
    }
    if (!isServerless) {
      console.warn("[server] Continuing without DB (local dev only).");
    } else {
      throw err;
    }
  }


  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  app.post("/api/migrate-reset", migrateReset);
  app.post("/api/migrate-import", migrateImport);

  // Gallery routes
  app.get("/api/gallery", getGallery);
  app.get("/api/gallery/:id", getGalleryItem);
  app.post("/api/gallery", createGalleryItem);
  app.put("/api/gallery/:id", updateGalleryItem);
  app.delete("/api/gallery/:id", deleteGalleryItem);

  // File upload route for gallery
  app.post("/api/upload", upload.single("image"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }
    if (isServerless) {
      return res.status(503).json({
        success: false,
        error: "Upload baru belum tersedia di production. Gunakan gambar yang sudah ada atau hubungi admin.",
      });
    }
    res.json({
      success: true,
      data: {
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}`,
      },
    });
  });

  // File upload route for videos
  app.post("/api/upload-video", upload.single("video"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No video file uploaded" });
    }
    if (isServerless) {
      return res.status(503).json({
        success: false,
        error: "Upload video belum tersedia di production. Hubungi admin.",
      });
    }
    res.json({
      success: true,
      data: {
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}`,
      },
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

  // Settings routes
  app.get("/api/settings", getSettings);
  app.get("/api/settings/:key", getSetting);
  app.put("/api/settings/:key", updateSetting);
  app.post("/api/settings", updateSettings);

  // Admin routes
  app.post("/api/admin/login", adminLogin);
  app.get("/api/admin/credentials", getAdminCredentials);
  app.put("/api/admin/credentials", updateAdminCredentials);
  app.post("/api/admin/restart-db", restartDb);

  // Umrah packages routes
  app.get("/api/umrah-packages", getUmrahPackages);
  app.get("/api/umrah-packages/:id", getUmrahPackage);
  app.post("/api/umrah-packages", createUmrahPackage);
  app.put("/api/umrah-packages/:id", updateUmrahPackage);
  app.delete("/api/umrah-packages/:id", deleteUmrahPackage);

  // Haji packages routes
  app.get("/api/haji-packages", getHajiPackages);
  app.get("/api/haji-packages/:id", getHajiPackage);
  app.post("/api/haji-packages", createHajiPackage);
  app.put("/api/haji-packages/:id", updateHajiPackage);
  app.delete("/api/haji-packages/:id", deleteHajiPackage);

  // Service FAQs routes
  app.get("/api/service-faqs", getServiceFAQs);
  app.get("/api/service-faqs/:id", getServiceFAQ);
  app.post("/api/service-faqs", createServiceFAQ);
  app.put("/api/service-faqs/:id", updateServiceFAQ);
  app.delete("/api/service-faqs/:id", deleteServiceFAQ);

  // Printing categories routes
  app.get("/api/printing/categories", getPrintingCategories);
  app.get("/api/printing/categories/:id", getPrintingCategory);
  app.post("/api/printing/categories", createPrintingCategory);
  app.put("/api/printing/categories/:id", updatePrintingCategory);
  app.delete("/api/printing/categories/:id", deletePrintingCategory);

  // Printing products routes
  app.get("/api/printing/products", getPrintingProducts);
  app.get("/api/printing/products/:id", getPrintingProduct);
  app.post("/api/printing/products", createPrintingProduct);
  app.put("/api/printing/products/:id", updatePrintingProduct);
  app.delete("/api/printing/products/:id", deletePrintingProduct);

  // Printing packages routes
  app.get("/api/printing-packages", getPrintingPackages);
  app.get("/api/printing-packages/:id", getPrintingPackage);
  app.post("/api/printing-packages", createPrintingPackage);
  app.put("/api/printing-packages/:id", updatePrintingPackage);
  app.delete("/api/printing-packages/:id", deletePrintingPackage);

  // Customers routes
  app.use("/api/customers", customersRouter);

  // Customer debts routes
  app.use("/api/customer-debts", customerDebtsRouter);

  // Religious bookings routes (Umrah & Haji)
  app.get("/api/religious-bookings", getReligiousBookings);
  app.get("/api/religious-bookings/:id", getReligiousBooking);
  app.post("/api/religious-bookings", createReligiousBooking);
  app.put("/api/religious-bookings/:id", updateReligiousBooking);
  app.delete("/api/religious-bookings/:id", deleteReligiousBooking);

  // Printing orders routes
  app.get("/api/printing/orders", getPrintingOrders);
  app.get("/api/printing/orders/:id", getPrintingOrder);
  app.post("/api/printing/orders", createPrintingOrder);
  app.put("/api/printing/orders/:id", updatePrintingOrder);
  app.delete("/api/printing/orders/:id", deletePrintingOrder);

  return app;
}
