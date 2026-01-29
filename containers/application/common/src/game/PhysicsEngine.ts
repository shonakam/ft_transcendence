import { GameState } from './GameState.ts';
import { InputHandler } from './interface/Input.ts';

import { Ball } from './Ball.ts';
import { Paddle } from './Paddle.ts';

import { Direction } from './types/direction.ts';
import { GameSide } from './types/gameSide.ts';

export class PhysicsEngine {
  static update(
    dt: number,
    state: GameState,
    inputHandler: InputHandler,
    paddleOnly: boolean = false
  ): void {
    this.updatePaddles(dt, state, inputHandler);
    if (!paddleOnly) {
      this.updateBallWithCollisions(dt, state);
    }
  }

  // ボールの位置更新と衝突判定（サブステップで高速ボールのすり抜けを防ぐ）
  static updateBallWithCollisions(dt: number, state: GameState): void {
    const ball = state.ball;
    const speed = Math.sqrt(ball.velocity.x ** 2 + ball.velocity.y ** 2);
    const maxStep = ball.radius * 0.8; // ボール半径の80%以下で移動
    const distance = speed * dt;
    const steps = Math.max(1, Math.ceil(distance / maxStep));
    const subDt = dt / steps;

    for (let i = 0; i < steps; i++) {
      ball.position.x += ball.velocity.x * subDt;
      ball.position.y += ball.velocity.y * subDt;
      this.checkCollisions(state);
    }
  }

  // パドルの位置更新
  static updatePaddles(
    dt: number,
    state: GameState,
    inputHandler: InputHandler
  ): void {
    const leftPaddle = state.paddles[0];
    const rightPaddle = state.paddles[1];
    const input = inputHandler.getInput();
    const height = state.config.CANVAS_HEIGHT;

    if (!('left' in input) || !('right' in input)) return;

    this.updatePaddle(dt, leftPaddle, height, input.left.direction);
    this.updatePaddle(dt, rightPaddle, height, input.right.direction);
  }

  static updatePaddle(
    dt: number,
    paddle: Paddle,
    canvasHeight: number,
    direction: Direction
  ): void {
    if (direction === 'up' && paddle.position.y > 0)
      paddle.position.y -= paddle.speed * dt;
    else if (
      direction === 'down' &&
      paddle.position.y < canvasHeight - paddle.length
    )
      paddle.position.y += paddle.speed * dt;
  }

  // 衝突判定ラッパー
  static checkCollisions(state: GameState): void {
    const ball = state.ball;
    const paddles = state.paddles;
    const canvasHeight = state.config.CANVAS_HEIGHT;

    this.checkHorizontalWallCollision(ball, canvasHeight);
    this.checkPaddleCollision(ball, paddles[0], 'left');
    this.checkPaddleCollision(ball, paddles[1], 'right');
  }

  // 上下の壁での反射
  static checkHorizontalWallCollision(ball: Ball, canvasHeight: number): void {
    const ballTop = ball.position.y - ball.radius;
    const ballBottom = ball.position.y + ball.radius;
    const topWallY = 0;
    const bottomWallY = canvasHeight;

    if (ball.velocity.y < 0 && ballTop <= topWallY) {
      ball.velocity.y *= -1;
      ball.position.y = ball.radius; // 壁の外に押し出す
    } else if (ball.velocity.y > 0 && ballBottom >= bottomWallY) {
      ball.velocity.y *= -1;
      ball.position.y = canvasHeight - ball.radius; // 壁の外に押し出す
    }
  }

  // パドルの衝突判定
  static checkPaddleCollision(
    ball: Ball,
    paddle: Paddle,
    side: GameSide
  ): void {
    if (side === 'right' && ball.velocity.x < 0) return;
    else if (side === 'left' && ball.velocity.x > 0) return;

    const ballLeft = ball.position.x - ball.radius;
    const ballRight = ball.position.x + ball.radius;
    const paddleLeft = paddle.position.x;
    const paddleRight = paddle.position.x + paddle.thickness;

    if (ballRight < paddleLeft || paddleRight < ballLeft) return;

    const ballTop = ball.position.y - ball.radius;
    const ballBottom = ball.position.y + ball.radius;
    const paddleTop = paddle.position.y;
    const paddleBottom = paddle.position.y + paddle.length;

    if (ballBottom < paddleTop || paddleBottom < ballTop) return;

    ball.velocity.x *= -1;
    // パドルの外に押し出す
    if (side === 'left') {
      ball.position.x = paddleRight + ball.radius;
    } else if (side === 'right') {
      ball.position.x = paddleLeft - ball.radius;
    }
  }
}
