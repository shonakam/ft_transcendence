import { GameCanvas } from './GameCanvas.js';
import { GameState } from './GameState.js';
import { PhysicsEngine } from './PhysicsEngine.js';
import { CanvasRenderer } from './CanvasRenderer.js';
import { InputHandler } from './InputHandler.js';

import CONFIG from './GameConfig.js';

export interface PongGame {
  canvas: GameCanvas;
  state: GameState;
  physics: PhysicsEngine;
  renderer: CanvasRenderer;
  input: InputHandler;

  initRenderer(): void;

  start(): void;

  startLoop(): void;
  loop(currentTime: number): void;
  requestAnimationFrame(callback: (time: number) => void): void;
}

export class PongGame implements PongGame {
  constructor(gameCanvas: GameCanvas) {
    this.state = new GameState();
    this.canvas = new GameCanvas(
      gameCanvas.getStack(),
      CONFIG.CANVAS_WIDTH,
      CONFIG.CANVAS_HEIGHT
    );
    this.input = new InputHandler(this.state);
    this.physics = new PhysicsEngine(this.state, this.input);
    this.renderer = new CanvasRenderer(this.state, this.canvas);
  }

  initRenderer(): void {
    this.physics.update(0);
    this.renderer.renderStaticLayer();
    this.renderer.renderDynamicLayer();
  }

  start(): void {
    if (this.state.status === 'ready' || this.state.status === 'paused')
      this.state.setStatus('playing');
    this.startLoop();
  }

  startLoop(): void {
    this.state.lastFrameTime = performance.now();
    window.requestAnimationFrame(this.loop.bind(this));
  }

  loop(currentTime: number): void {
    const dt = (currentTime - this.state.lastFrameTime) / 1000; // 秒単位の経過時間
    this.state.lastFrameTime = currentTime;

    this.physics.update(dt);
    this.renderer.render();
    if (this.state.status === 'playing')
      window.requestAnimationFrame(this.loop.bind(this));
  }
}
