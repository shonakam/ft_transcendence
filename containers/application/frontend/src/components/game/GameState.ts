/**
 * GameState.ts
 */

import GAME_CONFIG from './GameConfig.js';

export default interface IGameState {
	// BasicStatus
	status: "ready" | "playing" | "paused" | "finished";
	winner: null | "left" | "right";
	playerSide: "left" | "right" | "both" | null;

	// Game user info
	leftUserAliasName: string | null;
	rightUserAliasName: string | null;
	// leftUser: User | null;
	// rightUser: User | null;

	// Scores
	leftScore: number;
	rightScore: number;

	// Game field state
	leftPaddle: { y: number };
	rightPaddle: { y: number };
	leftPaddleDir: -1 | 0 | 1; // -1: up, 0: still, 1: down
	rightPaddleDir: -1 | 0 | 1; // -1: up, 0: still, 1: down
	ball: { x: number; y: number; dx: number; dy: number };

  // Game Metadata
	gameId: string | null;
	startTime: number;
}

export class GameState {
  public state: IGameState;

	constructor() {
		this.state = {
			// BasicStatus
			status: "ready",
			winner: null,
			playerSide: null,

			// Game user info
			leftUserAliasName: null,
			rightUserAliasName: null,

			// Scores
			leftScore: 0,
			rightScore: 0,

			// Game field state
			leftPaddle: { y: (GAME_CONFIG.HEIGHT - 100) / 2 },
			rightPaddle: { y: (GAME_CONFIG.HEIGHT - 100) / 2 },
			leftPaddleDir: 0,
			rightPaddleDir: 0,
			ball: { x: GAME_CONFIG.WIDTH / 2, y: GAME_CONFIG.HEIGHT / 2, dx: 0, dy: 0 },

			// Game Metadata
			gameId: null,
			startTime: Date.now(),
		};
	}
}
