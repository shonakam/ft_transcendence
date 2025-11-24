import type { FastifyInstance, FastifyRequest } from 'fastify';
import { authUseCases } from '../../container/auth.container.ts';
import { LoginForm } from '../../domain/auth/form/LoginForm.ts';
import { OIDCForm } from '../../domain/auth/form/OIDCForm.ts';
import { VerifyTOTPForm } from '../../domain/auth/form/VerifyTOTPForm.ts';

export default async function AuthController(
  server: FastifyInstance,
  opts: { useCases: authUseCases },
) {
  const { 
    login,
    loginWithOIDC,
    logout,
    refresh,
    verifyTOTP
  } = opts.useCases

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

  server.get(
    // '/setup-mfa/:factor',
    '/setup-mfa/totp',
    async (req: FastifyRequest<{ Params: { factor: string } }>, reply) => {
      try {
        const form = req.body as VerifyTOTPForm
        const token = await verifyTOTP.execute(form, req.params.factor)
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
    // '/verify-mfa/:factor',
    '/verify-mfa/totp',
    async (req: FastifyRequest<{ Params: { factor: string } }>, reply) => {
      try {
        const form = req.body as VerifyTOTPForm
        const token = await verifyTOTP.execute(form, req.params.factor)
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