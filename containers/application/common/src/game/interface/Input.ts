import { Direction } from '../types/Direction';

export interface PlayerInput {
  direction: Direction;
  isStartPressed: boolean;
}

export interface InputState {
  left: PlayerInput;
  right: PlayerInput;
}

export interface InputHandler {
  getInput(): InputState;
}
