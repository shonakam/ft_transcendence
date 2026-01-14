import { GameCanvas } from '@shonakam/common/game/GameCanvas';
import { GameState } from '@shonakam/common/game/GameState';
import { PhysicsEngine } from '@shonakam/common/game/PhysicsEngine';
import { checkGoalCollision } from '@shonakam/common/game/checkGoalCollision';
import { CanvasRenderer } from '@shonakam/common/game/CanvasRenderer';
import { InputHandler } from '@shonakam/common/game/interface/Input';
import { Goal } from '@shonakam/common/game/types/Goal';

export class LocalPongGame {
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

    PhysicsEngine.update(dt, this.state, this.input);
    const goal = checkGoalCollision(this.state.ball, this.state.config.CANVAS_WIDTH);
    this.updateScoreStatus(goal);
    this.renderer.render();
    if (this.state.status === 'playing')
      window.requestAnimationFrame(this.loopCallback);
  }

  updateScoreStatus(goal: Goal): void {
    if (!goal) return;
    this.state.setStatus('ready');
    this.state.ball.reset();
    if (goal === 'left') this.state.incrementScore('left');
    else if (goal === 'right') this.state.incrementScore('right');
    if (
      this.state.scores[0] >= this.state.config.WINNING_SCORE ||
      this.state.scores[1] >= this.state.config.WINNING_SCORE
    ) {
      this.state.setStatus('finished');
    }
  }
}
