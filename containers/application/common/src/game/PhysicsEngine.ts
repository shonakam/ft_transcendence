import { GameState } from './GameState';
import { InputHandler } from './interface/Input';

import { Ball } from './Ball';
import { Paddle } from './Paddle';

import { Direction } from './types/direction';
import { GameSide } from './types/gameSide';

export class PhysicsEngine {
  static update(
    dt: number,
    state: GameState,
    inputHandler: InputHandler
  ): void {
    this.updatePaddles(dt, state, inputHandler);
    this.updateBall(dt, state.ball);
    this.checkCollisions(state);
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

  // ボールの位置更新
  static updateBall(dt: number, ball: Ball): void {
    ball.position.x += ball.velocity.x * dt;
    ball.position.y += ball.velocity.y * dt;
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

    if (ball.velocity.y < 0) {
      if (ballTop > topWallY) return;
      ball.velocity.y *= -1;
    } else {
      // if (ball.velocity.y > 0)
      if (ballBottom < bottomWallY) return;
      ball.velocity.y *= -1;
    }
  }

  // パドルの衝突判定
  static checkPaddleCollision(
    ball: Ball,
    paddle: Paddle,
    side: GameSide
  ): void {
    if (side === 'right' && ball.velocity.x < 0) return;
    else if (side === 'left' && 0 < ball.velocity.x) return;

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
    // if (side === 'left') {
    //   ball.position.x = paddleRight + ball.radius;
    // } else if (side === 'right') {
    //   ball.position.x = paddleLeft - ball.radius;
    // }
  }
}
