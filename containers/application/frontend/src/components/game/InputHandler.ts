import { Direction } from '../../types/Direction';
import { GameState } from './GameState';

interface InputState {
  left: Direction;
  right: Direction;
  startPause: boolean;
}

export class InputHandler {
  keys: Set<string>;
  state: GameState;

  constructor(state: GameState) {
    this.keys = new Set<string>();
    this.state = state;

    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });
  }

  getInput(): InputState {
    return {
      left: this.getLeftDirection(),
      right: this.getRightDirection(),
      startPause: this.getStartPauseInput(),
    };
  }

  getLeftDirection(): Direction {
    if (this.keys.has('KeyW')) return -1;
    if (this.keys.has('KeyS')) return 1;
    return 0;
  }

  getRightDirection(): Direction {
    if (this.keys.has('ArrowUp')) return -1;
    if (this.keys.has('ArrowDown')) return 1;
    return 0;
  }

  getStartPauseInput(): boolean {
    return this.keys.has('Space');
  }
}
