import { GameState } from './GameState.js';
import { InputHandler } from './InputHandler.ts';

import { Ball } from './Ball.ts';
import { Paddle } from './Paddle.ts';

export interface PhysicsEngine {
	state: GameState;
	inputHandler: InputHandler;

	update(dt: number): void;
	updatePaddles(dt: number): void;
	updateBall(dt: number): void;
	checkCollisions(): void;
}

export class PhysicsEngine {

	constructor(state: GameState, inputHandler: InputHandler) {
		this.state = state;
		this.inputHandler = inputHandler;
	}

	update(dt: number) {
		this.updatePaddles(dt);
		this.updateBall(dt);
		this.checkCollisions();
	}

	updatePaddles(dt: number) {
		const keys = this.inputHandler.keys;
		const leftPaddle = this.state.paddles[0];
		const rightPaddle = this.state.paddles[1];
		const canvasHeight = this.state.config.CANVAS_HEIGHT;

		// 左パドル (W/S)
		if (keys.has("KeyW") && leftPaddle.position.y > 0)
			leftPaddle.position.y -= leftPaddle.speed * dt;
		if (keys.has("KeyS") && leftPaddle.position.y < canvasHeight - leftPaddle.length)
			leftPaddle.position.y += leftPaddle.speed * dt;

		// 右パドル (矢印キー)
		if (keys.has("ArrowUp") && rightPaddle.position.y > 0)
			rightPaddle.position.y -= rightPaddle.speed * dt;
		if (keys.has("ArrowDown") && rightPaddle.position.y < canvasHeight - rightPaddle.length)
			rightPaddle.position.y += rightPaddle.speed * dt;
	}

	updateBall(dt: number) {
		const { ball } = this.state;

		ball.position.x += ball.velocity.x * dt;
		ball.position.y += ball.velocity.y * dt;
	}

	// 衝突判定ラッパー
	checkCollisions() {
		const { ball, paddles, config } = this.state;

		this.checkHorizontalWallCollision(ball);
		this.checkLeftPaddleCollision(ball, paddles[0]);
		this.checkRightPaddleCollision(ball, paddles[1]);
		this.checkGoalCollision(ball);
	}

	// 上下の壁での反射
	checkHorizontalWallCollision(ball: Ball) {
		const { config } = this.state;

		if (ball.velocity.y < 0 && ball.position.y - ball.radius < 0) {
			ball.velocity.y = -ball.velocity.y;
			ball.position.y = ball.radius - (ball.position.y - ball.radius); // 位置修正
			return;
		}
		if (ball.velocity.y > 0 && ball.position.y + ball.radius > config.CANVAS_HEIGHT) {
			ball.velocity.y = -ball.velocity.y;
			ball.position.y = config.CANVAS_HEIGHT - ball.radius -
				(ball.position.y + ball.radius - config.CANVAS_HEIGHT); // 位置修正
			return;
		}
	}

	// 左パドルの衝突判定
	checkLeftPaddleCollision(ball: Ball, paddle: Paddle) {
		const leftPaddle = this.state.paddles[0];

		if (ball.velocity.x >= 0)
			return;

		if (
			ball.position.x - ball.radius <= leftPaddle.position.x + leftPaddle.thickness &&
			ball.position.x - ball.radius > leftPaddle.position.x &&
			ball.position.y + ball.radius > leftPaddle.position.y &&
			ball.position.y - ball.radius < leftPaddle.position.y + leftPaddle.length
		) {
			ball.velocity.x = -ball.velocity.x;
			ball.position.x = leftPaddle.position.x + leftPaddle.thickness + ball.radius; // TODO: 位置修正
		}
	}

	// 右パドルの衝突判定
	checkRightPaddleCollision(ball: Ball, paddle: Paddle) {
		const rightPaddle = this.state.paddles[1];

		if (ball.velocity.x <= 0)
			return;

		if (
			ball.position.x + ball.radius >= rightPaddle.position.x &&
			ball.position.x + ball.radius < rightPaddle.position.x + rightPaddle.length &&
			ball.position.y + ball.radius > rightPaddle.position.y &&
			ball.position.y - ball.radius < rightPaddle.position.y + rightPaddle.length
		) {
			ball.velocity.x = -ball.velocity.x;
			ball.position.x = rightPaddle.position.x - ball.radius; // TODO: 位置修正
		}
	}

	// ゴール判定
	checkGoalCollision(ball: Ball) {
		const { config } = this.state;

		if (ball.position.x < ball.radius)
			this.state.incrementScore("right");
		else if (ball.position.x > config.CANVAS_WIDTH - ball.radius)
			this.state.incrementScore("left");
		else
			return;

		this.state.status = "ready";
		ball.reset();
	}
}
