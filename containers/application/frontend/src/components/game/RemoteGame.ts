import { PlayerInput, PongGame } from '@shonakam/common/index';

import { GameCanvas } from './canvas/GameCanvas';
import { GameState } from '@shonakam/common/index';
import { CanvasRenderer } from '../../components/game/canvas/CanvasRenderer';
import { GameSocket } from './ws/GameSocket';

import type { GameSide } from '@shonakam/common/game/types/gameSide';
import { RemoteInputHandler } from './inputHandler/ReoteInputHandler';

export class RemoteGame implements PongGame {
  canvas: GameCanvas;
  input: RemoteInputHandler;
  state: GameState = new GameState();
  renderer: CanvasRenderer;
  lastFrameTime: number | null = null;
  private readonly loopCallback: (time: number) => void;

  socket: GameSocket = new GameSocket();

  constructor(gameCanvas: GameCanvas, inputHandler: RemoteInputHandler) {
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
    // connect to the game server
    // if failed, return false
    return true;
  }

  start(): void {
    this.loop();
  }

  stop(): void {
    if (this.state.status !== 'playing') return;
    this.state.setStatus('paused');
    this.renderer.render();
  }

  loop(): void {
    this.sendInput();
    this.renderer.render();
    if (this.state.status !== 'finished') {
      window.requestAnimationFrame(this.loopCallback);
    }
  }

  sendInput(): void {
    const input = this.input.getInput() as PlayerInput;
    const side: GameSide =
      this.state.playerSide === 'both'
        ? 'left'
        : (this.state.playerSide as GameSide);
    this.socket.sendInput(side, input);
    this.input.resetStartPressed();
  }
}
