import type { FastifyInstance } from 'fastify';

export default async function UserController(
  server: FastifyInstance,
//   opts: { useCases: UserUseCases },
) { 

  server.post(
    '/login',
    async (req, reply) => {
      try {

      } catch (err: unknown) {
        if (err instanceof Error) {
          reply.status(400).send({ error: err.message });
        } else {
          reply.status(500).send({ message: 'Internal Server Error' });
        }
      }
    },
  );

  server.post(
    '/logout',
    async (req, reply) => {
      try {

      } catch (err: unknown) {
        if (err instanceof Error) {
          reply.status(400).send({ error: err.message });
        } else {
          reply.status(500).send({ message: 'Internal Server Error' });
        }
      }
    },
  );

  server.post(
    '/refresh',
    async (req, reply) => {
      try {

      } catch (err: unknown) {
        if (err instanceof Error) {
          reply.status(400).send({ error: err.message });
        } else {
          reply.status(500).send({ message: 'Internal Server Error' });
        }
      }
    },
  );
}