import type { FastifyInstance } from 'fastify';

export default async function HealthController(server: FastifyInstance) {
  server.get('/health', async () => ({
    message: 'Hello world!',
  }));

  server.get('/decoy', async (request, reply) => {
      const query = request.query;

      return reply.status(200).send({
        status: 'WAF test endpoint is active',
        query_received: query,
      });
    });
}
