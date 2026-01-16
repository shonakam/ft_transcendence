import { InputHandler } from "./Input";
import { GameState } from "../GameState";

export interface PongGame {
  input: InputHandler;
  state: GameState;
  initRender(): void;
  loop(currentTime: number): void;
  start(): void;
  stop(): void;
}
