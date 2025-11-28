import type { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { config } from '../../conf.ts';
import UserId from '../../domain/user/vo/UserId.ts';

declare module 'fastify' {
  interface FastifyRequest {
    authUserId?: UserId; 
  }
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    request.log.warn('Missing or invalid Authorization header.');
    reply.code(401).send({ error: 'Unauthorized: Token not provided.' });
    return;
  }

  const token = authHeader.substring(7);
  const secret = config.auth.jwtAccessSecret; 

  try {
    const decoded = jwt.verify(token, secret); 
    if (typeof decoded !== 'object' || decoded === null || !decoded.sub) {
        request.log.warn('JWT payload missing user ID.');
        reply.code(401).send({ error: 'Unauthorized: Invalid token payload.' });
        return;
    }
    request.authUserId = UserId.from(decoded.sub); 

  } catch (err: unknown) {
    request.log.warn(`JWT verification failed: ${err}`);
    reply.code(401).send({ error: 'Unauthorized: Invalid or expired token.' });
    return;
  }
}
