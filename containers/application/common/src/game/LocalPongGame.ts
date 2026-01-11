import { GameCanvas } from './GameCanvas';
import { GameState } from './GameState';
import { PhysicsEngine } from './PhysicsEngine';
import { CanvasRenderer } from './CanvasRenderer';
import { InputHandler } from './interface/Input';

import { PongGame } from './interface/PongGame';
import { Goal } from './types/Goal';

export class LocalPongGame implements PongGame {
  canvas: GameCanvas;
  input: InputHandler;
  state: GameState;
  renderer: CanvasRenderer;
  lastFrameTime: number | null = null;
  private readonly loopCallback: (time: number) => void;

  constructor(gameCanvas: GameCanvas, inputHandler: InputHandler) {
    this.canvas = gameCanvas;
    this.input = inputHandler;
    this.state = new GameState();
    this.renderer = new CanvasRenderer(this.state, this.canvas);
    this.loopCallback = this.loop.bind(this);
  }

  initRender(): void {
    this.renderer.renderStaticLayer();
    this.renderer.renderDynamicLayer();
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

    const goal = PhysicsEngine.update(dt, this.state, this.input);
    this.updateScore(goal);
    this.renderer.render();
    if (this.state.status === 'playing')
      window.requestAnimationFrame(this.loopCallback);
  }

  updateScore(goal: Goal): void {
    if (!goal) return;
    if (goal === 'left') this.state.incrementScore('left');
    else if (goal === 'right') this.state.incrementScore('right');
    this.state.ball.reset();
    this.state.setStatus('ready');
  }
}
