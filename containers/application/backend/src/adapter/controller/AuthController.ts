import type { FastifyInstance, FastifyRequest } from 'fastify';
import { authenticate } from '../auth/authPreHandler.ts';
import { authUseCases } from '../../container/auth.container.ts';
import { LoginForm } from '../../domain/auth/form/LoginForm.ts';
import { OIDCForm } from '../../domain/auth/form/OIDCForm.ts';
import { VerifyTOTPForm } from '../../domain/auth/form/VerifyTOTPForm.ts';
import { cookieConfig } from '../../conf.ts';

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
  } = opts.useCases;

  server.post('/login', async (req, reply) => {
    try {
      const form = req.body as LoginForm;
      const response = await login.execute(form);

      let code = 0;
      if (!response.tmpAuthToken) {
        code = 200;
        reply.setCookie('accessToken', response.accessToken!, cookieConfig);
        reply.setCookie('refreshToken', response.refreshToken!, cookieConfig);
      } else {
        code = 202;
        reply.setCookie('tmpAuthToken', response.tmpAuthToken, cookieConfig);
      }

      reply.status(code).send(response);
    } catch (err: unknown) {
      console.warn(err);
      if (err instanceof Error) {
        reply.status(400).send({ error: err.message });
      } else {
        reply.status(500).send({ message: 'Internal Server Error' });
      }
    }
  });

  server.post('/refresh', async (req, reply) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      const response = await refresh.execute(refreshToken!);

      reply.setCookie('accessToken', response.accessToken!, cookieConfig);
      reply.setCookie('refreshToken', response.refreshToken!, cookieConfig);
      reply.status(200).send(response);
    } catch (err: unknown) {
      const clearOptions = { ...cookieConfig, maxAge: 0, expires: new Date(0) };
      reply
        .clearCookie('accessToken', clearOptions)
        .clearCookie('refreshToken', clearOptions)
        .clearCookie('tmpAuthToken', clearOptions);
      if (err instanceof Error) {
        reply.status(401).send({ error: err.message });
      } else {
        reply.status(500).send({ message: 'Internal Server Error' });
      }
    }
  });

  server.post(
    '/login/oidc/:provider',
    async (req: FastifyRequest<{ Params: { provider: string } }>, reply) => {
      try {
        const form = req.body as OIDCForm
        const response = await loginWithOIDC.execute(form, req.params.provider)

        reply.setCookie('accessToken', response.accessToken!, cookieConfig)
        reply.setCookie('refreshToken', response.refreshToken!, cookieConfig)
        reply.status(200).send(response)
      } catch (err: unknown) {
        const clearOptions = { ...cookieConfig, maxAge: 0, expires: new Date(0) }
        reply
          .clearCookie('accessToken', clearOptions)
          .clearCookie('refreshToken', clearOptions)
          .clearCookie('tmpAuthToken', clearOptions)
        if (err instanceof Error) {
          reply.status(401).send({ error: err.message })
        } else {
          reply.status(500).send({ message: 'Internal Server Error' })
        }
      }
    },
  );

  server.get(
    // '/setup-mfa/:factor',
    '/setup-mfa/totp',
    async (req: FastifyRequest<{ Params: { factor: string } }>, reply) => {
      try {
        const accessToken = req.cookies.accessToken;
        const response = await setupTOTP.execute(accessToken!);
        reply.status(200).send(response);
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
        const accessToken = req.cookies.accessToken;
        const tmpAuthToken = req.cookies.tmpAuthToken;

        const form = req.body as VerifyTOTPForm;
        const response = await verifyTOTP.execute(
          form,
          accessToken!,
          tmpAuthToken!,
        );

        reply.setCookie('accessToken', response.accessToken, cookieConfig);
        reply.setCookie('refreshToken', response.refreshToken, cookieConfig);

        const clearOptions = {
          ...cookieConfig,
          maxAge: 0,
          expires: new Date(0),
        };
        reply.clearCookie('tmpAuthToken', clearOptions);

        reply.status(200).send(response);
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
          return reply
            .status(500)
            .send({ message: 'Authentication data missing.' });
        }

        await revokeTOTP.execute(trustedUserId);
        reply.status(200);
      } catch (err: unknown) {
        if (err instanceof Error) {
          reply.status(400).send({ error: err.message });
        } else {
          reply.status(500).send({ message: 'Internal Server Error' });
        }
      }
    },
  );

  server.delete('/logout', async (req, reply) => {
    try {
      const accessToken = req.cookies.accessToken;
      await logout.execute(accessToken!);
      const clearOptions = { ...cookieConfig, maxAge: 0, expires: new Date(0) };
      reply
        .clearCookie('accessToken', clearOptions)
        .clearCookie('refreshToken', clearOptions)
        .clearCookie('tmpAuthToken', clearOptions)
        .status(204)
        .send();
    } catch (err: unknown) {
      const clearOptions = { ...cookieConfig, maxAge: 0, expires: new Date(0) };
      reply
        .clearCookie('accessToken', clearOptions)
        .clearCookie('refreshToken', clearOptions);
      reply.status(500).send({ message: 'Internal Server Error' });
    }
  });
}
