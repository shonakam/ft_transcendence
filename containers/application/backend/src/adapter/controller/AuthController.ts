import type { FastifyInstance, FastifyRequest } from 'fastify';
import { authUseCases } from '../../container/auth.container.ts';
import { LoginForm } from '../../domain/auth/form/LoginForm.ts';
import { OIDCForm } from '../../domain/auth/form/OIDCForm.ts';
import { Verify2faForm } from '../../domain/auth/form/Verify2faForm.ts';

export default async function AuthController(
  server: FastifyInstance,
  opts: { useCases: authUseCases },
) {
  const { login, loginWithOIDC, logout, refresh, verify2fa } = opts.useCases

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

  server.post(
    '/login/oidc/:provider',
    async (req: FastifyRequest<{ Params: { provider: string } }>, reply) => {
      try {
        const form = req.body as OIDCForm
        const token = await loginWithOIDC.execute(form, req.params.provider)
        reply.status(200).send(token)
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
    '/verify-2fa/:factor',
    async (req: FastifyRequest<{ Params: { factor: string } }>, reply) => {
      try {
        const form = req.body as Verify2faForm
        const token = await verify2fa.execute(form, req.params.factor)
        reply.status(200).send(token)
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
}