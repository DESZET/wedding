import type { IncomingMessage, ServerResponse } from "http";
import serverless from "serverless-http";
import bcrypt from "bcryptjs";
import { createServer } from "./index";
import { ensureDb, dbGet } from "./database";

let handler: ReturnType<typeof serverless> | undefined;

function requestPath(req: { url?: string; path?: string }): string {
  return (req.url || req.path || "").split("?")[0];
}

function isPingRequest(req: { url?: string; path?: string }): boolean {
  const path = requestPath(req);
  return path === "/api/ping" || path === "/ping" || path.endsWith("/ping");
}

function isAdminLoginRequest(req: { url?: string; path?: string; method?: string }): boolean {
  const path = requestPath(req);
  return req.method === "POST" && (path === "/api/admin/login" || path.endsWith("/admin/login"));
}

/** Fast path — no Express/DB (avoids 60s timeout when Turso is slow on cold start). */
function respondPing(res: ServerResponse) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(
    JSON.stringify({
      message: process.env.PING_MESSAGE ?? "ping",
      turso: Boolean(process.env.DATABASE_URL?.trim()),
    }),
  );
}

async function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  const withBody = req as IncomingMessage & { body?: unknown };
  if (withBody.body && typeof withBody.body === "object") {
    return withBody.body as Record<string, unknown>;
  }
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : (chunk as Buffer));
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  return JSON.parse(raw) as Record<string, unknown>;
}

/** Lightweight login — skips loading full Express stack on serverless. */
async function handleAdminLogin(req: IncomingMessage, res: ServerResponse) {
  const send = (code: number, body: object) => {
    res.statusCode = code;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(body));
  };

  try {
    const body = await readJsonBody(req);
    const username = body.username;
    const password = body.password;

    if (!username || !password) {
      return send(400, { success: false, error: "Username and password are required" });
    }

    await ensureDb();
    const admin = await dbGet<{ username?: string; password?: string }>(
      "SELECT username, password FROM admin_credentials WHERE username = ?",
      [String(username)],
    );

    if (!admin?.password) {
      return send(401, { success: false, error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(String(password), String(admin.password));
    if (!ok) {
      return send(401, { success: false, error: "Invalid credentials" });
    }

    const token = `admin_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    send(200, { success: true, data: { token, username: admin.username } });
  } catch (err) {
    console.error("[vercel] admin login:", err);
    const msg = err instanceof Error ? err.message : "Login failed";
    if (msg.includes("timed out") || msg.includes("Turso")) {
      return send(503, { success: false, error: "Database timeout — coba lagi." });
    }
    send(500, { success: false, error: "Login failed" });
  }
}

export default async function vercelHandler(req: unknown, res: unknown) {
  const r = req as IncomingMessage;
  const s = res as ServerResponse;

  if (isPingRequest(r)) {
    respondPing(s);
    return;
  }

  if (isAdminLoginRequest(r)) {
    return handleAdminLogin(r, s);
  }

  if (!handler) {
    const app = await createServer();
    if (process.env.DATABASE_URL?.trim()) {
      try {
        await ensureDb();
      } catch (err) {
        console.error("[vercel] Turso warm-up failed:", err);
      }
    }
    handler = serverless(app);
  }
  return handler(req as Parameters<typeof handler>[0], res as Parameters<typeof handler>[1]);
}
