import type { FastifyInstance } from 'fastify';
import { authUseCases } from '../../container/auth.container.ts';
import { LoginForm } from '../../domain/auth/form/LoginForm.ts';
import { OIDCForm } from '../../domain/auth/form/OIDCForm.ts';

export default async function UserController(
  server: FastifyInstance,
  opts: { useCases: authUseCases },
) {
  const { login, logout, refresh } = opts.useCases

  server.post(
    '/login',
    async (req, reply) => {
      try {
        const form = req.body as LoginForm;
        const tokens = await login.execute(form)
        reply.status(200).send(tokens)
      } catch (err: unknown) {
        if (err instanceof Error) {
          reply.status(400).send({ error: err.message });
        } else {
          reply.status(500).send({ message: 'Internal Server Error' });
        }
      }
    },
  );

  // server.post(
  //   '/login/github',
  //   async (req, reply) => {
  //     try {
  //       const form = req.body as LoginForm | OIDCForm
  //       const tokens
  //       reply.status().send(tokens)
  //     } catch (err: unknown) {
  //       if (err instanceof Error) {
  //         reply.status(400).send({ error: err.message });
  //       } else {
  //         reply.status(500).send({ message: 'Internal Server Error' });
  //       }
  //     }
  //   },
  // );

  server.post(
    '/logout',
    async (req, reply) => {
      try {
        console.log("HERE", req.headers)
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          console.warn('Missing or invalid Authorization header.');
          reply.code(401).send({ error: 'Unauthorized: Token not provided.' });
          return;
        }

        const token = authHeader.substring(7);
        await logout.execute(token)
        reply.status(200)
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
        console.log("HERE", req.body)
        const token = req.body as { refreshToken: string }
        const tokens = await refresh.execute(token.refreshToken)
        reply.status(200).send(tokens)
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
