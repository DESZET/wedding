import { defineConfig } from "vite";
import path from "path";

// Build the Express server into a single bundled file for Vercel serverless
export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "server/index.ts"),
      formats: ["es"],
      fileName: () => "index.mjs",
    },
    outDir: "dist/api-bundle",
    target: "node22",
    ssr: true,
    rollupOptions: {
      // Keep runtime dependencies external — they'll be installed by Vercel
      external: [
        "express",
        "cors",
        "multer",
        "bcrypt",
        "better-sqlite3",
        "dotenv",
        "@libsql/client",
        "serverless-http",
        // Node built-ins
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
        "net",
        "tls",
        "zlib",
        "assert",
        "module",
        "perf_hooks",
        "async_hooks",
        "worker_threads",
      ],
      output: {
        format: "es",
        entryFileNames: "[name].mjs",
      },
    },
    minify: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
});
