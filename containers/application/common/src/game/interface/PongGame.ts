import { InputHandler } from './Input.ts';
import { GameState } from '../GameState.ts';

export interface PongGame {
  input?: InputHandler;
  state: GameState;
  initRender?(): void;
  loop(currentTime: number): void;
  start(): void;
  stop(): void;
}
