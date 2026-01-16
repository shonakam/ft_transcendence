import type { Socket } from 'socket.io';
import { container } from '../../../container/index.ts';

import { GameState } from '@shonakam/common/game/GameState.ts';

export class GameResponseSender {


  static sendMessage(socket: Socket, message: string, payload: object): void {
    socket.emit(message, payload);
  }

  static sendGameGenerated(socket: Socket, state: GameState): void {
    this.sendMessage(socket, 'gameGenerated', state.jsonify());
  }

  static sendGameReady(socket:Socket): void {
    this.sendMessage(socket, 'gameReady', {});
  }

  static sendGameStart(socket: Socket): void {
    this.sendMessage(socket, 'gameStart', {});
  }

  static sendGameState(socket: Socket, state: GameState): void {
    this.sendMessage(socket, 'gameState', state);
  }

  static sendScoreUpdate(socket: Socket, scores: [left: number, right: number]): void {
    this.sendMessage(socket, 'scoreUpdate', { scores });
  }
}
