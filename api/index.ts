import { createServer } from '../dist/api-bundle/index.mjs';

let app: any;

async function getApp() {
  if (!app) {
    app = await createServer();
  }
  return app;
}

export default async (req: any, res: any) => {
  const server = await getApp();
  return server(req, res);
};
