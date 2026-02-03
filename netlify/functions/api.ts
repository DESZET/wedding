import serverless from "serverless-http";

import { createServer } from "../../server";

export const handler = serverless(async () => {
  const app = await createServer();
  return app;
});
