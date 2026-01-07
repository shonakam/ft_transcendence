import fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import { registRouters } from './adapter/router/index.ts'
import { container } from './container/index.ts'
import { initializeDatabase } from './infra/sqlite/db.ts'
import { initializeRedis } from './infra/redis/db.ts'
import minilog, { TAG } from './utils/minilog.ts';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080
const HOST = process.env.HOST || '0.0.0.0'

process.on('uncaughtException', (err) => {
  console.error('=== UNCAUGHT EXCEPTION ===');
  console.error('Error:', err);
  console.error('Type:', typeof err);
  console.error('Constructor:', err?.constructor?.name);
  console.error('Message:', err?.message);
  console.error('Stack:', err?.stack);
  console.error('Keys:', Object.keys(err || {}));
  console.error('==========================');
  process.exit(1);
});

async function main() {
  const server = fastify({ logger: true });

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
    minilog.i(TAG.SYSTEM, 'Initializing database...')
    await initializeDatabase()

    minilog.i(TAG.SYSTEM, 'Initializing Redis...')
    await initializeRedis()

    minilog.i(TAG.SYSTEM, 'Database and Redis initialized successfully.')

    await server.listen({ port: PORT, host: HOST })
    minilog.i(TAG.SYSTEM, `🚀 Server running at http://${HOST}:${PORT}`)
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    minilog.e(TAG.SYSTEM, `Failed to start server: ${errorMessage}`)
    process.exit(1)
  }
}

main();
