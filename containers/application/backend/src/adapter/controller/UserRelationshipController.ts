import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserRelationshipUseCase } from '../../usecase/user/UserRelationshipUseCase.ts';
import { authenticate } from '../auth/authPreHandler.ts';

export class UserRelationshipController {
  constructor(private useCase: UserRelationshipUseCase) {}

  async requestFriend(
    req: FastifyRequest<{ Body: { targetId: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const userId = req.authUserId;
      const { targetId } = req.body;

      if (!userId) return reply.status(401).send({ error: 'Unauthorized' });
      if (!targetId)
        return reply.status(400).send({ error: 'Target ID is required' });

      await this.useCase.requestFriend(userId.get(), targetId);
      reply.status(200).send({ message: 'Friend request sent' });
    } catch (err: any) {
      reply.status(400).send({ error: err.message });
    }
  }

  async acceptFriend(
    req: FastifyRequest<{ Body: { targetId: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const userId = req.authUserId;
      const { targetId } = req.body;

      if (!userId) return reply.status(401).send({ error: 'Unauthorized' });
      if (!targetId)
        return reply.status(400).send({ error: 'Target ID is required' });

      await this.useCase.acceptFriend(userId.get(), targetId);
      reply.status(200).send({ message: 'Friend request accepted' });
    } catch (err: any) {
      reply.status(400).send({ error: err.message });
    }
  }

  async removeFriend(
    req: FastifyRequest<{ Params: { targetId: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const userId = req.authUserId;
      const { targetId } = req.params;

      if (!userId) return reply.status(401).send({ error: 'Unauthorized' });
      if (!targetId)
        return reply.status(400).send({ error: 'Target ID is required' });

      await this.useCase.removeFriend(userId.get(), targetId);
      reply.status(200).send({ message: 'Friend removed' });
    } catch (err: any) {
      reply.status(400).send({ error: err.message });
    }
  }

  async getFriends(req: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = req.authUserId;
      if (!userId) return reply.status(401).send({ error: 'Unauthorized' });

      const friends = await this.useCase.getFriends(userId.get());
      reply.status(200).send(friends);
    } catch (err: any) {
      reply.status(500).send({ error: err.message });
    }
  }

  async getPendingRequests(req: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = req.authUserId;
      if (!userId) return reply.status(401).send({ error: 'Unauthorized' });

      const requests = await this.useCase.getPendingRequests(userId.get());
      reply.status(200).send(requests);
    } catch (err: any) {
      reply.status(500).send({ error: err.message });
    }
  }
}

export const userRelationshipRoutes = (
  controller: UserRelationshipController,
) => {
  return async (server: FastifyInstance) => {
    server.post<{ Body: { targetId: string } }>(
      '/request',
      { preHandler: authenticate },
      (req, reply) => controller.requestFriend(req, reply),
    );
    server.post<{ Body: { targetId: string } }>(
      '/accept',
      { preHandler: authenticate },
      (req, reply) => controller.acceptFriend(req, reply),
    );
    server.delete<{ Params: { targetId: string } }>(
      '/:targetId',
      { preHandler: authenticate },
      (req, reply) => controller.removeFriend(req, reply),
    );
    server.get('/', { preHandler: authenticate }, (req, reply) =>
      controller.getFriends(req, reply),
    );
    server.get('/pending', { preHandler: authenticate }, (req, reply) =>
      controller.getPendingRequests(req, reply),
    );
  };
};
