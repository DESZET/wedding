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
  build: {
    outDir: "dist/server",
    emptyOutDir: true,
    target: "node22",
    ssr: true,
    rollupOptions: {
      input: path.resolve(__dirname, "server/node-build.ts"),
      external: nodeExternals,
      output: {
        format: "es",
        entryFileNames: "node-build.mjs",
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
