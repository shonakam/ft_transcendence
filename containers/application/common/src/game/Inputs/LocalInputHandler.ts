import { InputState, InputHandler, PlayerInput } from '../interface/Input';
import { Direction } from '../types/Direction';

export class LocalInputHandler implements InputHandler {
  keys: Set<string>;

  constructor() {
    this.keys = new Set<string>();
    this.attach();
  }

  attach(): void {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
    });
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });
  }

  detach(): void {
    window.removeEventListener('keydown', () => {});
    window.removeEventListener('keyup', () => {});
  }

  getInput(): InputState {
    return {
      left: this.getLeftInput(),
      right: this.getRightInput(),
    };
  }

  getLeftDirection(): Direction {
    if (this.keys.has('KeyW')) return 'up';
    if (this.keys.has('KeyS')) return 'down';
    return 'none';
  }

  getRightDirection(): Direction {
    if (this.keys.has('ArrowUp')) return 'up';
    if (this.keys.has('ArrowDown')) return 'down';
    return 'none';
  }

  getLeftInput(): PlayerInput {
    return {
      direction: this.getLeftDirection(),
      isStartPressed: this.getStartPauseInput(),
    };
  }

  getRightInput(): PlayerInput {
    return {
      direction: this.getRightDirection(),
      isStartPressed: false,
    };
  }

  getStartPauseInput(): boolean {
    return this.keys.has('Space');
  }
}
