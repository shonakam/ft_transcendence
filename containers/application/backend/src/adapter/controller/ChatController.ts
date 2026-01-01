import type { FastifyInstance } from 'fastify';
import { authenticate } from '../auth/authPreHandler.ts';
import { ChatUseCases } from '../../container/chat.container.ts';

export default async function ChatController(
  server: FastifyInstance,
  opts: { useCases: ChatUseCases },
) {
  const { getChatRooms, getChatHistory, sendChatMessage } = opts.useCases;

  // GET /chat/rooms
  server.get(
    '/rooms',
    { preHandler: authenticate },
    async (req, reply) => {
      try {
        const userId = req.authUserId!;
        const rooms = await getChatRooms.execute(userId);
        reply.send(rooms);
      } catch (err: unknown) {
        reply.status(500).send({ error: err instanceof Error ? err.message : 'Internal Server Error' });
      }
    }
  );

  // GET /chat/rooms/:roomId/messages
  server.get<{ Params: { roomId: string }, Querystring: { limit?: number, offset?: number } }>(
    '/rooms/:roomId/messages',
    { preHandler: authenticate },
    async (req, reply) => {
      try {
        const userId = req.authUserId!;
        const { roomId } = req.params;
        const { limit, offset } = req.query;
        const messages = await getChatHistory.execute(userId, roomId, limit, offset);
        reply.send(messages);
      } catch (err: unknown) {
        reply.status(500).send({ error: err instanceof Error ? err.message : 'Internal Server Error' });
      }
    }
  );

  // POST /chat/messages (Optional, mainly for invitations or fallback)
  server.post(
    '/messages',
    { preHandler: authenticate },
    async (req, reply) => {
      try {
        const userId = req.authUserId!;
        const body = req.body as any;
        const message = await sendChatMessage.execute({
          roomId: body.roomId,
          recipientId: body.recipientId,
          senderId: userId,
          content: body.content,
          messageType: body.messageType || 'text',
        });
        reply.status(201).send(message);
      } catch (err: unknown) {
        reply.status(400).send({ error: err instanceof Error ? err.message : 'Internal Server Error' });
      }
    }
  );
}
