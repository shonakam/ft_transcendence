import { Server, Socket } from 'socket.io';

import { RequestHandler } from './game/RequestHandler.ts';
import { PlayerInput } from '@shonakam/common/game/interface/Input.ts';
import { GameSide } from '@shonakam/common/game/types/gameSide.ts';

import minilog from '../../utils/minilog.ts';

export function registerGameWebSocket(io: Server): void {
  // game namespaces
  io.of('/game/remote').on('connection', (socket: Socket) => {
    socket.emit('connected', { message: 'WebSocket connection established' });
    registerRequestFunctions(socket);
  });
  minilog.i('WebSocket', 'Game WebSocket registered at /game/remote');
}

function registerRequestFunctions(socket: Socket): void {
  socket.on('register', (payload: { userId: string }) => {
    RequestHandler.registerUser(socket, payload);
  });
  socket.on('createGame', () => {
    RequestHandler.createGame(socket);
  });
  socket.on('join', (payload: { gameId: number }) =>
    RequestHandler.joinGame(socket, payload),
  );
  socket.on('playerInput', (payload: { side: GameSide; input: PlayerInput }) =>
    RequestHandler.input(socket, payload),
  );
  socket.on('leave', () =>
    RequestHandler.leaveGame(socket),
  );

  // Utility events
  socket.on('disconnect', () => {
    // disconnect
    // registry.deleteUserSocketBySocket(socket);
    socket.emit('disconnected', { message: 'WebSocket connection closed' });
  });
  socket.on('error', (message) => {
    console.error('WebSocket error:', message);
  });
  socket.on('demo', () => {
    console.log('Received demo request from client');
    socket.emit('demoResponse', { message: 'Demo response from server' });
  });
}
