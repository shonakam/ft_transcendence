import type { Socket } from 'socket.io';

import { PongGame } from '@shonakam/common';
import { GameState } from '@shonakam/common';
import { PhysicsEngine } from '@shonakam/common';
import { checkGoalCollision } from '@shonakam/common';
import { GameSide } from '@shonakam/common';

import { RemoteInputHandler } from './RemoteInputHandler.ts';
import { ResponseHandler } from '../../../adapter/websocket/game/ResponseHandler.ts';

export class GameServer implements PongGame {
  input: RemoteInputHandler;
  state: GameState;
  lastFrameTime: number | null = null;
  private readonly loopCallback: (time: number) => void;

  constructor(inputHandler: RemoteInputHandler) {
    this.input = inputHandler;
    this.state = new GameState();
    this.loopCallback = this.loop.bind(this);
    // send initial state to clients here if needed
  }

  start(): void {
    if (this.state.status === 'ready' || this.state.status === 'paused')
      this.state.setStatus('playing');
    const now = performance.now();
    // send initial state to clients here if needed
    this.loop(now);
  }

  stop(): void {
    if (this.state.status !== 'playing') return;
    this.state.setStatus('paused');
    // send paused state to clients here if needed
  }

  loop(currentTime: number): void {
    let dt: number;
    if (this.lastFrameTime === null) dt = 0;
    else dt = (currentTime - this.lastFrameTime) / 1000;
    this.lastFrameTime = currentTime;

    PhysicsEngine.update(dt, this.state, this.input);
    const goal = checkGoalCollision(
      this.state.ball,
      this.state.config.CANVAS_WIDTH,
    );

    // send updated positions to clients here if needed
    this.updateScore(goal);
    const sockets: (Socket | null)[] = this.input.getSockets();
    if (sockets[0]) ResponseHandler.state(sockets[0], this.state);
    if (sockets[1]) ResponseHandler.state(sockets[1], this.state);
    if (this.state.status === 'playing')
      setTimeout(() => this.loop(performance.now()), 1000 / 60);
  }

  updateScore(goal: GameSide | 'none'): void {
    if (goal === 'none') return;
    if (goal === 'left') this.state.incrementScore('left');
    else if (goal === 'right') this.state.incrementScore('right');
    this.state.ball.reset();
    this.state.setStatus('ready');
    // send score update to clients here if needed
  }
}
