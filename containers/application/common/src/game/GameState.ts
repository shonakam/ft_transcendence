/**
 * GameState.ts
 */

import { Ball } from './Ball';
import { Paddle } from './Paddle';

import type { GameStatus } from './types/gameStatus';
import type { GameSide } from './types/gameSide';

import CONFIG from './GameConfig';

export class GameState {
  // BasicStatus
  status: GameStatus = 'ready';
  winner: GameSide | null = null;
  playerSide: GameSide | 'both' | null = 'both';
  onStatusChange: (
    status: GameStatus
  ) => void = () => {};

  // Game user info
  leftUserAliasName: string | null = null;
  rightUserAliasName: string | null = null;

  // Scores
  scores: [left: number, right: number] = [0, 0];
  onScoreChange: (left: number, right: number) => void = () => {};

  // Game field state
  paddles: Paddle[] = [new Paddle('left'), new Paddle('right')];
  ball: Ball = new Ball();

  // Game Config
  config: typeof CONFIG = CONFIG;

  constructor() {}

  setStatus(status: GameStatus): void {
    this.status = status;
    this.onStatusChange(status);
  }

  incrementScore(side: GameSide): boolean {
    if (side === 'left') this.scores[0]++;
    else if (side === 'right') this.scores[1]++;
    if (this.onScoreChange) this.onScoreChange(this.scores[0], this.scores[1]);

    if (
      this.scores[0] < this.config.WINNING_SCORE &&
      this.scores[1] < this.config.WINNING_SCORE
    )
      return false;

    if (this.scores[0] >= this.config.WINNING_SCORE) this.winner = 'left';
    else if (this.scores[1] >= this.config.WINNING_SCORE) this.winner = 'right';
    this.setStatus('finished');
    return true;
  }

  jsonify(): object {
    return {
      status: this.status,
      winner: this.winner,
      playerSide: this.playerSide,
      leftUserAliasName: this.leftUserAliasName,
      rightUserAliasName: this.rightUserAliasName,
      scores: this.scores,
      paddles: this.paddles.map((paddle) => paddle.jsonify()),
      ball: this.ball.jsonify(),
      config: this.config,
    };
  }
}
