/**
 * GameState.ts
 */
import { Ball } from './Ball';
import { Paddle } from './Paddle';
import type { GameStatus } from './types/gameStatus';
import type { GameSide } from './types/gameSide';
import CONFIG from './GameConfig';
export declare class GameState {
    status: GameStatus;
    winner: GameSide | null;
    playerSide: GameSide | 'both' | null;
    onStatusChange: (status: GameStatus) => void;
    leftUserAliasName: string | null;
    rightUserAliasName: string | null;
    scores: [left: number, right: number];
    onScoreChange: (left: number, right: number) => void;
    paddles: Paddle[];
    ball: Ball;
    config: typeof CONFIG;
    constructor();
    setStatus(status: GameStatus): void;
    incrementScore(side: GameSide): boolean;
    jsonify(): object;
}
//# sourceMappingURL=GameState.d.ts.map