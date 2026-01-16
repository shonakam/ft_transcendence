import type { FastifyInstance, FastifyRequest } from 'fastify';
import ws from '@fastify/websocket';
import { authenticate } from '../auth/authPreHandler.ts';
import { chatWebSocketManager } from './ChatWebSocketManager.ts';
import WebSocket from 'ws';

import { GameSessionRegistry } from '../../domain/game/entity/GameSessionRegistry.ts';
import { Server, Socket } from 'socket.io';
import { GameRequestHandler } from './game/GameRequestHandler.ts';

export function registerWebSocket(io: Server): void {
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
  });

  // fastify.get('/ws/*', { websocket: true }, (socket, req) => {
  //   socket.on('message', (message: unknown) => {
  //     console.log('Received message on /ws/*:', message);
  //   });
  // });

  io.of('/game/remote').on('connection', (socket: Socket) => {
    // client → server
    socket.emit('connected', { message: 'WebSocket connection established' });

    // socket.on('register', (payload: { userId: string }) => {
    //   GameRequestHandler.handleRegister(socket, payload);
    // });

    // socket.on('createGame', () => {
    //   GameRequestHandler.handleCreateGame(socket);
    // });

    // socket.on('join', (payload: { gameId: string, userId: number }) =>
    //   GameRequestHandler.handleJoin(socket, payload),
    // );

    // socket.on('playerInput', (payload) =>
    //   GameRequestHandler.handlePlayerInput(socket, payload),
    // );

    // socket.on('leave', (payload) =>
    //   GameRequestHandler.handleLeave(socket, payload, registry),
    // );
    // socket.on('disconnect', () => {
    //   registry.deleteUserSocketBySocket(socket);
    // });
    // socket.on('error', (err) => {
    //   console.error('WebSocket error:', err);
    // });
    socket.on('demo', () => {
      console.log('Received demo request from client');
      socket.emit('demoResponse', { message: 'Demo response from server' });
    });
  });
}

function onGameMessage(
  message: unknown,
  socket: WebSocket,
  registry: GameSessionRegistry,
) {
  // GameRequestHandler.handle(message, socket, registry);
  // io.of('/notifications').on('connection', (socket: Socket) => {
  //   // Handle notification-specific events here
  // });
}
