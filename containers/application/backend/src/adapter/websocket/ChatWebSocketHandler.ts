import type { FastifyInstance } from 'fastify';
import jwt from 'jsonwebtoken';
import { config } from '../../conf.ts';
import { ChatUseCases } from '../../container/chat.container.ts';

// Simple in-memory connection management
// In a real production app with multiple instances, use Redis Pub/Sub
const connections = new Map<string, Set<any>>(); // userId -> set of connections

export default function ChatWebSocketHandler(
  server: FastifyInstance,
  opts: { useCases: ChatUseCases }
) {
  const { sendChatMessage } = opts.useCases;

  server.get('/chat/ws', { websocket: true }, (connection, req) => {
    let authenticatedUserId: string | null = null;

    connection.socket.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message.toString());

        // 1. Authentication
        if (data.type === 'auth') {
          const token = data.token;
          const decoded = jwt.verify(token, config.auth.jwtAccessSecret) as any;
          authenticatedUserId = decoded.sub;

          if (!authenticatedUserId) {
            connection.socket.send(JSON.stringify({ type: 'error', message: 'Invalid token' }));
            connection.socket.close();
            return;
          }

          if (!connections.has(authenticatedUserId)) {
            connections.set(authenticatedUserId, new Set());
          }
          connections.get(authenticatedUserId)!.add(connection);
          connection.socket.send(JSON.stringify({ type: 'authenticated', userId: authenticatedUserId }));
          return;
        }

        if (!authenticatedUserId) {
          connection.socket.send(JSON.stringify({ type: 'error', message: 'Not authenticated' }));
          return;
        }

        // 2. Chat Message
        if (data.type === 'message') {
          const chatMessage = await sendChatMessage.execute({
            roomId: data.roomId,
            recipientId: data.recipientId,
            senderId: authenticatedUserId,
            content: data.content,
            messageType: data.messageType || 'text',
          });

          // 3. Distribution
          const members = await opts.useCases.getRoomMembers.execute(chatMessage.roomId);
          const memberUserIds = new Set(members.map((m) => m.userId));

          broadcastToMembers(memberUserIds, chatMessage);
        }
      } catch (err) {
        server.log.error(err);
        connection.socket.send(JSON.stringify({ type: 'error', message: 'Invalid message format or server error' }));
      }
    });

    connection.socket.on('close', () => {
      if (authenticatedUserId && connections.has(authenticatedUserId)) {
        connections.get(authenticatedUserId)!.delete(connection);
        if (connections.get(authenticatedUserId)!.size === 0) {
          connections.delete(authenticatedUserId);
        }
      }
    });
  });

  function broadcastToMembers(memberUserIds: Set<string>, message: any) {
    const payload = JSON.stringify({ type: 'message', ...message });
    for (const userId of memberUserIds) {
      const userConnections = connections.get(userId);
      if (userConnections) {
        for (const conn of userConnections) {
          if (conn.socket.readyState === 1) { // OPEN
            conn.socket.send(payload);
          }
        }
      }
    }
  }
}
