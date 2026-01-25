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

  static generated(socket: WebSocket, gameId: number, state: GameState): void {
    this.sendMessage(socket, 'gameGenerated', { gameId, state });
  }

  static added(
    socket: WebSocket,
    gameId: number,
    side: 'left' | 'right',
  ): void {
    this.sendMessage(socket, 'playerAdded', { gameId, side });
  }

  static opponentJoined(
    socket: WebSocket,
    gameId: number,
    opponentId: string,
    opponentAlias?: string,
  ): void {
    this.sendMessage(socket, 'opponentJoined', {
      gameId,
      opponentId,
      opponentAlias: opponentAlias || opponentId,
    });
  }

  static ready(
    socket: WebSocket,
    gameId: number,
    leftPlayer: string,
    rightPlayer: string,
    yourSide: 'left' | 'right',
    leftAlias?: string,
    rightAlias?: string,
  ): void {
    this.sendMessage(socket, 'gameReady', {
      gameId,
      leftPlayer,
      rightPlayer,
      yourSide,
      leftAlias: leftAlias || leftPlayer,
      rightAlias: rightAlias || rightPlayer,
    });
  }

  static start(socket: WebSocket, gameId: number): void {
    this.sendMessage(socket, 'gameStart', { gameId });
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

  static playerLeft(socket: WebSocket, gameId: number, playerId: string): void {
    this.sendMessage(socket, 'playerLeft', { gameId, playerId });
  }

  static gameLeft(socket: WebSocket, gameId: number): void {
    this.sendMessage(socket, 'gameLeft', { gameId });
  }
}
