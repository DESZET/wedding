import { RequestHandler } from "express";
import { dbRun, dbGet, dbAll, restartDatabase } from "../database";
import bcrypt from "bcryptjs";

/** Pre-hashed admin123 (bcrypt 4 rounds) — avoids 60s CPU timeout on Vercel cold start */
const DEFAULT_ADMIN_HASH =
  "$2b$04$SV1HeWWs5R7oXC3pym8YzO8rLOyaEBEDmxo.xBmFWK23Wxix3hgq6";

function bcryptRounds(): number {
  return process.env.VERCEL ? 4 : 10;
}

// Initialize default admin credentials if not exists
export const initAdminCredentials = async () => {
  try {
    const existingAdmin = await dbGet<{ username?: string }>(
      "SELECT username FROM admin_credentials WHERE username = ?",
      ["admin"],
    );
    if (!existingAdmin) {
      await dbRun(
        "INSERT INTO admin_credentials (username, password, createdAt) VALUES (?, ?, CURRENT_TIMESTAMP)",
        ["admin", DEFAULT_ADMIN_HASH],
      );
      console.log("Default admin credentials initialized (admin / admin123)");
    }
  } catch (error) {
    console.error("Error initializing admin credentials:", error);
  }
};

// Login endpoint
export const adminLogin: RequestHandler = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, error: "Username and password are required" });
    }

    const admin = await dbGet<{ username?: string; password?: string }>(
      "SELECT username, password FROM admin_credentials WHERE username = ?",
      [username],
    );

    if (!admin?.password) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const storedHash = String(admin.password);
    const isValidPassword = await Promise.race([
      bcrypt.compare(password, storedHash),
      new Promise<boolean>((_, reject) =>
        setTimeout(() => reject(new Error("Password check timed out")), process.env.VERCEL ? 8000 : 30000),
      ),
    ]);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    // Generate a simple token (in production, use JWT)
    const token = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    res.json({
      success: true,
      data: {
        token,
        username: admin.username
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    const msg = error instanceof Error ? error.message : "Login failed";
    if (msg.includes("timed out") || msg.includes("Turso")) {
      return res.status(503).json({
        success: false,
        error: "Database timeout — cek DATABASE_URL di Vercel atau coba lagi.",
      });
    }
    res.status(500).json({ success: false, error: "Login failed" });
  }
};

// Get current admin credentials (for settings page)
export const getAdminCredentials: RequestHandler = async (req, res) => {
  try {
    const admin = await dbGet("SELECT username, createdAt, updatedAt FROM admin_credentials LIMIT 1");

    if (!admin) {
      return res.status(404).json({ success: false, error: "Admin credentials not found" });
    }

    res.json({
      success: true,
      data: admin
    });
  } catch (error) {
    console.error("Error fetching admin credentials:", error);
    res.status(500).json({ success: false, error: "Failed to fetch admin credentials" });
  }
};

// Update admin credentials
export const updateAdminCredentials: RequestHandler = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, error: "Username and password are required" });
    }

    const hashedPassword = await bcrypt.hash(password, bcryptRounds());

    // Check if admin credentials exist
    const existingAdmin = await dbGet("SELECT * FROM admin_credentials LIMIT 1");

    if (!existingAdmin) {
      // Create new credentials
      await dbRun(
        "INSERT INTO admin_credentials (username, password, createdAt) VALUES (?, ?, CURRENT_TIMESTAMP)",
        [username, hashedPassword]
      );
    } else {
      // Update existing credentials
      await dbRun(
        "UPDATE admin_credentials SET username = ?, password = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
        [username, hashedPassword, existingAdmin.id]
      );
    }

    res.json({
      success: true,
      message: "Admin credentials updated successfully"
    });
  } catch (error) {
    console.error("Error updating admin credentials:", error);
    res.status(500).json({ success: false, error: "Failed to update admin credentials" });
  }
};

// Restart database
export const restartDb: RequestHandler = async (req, res) => {
  try {
    await restartDatabase();
    res.json({
      success: true,
      message: "Database restarted successfully"
    });
  } catch (error) {
    console.error("Error restarting database:", error);
    res.status(500).json({ success: false, error: "Failed to restart database" });
  }
};
