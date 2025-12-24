import { GameState } from './GameState.js';
import { GameCanvas } from './GameCanvas.js';

export interface CanvasRenderer {
  canvas: GameCanvas;
  state: GameState;
  render(): void;
  renderStaticLayer(): void;
  renderDynamicLayer(): void;
}

export class CanvasRenderer {
  constructor(state: GameState, canvas: GameCanvas) {
    this.state = state;
    this.canvas = canvas;
  }

  render(): void {
    if (this.canvas.ifStaticCanvasRendered === false)
      this.renderStaticLayer();
    this.renderDynamicLayer();
  };

  renderStaticLayer(): void {
    const ctx = this.canvas.refContexts.onscreenStatic;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // 背景色（緑のホッケーテーブル）
    ctx.fillStyle = "#018001ff";
    ctx.fillRect(0, 0, width, height);

    // 中央線
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();

    // 中央円
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 50, 0, Math.PI * 2);
    ctx.stroke();

    // ゴールエリア（左）
    ctx.beginPath();
    ctx.arc(0, height / 2, 80, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();

    // ゴールエリア（右）
    ctx.beginPath();
    ctx.arc(width, height / 2, 80, Math.PI / 2, -Math.PI / 2);
    ctx.stroke();

    // コーナーアーク（左上）
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI / 2);
    ctx.stroke();

    // コーナーアーク（右上）
    ctx.beginPath();
    ctx.arc(width, 0, 30, Math.PI / 2, Math.PI);
    ctx.stroke();

    // コーナーアーク（左下）
    ctx.beginPath();
    ctx.arc(0, height, 30, -Math.PI / 2, 0);
    ctx.stroke();

    // コーナーアーク（右下）
    ctx.beginPath();
    ctx.arc(width, height, 30, Math.PI, -Math.PI / 2);
    ctx.stroke();

    this.canvas.ifStaticCanvasRendered = true;
  };

  renderDynamicLayer(): void {
    this.clearDynamicLayer();
    this.drawBall();
    this.drawPaddle('left');
    this.drawPaddle('right');
  };

  clearDynamicLayer(): void {
    const ctx = this.canvas.refContexts.onscreenDynamic;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawBall(): void {
    const ctx = this.canvas.refContexts.onscreenDynamic;
    const ball = this.state.ball;

    // ctx.fillStyle = ball.color;
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(ball.position.x, ball.position.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  drawPaddle(side: string): void {
    const ctx = this.canvas.refContexts.onscreenDynamic;
    if (side !== 'left' && side !== 'right') {
      throw new Error("Invalid side for paddle. Use 'left' or 'right'.");
    }
    const paddle = this.state.paddles[side === 'left' ? 0 : 1];

    ctx.fillStyle = "white";
    ctx.fillRect(paddle.position.x, paddle.position.y, paddle.thickness, paddle.length);
  }

}

export default CanvasRenderer;
