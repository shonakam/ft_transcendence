import type { FastifyInstance } from 'fastify';

export default async function healthController(
  server: FastifyInstance,
) {
  server.get(
    '/health',
    async () => ({
      message:
        'Hello world!',
    }),
  );
}
