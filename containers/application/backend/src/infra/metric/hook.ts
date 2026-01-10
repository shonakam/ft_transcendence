// infra/monitoring/hooks.ts
import type { FastifyInstance } from 'fastify';
import { httpRequestCounter } from './metrics.ts';

export function registerMetricHooks(server: FastifyInstance) {
  server.addHook('onResponse', async (req, reply) => {
    httpRequestCounter.inc({
      method: req.method,
      route: req.routeOptions?.url || 'unknown',
      status: String(reply.statusCode),
    });
  });
}
