import { GameState } from '@shonakam/common/game/GameState.ts';
import { Goal } from '@shonakam/common/game/types/Goal.ts';

export class GameResponseSender {
  private socket: WebSocket;

  constructor(socket: WebSocket) {
    this.socket = socket;
  }

  sendJson(message: string, data: object): void {
    const fullMessage = {
      type: message,
      payload: data,
    };
    this.socket.send(JSON.stringify(fullMessage));
  }

  sendGameGenerated(state: GameState): void {
    this.sendJson('gameGenerated', state.jsonify());
  }

  sendGameReady(): void {
    this.sendJson('gameReady', {});
  }

  sendGameStart(): void {
    this.sendJson('gameStart', {});
  }

  sendGameState(state: GameState): void {
    this.sendJson('gameState', state.jsonify());
  }

  sendScoreUpdate(goal: Goal): void {
    // this.sendJson('scoreUpdate', goal);
  }
}
