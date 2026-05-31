import serverless from "serverless-http";
import { createServer } from "./index";

let handler: ReturnType<typeof serverless> | undefined;

function isPingRequest(req: { url?: string; path?: string }): boolean {
  const path = (req.url || req.path || "").split("?")[0];
  return path === "/api/ping" || path === "/ping" || path.endsWith("/ping");
}

/** Fast path — no Express/DB (avoids 60s timeout when Turso is slow on cold start). */
function respondPing(res: { statusCode: number; setHeader: (k: string, v: string) => void; end: (b: string) => void }) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(
    JSON.stringify({
      message: process.env.PING_MESSAGE ?? "ping",
      turso: Boolean(process.env.DATABASE_URL?.trim()),
    }),
  );
}

export default async function vercelHandler(req: unknown, res: unknown) {
  const r = req as { url?: string; path?: string };
  const s = res as { statusCode: number; setHeader: (k: string, v: string) => void; end: (b: string) => void };

  if (isPingRequest(r)) {
    respondPing(s);
    return;
  }

  if (!handler) {
    handler = serverless(await createServer());
  }
  return handler(req as Parameters<typeof handler>[0], res as Parameters<typeof handler>[1]);
}
