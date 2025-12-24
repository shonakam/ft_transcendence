/**
 * GameState.ts
 */

import { Ball } from './Ball.js';
import { Paddle } from './Paddle.js';

import CONFIG from './GameConfig.js';

export interface GameState {

	// BasicStatus
	status: "ready" | "playing" | "paused" | "finished";
	winner: null | "left" | "right";
	playerSide: "left" | "right" | "both" | null;
	setStatus(status: "ready" | "playing" | "paused" | "finished"): void;
	onStatusChange: ((status: "ready" | "playing" | "paused" | "finished") => void);

	// Game user info
	leftUserAliasName: string | null;
	rightUserAliasName: string | null;
	// leftUser: User | null;
	// rightUser: User | null;

	// Scores
  scores: [left: number, right: number];
	onScoreChange: ((left: number, right: number) => void);

	// Game field state
	paddles: Paddle[];
	ball: Ball;

  // Game Config
	config: typeof CONFIG;

  // Game Metadata
	lastFrameTime: number;
	// gameId: string | null;
	// startTime: number;

	constructor(): void;
	incrementScore(side: "left" | "right"): void;
}

export class GameState {
	constructor() {
		// BasicStatus
		this.status = "ready";

		this.winner = null;
		this.playerSide = null;

		// Game user info
		this.leftUserAliasName = null;
		this.rightUserAliasName = null;

		// Scores
		this.scores = [0, 0];

		// Game field state
		this.paddles = [new Paddle("left"), new Paddle("right")];
		this.ball = new Ball();

		// Game Config
		this.config = CONFIG;

		// Game Metadata
		this.lastFrameTime = performance.now();
		// this.gameId = null;
		// this.startTime = Date.now();
	};

	setStatus(status: "ready" | "playing" | "paused" | "finished") {
		this.status = status;
		this.onStatusChange(status);
	}

	incrementScore(side: "left" | "right") {
		if (side === "left") {
			this.scores[0]++;
		} else if (side === "right") {
			this.scores[1]++;
		}
		if (this.onScoreChange) {
			this.onScoreChange(this.scores[0], this.scores[1]);
		}
		if (this.scores[0] < this.config.WINNING_SCORE &&
			this.scores[1] < this.config.WINNING_SCORE) {
			return;
		}
		if (this.scores[0] >= this.config.WINNING_SCORE) {
			this.winner = "left";
		} else if (this.scores[1] >= this.config.WINNING_SCORE) {
			this.winner = "right";
		}
		this.setStatus("finished");
	}

}
