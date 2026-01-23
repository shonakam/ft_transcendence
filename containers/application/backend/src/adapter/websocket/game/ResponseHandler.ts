import { GameState } from '@shonakam/common';
import type { WebSocket } from 'ws';

export class ResponseHandler {
  // Generic message sender - JSON プロトコルで送信
  static sendMessage(socket: WebSocket, type: string, payload: object): void {
    if (socket.readyState === socket.OPEN) {
      socket.send(JSON.stringify({ type, payload }));
    }
  }

  // Specific response methods
  static registered(socket: WebSocket, userId: string): void {
    this.sendMessage(socket, 'registered', { userId });
  }

  static unregistered(socket: WebSocket, userId: string | null): void {
    this.sendMessage(socket, 'unregistered', { userId });
  }

  static generated(socket: WebSocket, state: GameState): void {
    this.sendMessage(socket, 'gameGenerated', state);
  }

  static added(socket: WebSocket, gameId: number): void {
    this.sendMessage(socket, 'playerAdded', { gameId });
  }

  static ready(socket: WebSocket): void {
    this.sendMessage(socket, 'gameReady', {});
  }

  static start(socket: WebSocket): void {
    this.sendMessage(socket, 'gameStart', {});
  }

  static state(socket: WebSocket, state: GameState): void {
    this.sendMessage(socket, 'gameState', state);
  }

  static sendScoreUpdate(
    socket: WebSocket,
    scores: [left: number, right: number],
  ): void {
    this.sendMessage(socket, 'scoreUpdate', { scores });
  }

  static error(socket: WebSocket, message: string): void {
    this.sendMessage(socket, 'error', { message });
  }
}
