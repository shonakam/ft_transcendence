import type { PlayerInput } from '@shonakam/common';
import { PongGame } from '@shonakam/common';
import { GameCanvas } from './canvas/GameCanvas';
import { GameState } from '@shonakam/common';
import { CanvasRenderer } from '../../components/game/canvas/CanvasRenderer';
import { GameSocket } from './ws/GameSocket';

import { RemoteInputHandler } from './inputHandler/ReoteInputHandler';

export class RemoteGame implements PongGame {
  canvas: GameCanvas;
  input: RemoteInputHandler;
  state: GameState = new GameState();
  renderer: CanvasRenderer;
  lastFrameTime: number | null = null;
  private readonly loopCallback: (time: number) => void;
  socket: GameSocket;

  constructor(
    gameCanvas: GameCanvas,
    inputHandler: RemoteInputHandler,
    socket: GameSocket
  ) {
    this.canvas = gameCanvas;
    this.input = inputHandler;
    this.renderer = new CanvasRenderer(this.state, this.canvas);
    this.loopCallback = this.loop.bind(this);
    this.socket = socket;
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
    const input: PlayerInput = this.input.getInput();
    this.socket.sendInput(input);
    this.renderer.render();
    if (this.state.status !== 'finished') {
      window.requestAnimationFrame(this.loopCallback);
    }
  }
}
const remoteGameExport = RemoteGame;
export default remoteGameExport;
