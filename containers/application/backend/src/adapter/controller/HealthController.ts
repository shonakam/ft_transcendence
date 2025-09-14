import type { FastifyInstance } from 'fastify';

export default async function HealthController(server: FastifyInstance) {
  server.get('/health', async () => ({
    message: 'Hello world!',
  }));
}
