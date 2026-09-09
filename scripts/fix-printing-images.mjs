import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@libsql/client";
import Database from "better-sqlite3";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(root, ".env.local") });
dotenv.config({ path: path.join(root, ".env") });

const imageMap = {
  1: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80",
  2: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80",
  3: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80",
  4: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=1200&q=80",
  5: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=1200&q=80",
  6: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80",
  7: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?auto=format&fit=crop&w=1200&q=80",
  8: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=80",
  9: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80",
};

function getImgForProduct(name, catId) {
  const n = (name || "").toLowerCase();
  if (n.includes("undangan simple")) return "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80";
  if (n.includes("undangan")) return "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80";
  if (n.includes("kaos") || n.includes("sablon")) return "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80";
  if (n.includes("banner") || n.includes("spanduk")) return "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80";
  if (n.includes("id card")) return "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=1200&q=80";
  if (n.includes("kartu nama")) return "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=1200&q=80";
  if (n.includes("brosur") || n.includes("flyer") || n.includes("photobook") || n.includes("album")) return "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80";
  if (n.includes("stiker") || n.includes("label")) return "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?auto=format&fit=crop&w=1200&q=80";
  if (n.includes("kemasan") || n.includes("box") || n.includes("packaging")) return "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=80";
  if (n.includes("merchandise") || n.includes("souvenir")) return "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80";
  return imageMap[catId] || "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80";
}

// 1. Update SQLite
console.log("Updating SQLite wedding.db...");
try {
  const db = new Database(path.join(root, "wedding.db"));
  const products = db.prepare("SELECT id, name, category_id, images FROM printing_products").all();
  for (const p of products) {
    if (!p.images || p.images.includes("1607344645866")) {
      const newImg = getImgForProduct(p.name, p.category_id);
      db.prepare("UPDATE printing_products SET images = ? WHERE id = ?").run(newImg, p.id);
      console.log(`Updated SQLite product ${p.id} (${p.name}) -> ${newImg.slice(0, 45)}...`);
    }
  }
} catch (e) {
  console.error("SQLite update error:", e.message);
}

// 2. Update Turso
console.log("\nUpdating Turso...");
try {
  const url = (process.env.DATABASE_URL || "").replace("libsql://", "https://");
  const token = process.env.DATABASE_AUTH_TOKEN;
  if (url && token) {
    const client = createClient({ url, authToken: token });
    const res = await client.execute("SELECT id, name, category_id, images FROM printing_products");
    for (const p of res.rows) {
      if (!p.images || p.images.includes("1607344645866") || p.images === "") {
        const newImg = getImgForProduct(p.name, p.category_id);
        await client.execute({
          sql: "UPDATE printing_products SET images = ? WHERE id = ?",
          args: [newImg, p.id]
        });
        console.log(`Updated Turso product ${p.id} (${p.name}) -> ${newImg.slice(0, 45)}...`);
      }
    }
  }
} catch (e) {
  console.error("Turso update error:", e.message);
}

console.log("\nDone!");
