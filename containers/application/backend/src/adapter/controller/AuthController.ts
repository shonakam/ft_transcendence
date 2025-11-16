import type { FastifyInstance } from 'fastify';
import { authUseCases } from '../../container/auth.container.ts';
import { LoginForm } from '../../domain/auth/form/LoginForm.ts';
import { OIDCForm } from '../../domain/auth/form/OIDCForm.ts';
import Email from '../../domain/user/vo/Email.ts';

export default async function UserController(
  server: FastifyInstance,
  opts: { useCases: authUseCases },
) {
  const { login } = opts.useCases

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

  // server.post(
  //   '/logout',
  //   async (req, reply) => {
  //     try {

  //     } catch (err: unknown) {
  //       if (err instanceof Error) {
  //         reply.status(400).send({ error: err.message });
  //       } else {
  //         reply.status(500).send({ message: 'Internal Server Error' });
  //       }
  //     }
  //   },
  // );

  // server.post(
  //   '/refresh',
  //   async (req, reply) => {
  //     try {

  //     } catch (err: unknown) {
  //       if (err instanceof Error) {
  //         reply.status(400).send({ error: err.message });
  //       } else {
  //         reply.status(500).send({ message: 'Internal Server Error' });
  //       }
  //     }
  //   },
  // );
}