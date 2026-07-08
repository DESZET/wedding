import path from "path";
import { pathToFileURL } from "url";

let handler;

/** @type {import('@vercel/node').VercelApiHandler} */
export default async function vercelApi(req, res) {
  if (!handler) {
    const bundlePath = path.join(process.cwd(), "dist/api/handler.mjs");
    const mod = await import(pathToFileURL(bundlePath).href);
    handler = mod.default;
  }
  return handler(req, res);
}

export const config = {
  maxDuration: 60,
};
