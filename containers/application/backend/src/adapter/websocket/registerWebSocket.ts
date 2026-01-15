import type { FastifyInstance, FastifyRequest } from 'fastify';
import ws from '@fastify/websocket';
import { authenticate } from '../auth/authPreHandler.ts';
import { chatWebSocketManager } from './ChatWebSocketManager.ts';
import WebSocket from 'ws';

import { GameSessionRegistry } from '../../domain/game/entity/GameSessionRegistry.ts';
import { GameRequestHandler } from './game/GameRequestHandler.ts';

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
          // Message handling if needed
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

    // fastify.get('/ws/*', { websocket: true }, (socket, req) => {
    //   socket.on('message', (message: unknown) => {
    //     console.log('Received message on /ws/*:', message);
    //   });
    // });

    fastify.get('/ws/game/remote', { websocket: true }, (socket: WebSocket) => {
      socket.on('message', (message: unknown) => {
        const registry = new GameSessionRegistry();
        onGameMessage(message, socket, registry);
        // refresh game state logic here
      });
    });

    // fastify.get('/ws/chat', { websocket: true }, (socket: WebSocket, req) => {
    //   socket.on('message', (message: unknown) => {
    //     onChatMessage(message, socket);
    //     // chat handling logic here
    //   });
    // });

    console.log('WebSocket routes registered');
  });
}

function onGameMessage(
  message: unknown,
  socket: WebSocket,
  registry: GameSessionRegistry,
) {
  // GameRequestHandler.handle(message, socket, registry);
}

// function onChatMessage(message: unknown, _socket: WebSocket) {
//   console.log('Received chat message:', message);
//   // Chat message handling logic here
// }
