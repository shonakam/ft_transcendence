import fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import { registRouters } from './adapter/router/index.ts';
import { container } from './container/index.js';
import { initializeDatabase } from './infra/sqlite/db.ts';
import { initializeRedis } from './infra/redis/db.ts';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;
const HOST = process.env.HOST || '0.0.0.0';

async function main() {
  const server = fastify({ logger: true });
  await server.register(fastifyWebsocket);

  // setup cors
  await server.register(cors, {
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  // setup cookie
  await server.register(cookie, {
    secret: process.env.COOKIE_SECRET || 'FQJH1Fh/yGZuqYyRkTK4pemzZF1pEX0hjbAnWcvxOLA=',
    parseOptions: {}
  });

  await registRouters(server, container);

  try {
    console.log('Initializing database...');
    await initializeDatabase();
    await initializeRedis()
    console.log('Database initialized successfully.');

    await server.listen({ port: PORT, host: HOST });
    console.log(`🚀 Server running at http://${HOST}:${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

main();
