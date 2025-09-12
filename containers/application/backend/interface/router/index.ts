import type { FastifyInstance } from 'fastify';
import healthController from '../controller/health.js';

export async function registRouters(
  server: FastifyInstance,
) {
  await server.register(
    healthController,
  );
}
