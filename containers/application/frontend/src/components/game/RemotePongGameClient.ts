import { PongGame } from '@shonakam/common/index';

import { GameCanvas } from './canvas/GameCanvas';
import { InputHandler } from '@shonakam/common/index';
import { GameState } from '@shonakam/common/index';
import { CanvasRenderer } from '../../components/game/canvas/CanvasRenderer';
import { GameSocketClient } from './ws/GameSocketClient';

import { checkGoalCollision, PhysicsEngine } from '@shonakam/common/index';

import type { GameSide } from '@shonakam/common/game/types/gameSide';

export class RemotePongGameClient implements PongGame {
  canvas: GameCanvas;
  input: InputHandler;
  state: GameState = new GameState();
  renderer: CanvasRenderer;
  lastFrameTime: number | null = null;
  private readonly loopCallback: (time: number) => void;

  socket: GameSocketClient = new GameSocketClient();

  constructor(gameCanvas: GameCanvas, inputHandler: InputHandler) {
    this.canvas = gameCanvas;
    this.input = inputHandler;
    this.renderer = new CanvasRenderer(this.state, this.canvas);
    this.loopCallback = this.loop.bind(this);
  }

  initRender(): void {
    this.renderer.renderStaticLayer();
    this.renderer.renderDynamicLayer();
  }

  connect(): boolean {
    return true;
  }

  start(): void {
    if (this.state.status === 'ready' || this.state.status === 'paused')
      this.state.setStatus('playing');
    const now = performance.now();
    this.loop(now);
  }

  stop(): void {
    if (this.state.status !== 'playing') return;
    this.state.setStatus('paused');
    this.renderer.render();
  }

  loop(currentTime: number): void {
    let dt: number;
    if (this.lastFrameTime === null) dt = 0;
    else dt = (currentTime - this.lastFrameTime) / 1000;
    this.lastFrameTime = currentTime;
    this.socket.sendDemoRequest();
    PhysicsEngine.update(dt, this.state, this.input);
    const side = checkGoalCollision(
      this.state.ball,
      this.state.config.CANVAS_WIDTH
    );
    this.updateScore(side);
    this.renderer.render();
    if (this.state.status === 'playing') {
      window.requestAnimationFrame(this.loopCallback);
    }
  }

  updateScore(side: GameSide | 'none'): void {
    if (side === 'none') return;
    if (side === 'left') this.state.incrementScore('left');
    else if (side === 'right') this.state.incrementScore('right');
    this.state.ball.reset();
    this.state.setStatus('ready');
  }

  sendInput(): void {}
}
