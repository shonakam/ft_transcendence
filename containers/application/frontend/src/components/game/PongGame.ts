import { GameCanvas } from './GameCanvas.js';
import { GameState } from './GameState.js';
import { PhysicsEngine } from './PhysicsEngine.js';
import { CanvasRenderer } from './CanvasRenderer.js';
import { InputHandler } from './InputHandler.js';

import CONFIG from './GameConfig.js';

export class PongGame {
  canvas: GameCanvas;
  state: GameState;
  physics: PhysicsEngine;
  renderer: CanvasRenderer;
  input: InputHandler;
  private readonly loopCallback: (time: number) => void;

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
    this.loopCallback = this.loop.bind(this);
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
    window.requestAnimationFrame(this.loopCallback);
  }

  loop(currentTime: number): void {
    const dt = (currentTime - this.state.lastFrameTime) / 1000;
    this.state.lastFrameTime = currentTime;

    this.physics.update(dt);
    this.renderer.render();
    if (this.state.status === 'playing')
      window.requestAnimationFrame(this.loopCallback);
  }
}
