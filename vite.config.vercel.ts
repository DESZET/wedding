import { defineConfig } from "vite";
import path from "path";

const nodeExternals = [
  "fs",
  "path",
  "url",
  "http",
  "https",
  "os",
  "crypto",
  "stream",
  "util",
  "events",
  "buffer",
  "querystring",
  "child_process",
  "express",
  "cors",
  "multer",
  "bcryptjs",
  "@libsql/client",
  "better-sqlite3",
  "dotenv",
  "zod",
];

export default defineConfig({
  publicDir: false,
  build: {
    outDir: "dist/api",
    emptyOutDir: true,
    target: "node22",
    ssr: true,
    rollupOptions: {
      input: path.resolve(__dirname, "server/vercel-entry.ts"),
      external: nodeExternals,
      output: {
        format: "es",
        entryFileNames: "handler.mjs",
        inlineDynamicImports: true,
      },
    },
    minify: false,
    sourcemap: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  define: {
    "process.env.NODE_ENV": '"production"',
  },
});
