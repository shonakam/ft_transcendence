import type { FastifyInstance, FastifyRequest } from 'fastify';
import { authenticate } from '../auth/authPreHandler.ts';
import { chatWebSocketManager } from './ChatWebSocketManager.ts';
import minilog from '../../utils/minilog.ts';

export function registerChatWebSocket(fastify: FastifyInstance): void {
  // main.ts で ws プラグインは既に登録済み
  fastify.register(async function (fastify: FastifyInstance) {
    fastify.get(
      '/ws/chat',
      { websocket: true, preHandler: authenticate },
      (connection: any, req: FastifyRequest) => {
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

        socket.on('message', (message: any) => {
          // Message handling if needed
        });

        socket.on('close', () => {
          minilog.i('WebSocket/chat', `User ${userId} disconnected`);
          chatWebSocketManager.removeConnection(userId, socket);
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
