import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authenticate } from '../auth/authPreHandler.ts';
import type { ChatUseCases } from '../../container/chat.container.ts';
import type { MessageType } from '../../domain/chat/entity/ChatMessage.ts';

export default async function ChatController(
  server: FastifyInstance,
  opts: { useCases: ChatUseCases },
) {
  const {
    listUserRooms,
    getOrCreateDMRoom,
    getRoomMessages,
    sendMessage,
    blockUser,
    unblockUser,
    listBlockedUsers,
  } = opts.useCases;

  // GET /api/v1/chat/rooms
  server.get(
    '/rooms',
    { preHandler: authenticate },
    async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = req.authUserId;
        if (!userId) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }
        const rooms = await listUserRooms.execute(userId.get());
        reply.status(200).send(rooms);
      } catch (err: any) {
        reply.status(500).send({ error: err.message });
      }
    },
  );

  // POST /api/v1/chat/rooms/dm
  server.post<{ Body: { targetUserId: string } }>(
    '/rooms/dm',
    { preHandler: authenticate },
    async (
      req: FastifyRequest<{ Body: { targetUserId: string } }>,
      reply: FastifyReply,
    ) => {
      try {
        const userId = req.authUserId;
        if (!userId) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }
        const { targetUserId } = req.body;
        const room = await getOrCreateDMRoom.execute(
          userId.get(),
          targetUserId,
        );
        reply.status(200).send(room);
      } catch (err: any) {
        reply.status(400).send({ error: err.message });
      }
    },
  );

  // GET /api/v1/chat/rooms/:roomId/messages
  server.get<{ Params: { roomId: string } }>(
    '/rooms/:roomId/messages',
    { preHandler: authenticate },
    async (
      req: FastifyRequest<{ Params: { roomId: string } }>,
      reply: FastifyReply,
    ) => {
      try {
        const userId = req.authUserId;
        if (!userId) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }
        const { roomId } = req.params;
        const messages = await getRoomMessages.execute(userId.get(), roomId);
        reply.status(200).send(messages);
      } catch (err: any) {
        reply.status(500).send({ error: err.message });
      }
    },
  );

  // POST /api/v1/chat/rooms/:roomId/messages
  server.post<{
    Params: { roomId: string };
    Body: { content: string; messageType?: MessageType };
  }>(
    '/rooms/:roomId/messages',
    { preHandler: authenticate },
    async (
      req: FastifyRequest<{
        Params: { roomId: string };
        Body: { content: string; messageType?: MessageType };
      }>,
      reply: FastifyReply,
    ) => {
      try {
        const userId = req.authUserId;
        if (!userId) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }
        const { roomId } = req.params;
        const { content, messageType } = req.body;
        const message = await sendMessage.execute(
          userId.get(),
          roomId,
          content,
          messageType,
        );
        reply.status(201).send(message);
      } catch (err: any) {
        reply.status(400).send({ error: err.message });
      }
    },
  );

  // GET /api/v1/chat/blocks
  server.get(
    '/blocks',
    { preHandler: authenticate },
    async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = req.authUserId;
        if (!userId) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }
        const blockedUsers = await listBlockedUsers.execute(userId.get());
        reply.status(200).send(blockedUsers);
      } catch (err: any) {
        reply.status(500).send({ error: err.message });
      }
    },
  );

  // POST /api/v1/chat/blocks
  server.post<{ Body: { blockedUserId: string } }>(
    '/blocks',
    { preHandler: authenticate },
    async (
      req: FastifyRequest<{ Body: { blockedUserId: string } }>,
      reply: FastifyReply,
    ) => {
      try {
        const userId = req.authUserId;
        if (!userId) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }
        const { blockedUserId } = req.body;
        await blockUser.execute(userId.get(), blockedUserId);
        reply.status(201).send({ message: 'User blocked' });
      } catch (err: any) {
        reply.status(400).send({ error: err.message });
      }
    },
  );

  // DELETE /api/v1/chat/blocks/:blockedUserId
  server.delete<{ Params: { blockedUserId: string } }>(
    '/blocks/:blockedUserId',
    { preHandler: authenticate },
    async (
      req: FastifyRequest<{ Params: { blockedUserId: string } }>,
      reply: FastifyReply,
    ) => {
      try {
        const userId = req.authUserId;
        if (!userId) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }
        const { blockedUserId } = req.params;
        await unblockUser.execute(userId.get(), blockedUserId);
        reply.status(204).send();
      } catch (err: any) {
        reply.status(400).send({ error: err.message });
      }
    },
  );
}
