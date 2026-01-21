import { GameSessionRegistry } from '../../container/GameSessionRegistry.ts';
import { Server, Socket } from 'socket.io';
import { GameRequestHandler } from './game/GameRequestHandler.ts';

export function registerGameWebSocket(io: Server): void {
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
