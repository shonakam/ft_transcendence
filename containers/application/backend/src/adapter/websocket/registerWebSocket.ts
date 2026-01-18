import type { FastifyInstance, FastifyRequest } from 'fastify';
import ws from '@fastify/websocket';
import { authenticate } from '../auth/authPreHandler.ts';
import { chatWebSocketManager } from './ChatWebSocketManager.ts';

export function registerWebSocket(fastify: FastifyInstance) {
  fastify.register(ws, {
    options: { maxPayload: 1048576 },
  });

  fastify.register(async function (fastify: FastifyInstance) {
    fastify.get(
      '/ws/chat',
      { websocket: true, preHandler: authenticate },
      (connection: any, req: FastifyRequest) => {
        const socket = connection?.socket || connection;
        if (!socket || typeof socket.on !== 'function') {
          console.error('WS: Invalid socket object received');
          return;
        }

        const userId = req.authUserId?.get();
        if (!userId) {
          console.warn('WS: Unauthorized connection attempt');
          socket.close();
          return;
        }

        console.log(`WS: User ${userId} connected to chat`);
        chatWebSocketManager.addConnection(userId, socket);

        socket.on('message', (message: any) => {
          try {
            console.log(`WS: Received message from ${userId}:`, message.toString());
          } catch (e) {
            console.error('WS: Failed to process message', e);
          }
        });

        socket.on('close', () => {
          console.log(`WS: User ${userId} disconnected`);
          chatWebSocketManager.removeConnection(userId, socket);
        });

        socket.on('error', (err: any) => {
          console.error(`WS: Socket error for user ${userId}:`, err);
        });
      },
    );

    fastify.get('/ws/game/remote', { websocket: true }, (connection: any) => {
      const socket = connection?.socket || connection;
      if (!socket || typeof socket.on !== 'function') return;

      socket.on('message', (message: any) => {
        console.log('WS Game: Received message:', message.toString());
      });
    });

    console.log('WebSocket routes registered');
  });
}
