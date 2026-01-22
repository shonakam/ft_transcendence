import { Direction } from '../types/direction.ts';

export interface PlayerInput {
  direction: Direction;
  isStartPressed: boolean;
}

export interface InputState {
  left: PlayerInput;
  right: PlayerInput;
}

export interface InputHandler {
  getInput(): InputState | PlayerInput;
}
