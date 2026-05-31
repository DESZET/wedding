import serverless from "serverless-http";
import { createServer } from "./index";

let handler: ReturnType<typeof serverless> | undefined;

export default async function vercelHandler(req: unknown, res: unknown) {
  if (!handler) {
    handler = serverless(await createServer());
  }
  return handler(req as Parameters<typeof handler>[0], res as Parameters<typeof handler>[1]);
}
