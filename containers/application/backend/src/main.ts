process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err, typeof err);
  console.error(err instanceof Error ? err.stack : err);
});

process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason, typeof reason);
  if (reason instanceof Error) console.error(reason.stack);
});

import fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from "@fastify/static";
import path from "node:path";
import ws from '@fastify/websocket';

import { registRouters } from './adapter/router/index.ts';

import { registerGameWebSocket } from './adapter/websocket/registerGameWebSocket.ts';
import { registerChatWebSocket } from './adapter/websocket/registerChatWebSocket.ts';

import { container } from './container/index.js';
import { initializeDatabase } from './infra/sqlite/db.ts';
import { initializeRedis } from './infra/redis/db.ts';
import { VaultService } from './infra/vault/vault.service.ts';
import minilog, { TAG } from './utils/minilog.ts';
import { initPrometheus } from './infra/metric/prometheus.ts';
import { registerMetricHooks } from './infra/metric/hook.ts';

// Global Vault service instance
export const vaultService = new VaultService();

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;
const HOST = process.env.HOST || '0.0.0.0';

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

/*
 * setup
 *  - cors
 *  - cookie
 *  - multipart
 *  - static
 *  - websocket
 */
async function server_conf(server: FastifyInstance, cookieSecret: string) {
  await server.register(cors, {
    // origin: 'http://localhost:5173',
    origin: 'https://transcendence.42.fr',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  await server.register(cookie, {
    secret: cookieSecret,
    parseOptions: {},
  });

  await server.register(fastifyMultipart, {
    attachFieldsToBody: true,
    limits: { fileSize: 5 * 1024 * 1024 }, // LIMIT 5MB
  });

  await server.register(fastifyStatic, {
    root: path.join(process.cwd(), "uploads"),
    prefix: "/api/uploads/",
  });

  await server.register(ws);
}

async function main() {
  const server = fastify({ logger: true });

  try {
    // Initialize Vault first (for secrets management)
    minilog.i(TAG.SYSTEM, 'Initializing Vault...');
    const vaultConnected = await vaultService.init();
    const vaultRequired = process.env.VAULT_REQUIRED === 'true';

    if (vaultConnected) {
      minilog.i(
        TAG.SYSTEM,
        '✅ Vault connected successfully - secrets will be loaded from Vault',
      );
    } else if (vaultRequired) {
      minilog.e(
        TAG.SYSTEM,
        '❌ VAULT_REQUIRED=true but Vault is not available! Aborting startup.',
      );
      process.exit(1);
    } else {
      minilog.w(
        TAG.SYSTEM,
        '⚠️  Vault not available - falling back to environment variables',
      );
      minilog.w(
        TAG.SYSTEM,
        '⚠️  Set VAULT_REQUIRED=true in production to enforce Vault usage',
      );
    }

    // Get cookie secret from Vault (with fallback to env)
    const cookieSecret =
      (await vaultService.getCookieSecret()) ||
      process.env.COOKIE_SECRET ||
      (() => {
        minilog.w(TAG.SYSTEM, '⚠️  Using fallback cookie secret - NOT SECURE FOR PRODUCTION');
        return 'dev-fallback-cookie-secret-change-me';
      })();

    await server_conf(server, cookieSecret);
    await registRouters(server, container);
    await registerGameWebSocket(server);
    await registerChatWebSocket(server);

    minilog.i(TAG.SYSTEM, 'Initializing database...');
    await initializeDatabase();

    minilog.i(TAG.SYSTEM, 'Initializing Redis...');
    await initializeRedis();

    minilog.i(TAG.SYSTEM, 'Initializing Prometheus...');
    initPrometheus();
    registerMetricHooks(server);

    minilog.i(TAG.SYSTEM, 'Database and Redis initialized successfully.');

    await server.listen({ port: PORT, host: HOST });
    minilog.i(TAG.SYSTEM, `🚀 Server running at http://${HOST}:${PORT}`);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    minilog.e(TAG.SYSTEM, `Failed to start server: ${errorMessage}`);
    process.exit(1);
  }
}

main();
