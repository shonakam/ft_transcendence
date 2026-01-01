import type { FastifyInstance } from 'fastify';
import { authenticate } from '../auth/authPreHandler.ts';
import { BlockUseCases } from '../../container/block.container.ts';

export default async function BlockController(
  server: FastifyInstance,
  opts: { useCases: BlockUseCases },
) {
  const { handleUserBlock } = opts.useCases;

  // POST /blocks/:userId
  server.post<{ Params: { userId: string } }>(
    '/:userId',
    { preHandler: authenticate },
    async (req, reply) => {
      try {
        const blockerId = req.authUserId!;
        const blockedId = req.params.userId;
        await handleUserBlock.block(blockerId, blockedId);
        reply.status(201).send({ message: 'User blocked' });
      } catch (err: unknown) {
        reply.status(400).send({ error: err instanceof Error ? err.message : 'Internal Server Error' });
      }
    }
  );

  // DELETE /blocks/:userId
  server.delete<{ Params: { userId: string } }>(
    '/:userId',
    { preHandler: authenticate },
    async (req, reply) => {
      try {
        const blockerId = req.authUserId!;
        const blockedId = req.params.userId;
        await handleUserBlock.unblock(blockerId, blockedId);
        reply.status(204).send();
      } catch (err: unknown) {
        reply.status(400).send({ error: err instanceof Error ? err.message : 'Internal Server Error' });
      }
    }
  );

  // GET /blocks
  server.get(
    '/',
    { preHandler: authenticate },
    async (req, reply) => {
      try {
        const blockerId = req.authUserId!;
        const blockedUsers = await handleUserBlock.getBlockedUsers(blockerId);
        reply.send(blockedUsers);
      } catch (err: unknown) {
        reply.status(500).send({ error: err instanceof Error ? err.message : 'Internal Server Error' });
      }
    }
  );
}
