import fastify from 'fastify';
import { registRouters } from './adapter/router/index.ts';
import { container } from './container/index.js'; 

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;
const HOST = process.env.HOST || '0.0.0.0';

async function main() {
  const server = fastify({ logger: true });
  await registRouters(server, container);

  try {
    await server.listen({ port: PORT, host: HOST });
    console.log(`🚀 Server running at http://${HOST}:${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

main();
