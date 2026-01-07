import type { FastifyInstance } from 'fastify';
import minilog from '../../utils/minilog.ts';

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

  server.get('/log', async () => {
    minilog.i('HEALTH', `Standard log check (info)`);
    minilog.w('HEALTH', `Standard log check (warn)`);
    minilog.e('HEALTH', `Standard log check (error)`);
    minilog.d('HEALTH', `Standard log check (debug)`);
    return { message: 'Standard log check' };
  });
}
