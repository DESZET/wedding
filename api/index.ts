import { createServer } from '../server/index';

let server: any;

async function getServer() {
  if (!server) {
    server = await createServer();
  }
  return server;
}

export default async (req: any, res: any) => {
  const app = await getServer();
  return app(req, res);
};
