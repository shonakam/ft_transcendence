// 捕获未处理异常和 Promise 拒绝
process.on('uncaughtException', (err: unknown) => {
  console.error('UNCAUGHT EXCEPTION:', err, typeof err);
  console.error(err instanceof Error ? err.stack : err);
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
  console.error('UNHANDLED REJECTION:', reason, typeof reason);
  if (reason instanceof Error) console.error(reason.stack);
});

import fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import { registRouters } from './adapter/router/index.ts';
import { registerWebSocket } from './adapter/websocket/registerWebSocket.ts';
import { container } from './container/index.ts';
import { initializeDatabase } from './infra/sqlite/db.ts';
import { initializeRedis } from './infra/redis/db.ts';
import minilog, { TAG } from './utils/minilog.ts';
import { initPrometheus } from './infra/metric/prometheus.ts';
import { registerMetricHooks } from './infra/metric/hook.ts';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;
const HOST = process.env.HOST || '0.0.0.0';

async function main() {
  const server = fastify({ logger: true });

  await server.register(cors, {
    origin: 'https://transcendence.42.fr',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  await server.register(cookie, {
    secret:
      process.env.COOKIE_SECRET ||
      'FQJH1Fh/yGZuqYyRkTK4pemzZF1pEX0hjbAnWcvxOLA=',
    parseOptions: {},
  });

  await registRouters(server, container);
  await registerWebSocket(server);

  try {
    minilog.i(TAG.SYSTEM, 'Initializing database...');
    await initializeDatabase();

    minilog.i(TAG.SYSTEM, 'Initializing Redis...');
    await initializeRedis();

    minilog.i(TAG.SYSTEM, 'Initializing Prometheus...');
    initPrometheus();
    registerMetricHooks(server);

    minilog.i(TAG.SYSTEM, 'Database and Redis initialized successfully.');
    await server.listen({ port: PORT, host: HOST });
    // 实际部署通过 nginx 反代 https，日志显示实际监听地址
    minilog.i(TAG.SYSTEM, `🚀 Server running at https://${HOST}:${PORT} (via nginx reverse proxy)`);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    minilog.e(TAG.SYSTEM, `Failed to start server: ${errorMessage}`);
    console.error('=== SERVER STARTUP ERROR ===');
    console.error('Error:', err);
    if (err instanceof Error) {
      console.error('Stack:', err.stack);
    } else {
      try {
        console.error('Stringified:', JSON.stringify(err));
      } catch (e) {
        console.error('Could not stringify error:', e);
      }
    }
    console.error('============================');
    process.exit(1);
  }
}

main();
