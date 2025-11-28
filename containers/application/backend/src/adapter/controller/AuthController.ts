import type { FastifyInstance, FastifyRequest } from 'fastify';
import { authenticate } from '../auth/authPreHandler.ts'
import { authUseCases } from '../../container/auth.container.ts';
import { LoginForm } from '../../domain/auth/form/LoginForm.ts';
import { OIDCForm } from '../../domain/auth/form/OIDCForm.ts';
import { VerifyTOTPForm } from '../../domain/auth/form/VerifyTOTPForm.ts';
import { SetupTOTPForm } from '../../domain/auth/form/SetupTOTPForm.ts';

export default async function AuthController(
  server: FastifyInstance,
  opts: { useCases: authUseCases },
) {
  const { 
    login,
    loginWithOIDC,
    logout,
    refresh,
    setupTOTP,
    verifyTOTP,
    revokeTOTP,
  } = opts.useCases

  server.post(
    '/login',
    async (req, reply) => {
      try {
        const form = req.body as LoginForm;
        const response = await login.execute(form)
        const code = (!response.tmpAuthToken) ? 200 : 202
        reply.status(code).send(response)
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
        const response = await refresh.execute(token.refreshToken)
        reply.status(200).send(response)
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
        const response = await loginWithOIDC.execute(form, req.params.provider)
        reply.status(200).send(response)
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
    // '/setup-mfa/:factor',
    '/setup-mfa/totp',
    async (req: FastifyRequest<{ Params: { factor: string } }>, reply) => {
      try {
        const form = req.body as SetupTOTPForm
        const response = await setupTOTP.execute(form)
        reply.status(200).send(response)
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
        const response = await verifyTOTP.execute(form)
        reply.status(200).send(response)
      } catch (err: unknown) {
        if (err instanceof Error) {
          reply.status(400).send({ error: err.message });
        } else {
          reply.status(500).send({ message: 'Internal Server Error' });
        }
      }
    },
  );

  server.delete(
    // '/verify-mfa/:factor',
    '/revoke-mfa/totp',
    { preHandler: authenticate },
    async (req, reply) => {
      try {
        const trustedUserId = req.authUserId;
        if (trustedUserId === undefined) {
          return reply.status(500).send({ message: 'Authentication data missing.' }); 
        }

        await revokeTOTP.execute(trustedUserId)
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