import type { FastifyInstance, FastifyRequest } from 'fastify';
import { authenticate } from '../auth/authPreHandler.ts';
import { chatWebSocketManager } from './ChatWebSocketManager.ts';
import { onlineStatusService } from '../../infra/redis/OnlineStatusService.ts';
import minilog from '../../utils/minilog.ts';

export function registerChatWebSocket(fastify: FastifyInstance): void {
  fastify.register(async function (fastify: FastifyInstance) {
    fastify.get(
      '/ws/chat',
      { websocket: true, preHandler: authenticate },
      async (connection: any, req: FastifyRequest) => {
        const socket = connection?.socket || connection;
        if (!socket || typeof socket.on !== 'function') {
          minilog.e('WebSocket/chat', 'Invalid socket object received');
          return;
        }

        const userId = req.authUserId?.get();
        if (!userId) {
          minilog.w('WebSocket/chat', 'Unauthorized connection attempt');
          socket.close();
          return;
        }

        minilog.i('WebSocket/chat', `User ${userId} connected to chat`);
        chatWebSocketManager.addConnection(userId, socket);

        // Mark user as online
        await onlineStatusService.setOnline(userId);

        socket.on('message', async (message: any) => {
          // Refresh online status on activity
          await onlineStatusService.refreshOnline(userId);
        });

        socket.on('close', async () => {
          minilog.i('WebSocket/chat', `User ${userId} disconnected`);
          chatWebSocketManager.removeConnection(userId, socket);

          // Only mark offline if no more connections for this user
          const hasOtherConnections =
            chatWebSocketManager.hasConnections(userId);
          if (!hasOtherConnections) {
            await onlineStatusService.setOffline(userId);
          }
        });

        socket.on('error', (err: any) => {
          minilog.e(
            'WebSocket/chat',
            `Socket error for user ${userId}: ${err}`,
          );
        });
      },
    );
    minilog.i('WebSocket', 'Chat WebSocket routes registered');
  });
}
