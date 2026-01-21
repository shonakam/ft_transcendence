import type { Socket } from 'socket.io';
import { GameState } from '@shonakam/common/game/GameState.ts';

export class ResponseHandler {
  // Generic message sender
  static sendMessage(socket: Socket, message: string, payload: object): void {
    socket.emit(message, payload);
  }

  // Specific response methods
  static registered(socket: Socket, userId: string): void {
    this.sendMessage(socket, 'registered', { userId });
  }

  static unregistered(socket: Socket, userId: string | null): void {
    this.sendMessage(socket, 'unregistered', { userId });
  }

  static generated(socket: Socket, state: GameState): void {
    this.sendMessage(socket, 'gameGenerated', state);
  }

  static added(socket: Socket, gameId: number): void {
    this.sendMessage(socket, 'playerAdded', { gameId });
  }

  static ready(socket: Socket): void {
    this.sendMessage(socket, 'gameReady', {});
  }

  static start(socket: Socket): void {
    this.sendMessage(socket, 'gameStart', {});
  }

  static state(socket: Socket, state: GameState): void {
    this.sendMessage(socket, 'gameState', state);
  }

  static sendScoreUpdate(
    socket: Socket,
    scores: [left: number, right: number],
  ): void {
    this.sendMessage(socket, 'scoreUpdate', { scores });
  }

  static error(socket: Socket, message: string): void {
    this.sendMessage(socket, 'error', { message });
  }
}
