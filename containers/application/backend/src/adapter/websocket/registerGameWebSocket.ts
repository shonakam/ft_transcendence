import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { WebSocket } from 'ws';

import { RequestHandler } from './game/RequestHandler.ts';
import { ResponseHandler } from './game/ResponseHandler.ts';
import type { ClientMessage } from '@shonakam/common';

import minilog from '../../utils/minilog.ts';
import { authenticate } from '../auth/authPreHandler.ts';

export function registerGameWebSocket(fastify: FastifyInstance): void {
  fastify.register(async function (fastify: FastifyInstance) {
    fastify.get(
      '/ws/game/remote',
      { websocket: true, preHandler: authenticate },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (connection: any, req: FastifyRequest) => {
        // @fastify/websocket v11+ では connection が SocketStream で .socket が WebSocket
        // v10以前では connection が直接 WebSocket オブジェクト
        const socket: WebSocket = connection?.socket || connection;

        minilog.i(
          'WebSocket/game',
          `Connection keys: ${Object.keys(connection || {}).join(', ')}`,
        );
        minilog.i(
          'WebSocket/game',
          `Socket has close: ${typeof socket?.close}, send: ${typeof socket?.send}`,
        );

        const userId = req.authUserId?.get();
        if (!userId) {
          minilog.w('WebSocket/game', 'Unauthorized connection attempt');
          if (typeof socket.close === 'function') {
            socket.close();
          }
          return;
        }

        minilog.i('WebSocket/game', `User ${userId} connected to game`);
        RequestHandler.registerUser(socket, userId);

        // 接続確認メッセージ送信
        ResponseHandler.sendMessage(socket, 'connected', {
          message: 'WebSocket connection established',
        });

        // メッセージハンドリング
        socket.on('message', (data: Buffer | string) => {
          try {
            const message: ClientMessage = JSON.parse(data.toString());
            handleClientMessage(socket, message);
          } catch (err) {
            minilog.e('WebSocket/game', `Failed to parse message: ${err}`);
            ResponseHandler.error(socket, 'Invalid message format');
          }
        });

        socket.on('close', () => {
          minilog.i('WebSocket/game', `User ${userId} disconnected`);
          RequestHandler.unRegisterUser(socket);
        });

        socket.on('error', (err: Error) => {
          minilog.e('WebSocket/game', `Socket error: ${err.message}`);
        });
      },
    );
    minilog.i(
      'WebSocket',
      'Game WebSocket routes registered at /ws/game/remote',
    );
  });
}

function handleClientMessage(socket: WebSocket, message: ClientMessage): void {
  switch (message.type) {
    case 'createGame':
      RequestHandler.createGame(socket);
      break;
    case 'join':
      RequestHandler.joinGame(socket, message.payload.gameId);
      break;
    case 'playerInput':
      RequestHandler.input(socket, message.payload.input);
      break;
    case 'leave':
      RequestHandler.leaveGame(socket);
      break;
    case 'demo':
      minilog.i('WebSocket/game', 'Received demo request');
      ResponseHandler.sendMessage(socket, 'demoResponse', {
        message: 'Demo response from server',
      });
      break;
    default:
      minilog.w(
        'WebSocket/game',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        `Unknown message type: ${(message as any).type}`,
      );
  }
}
