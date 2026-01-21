import { InputHandler, InputState, PlayerInput } from '@shonakam/common/index';
import type { Direction } from '@shonakam/common/index';

export class LocalInputHandler implements InputHandler {
  keys: Set<string> = new Set<string>();

  constructor() {
    this.attach();
  }

  attach(): void {
    window.addEventListener('keydown', (e) => {
      if (!this.isInputFocused()) return;
      this.keys.add(e.code);
    });
    window.addEventListener('keyup', (e) => {
      if (!this.isInputFocused()) return;
      this.keys.delete(e.code);
    });
  }

  detach(): void {
    window.removeEventListener('keydown', () => {});
    window.removeEventListener('keyup', () => {});
  }

  private isInputFocused(): boolean {
    const active = document.activeElement;
    if (!active) return true;
    const tag = active.tagName.toLowerCase();
    return tag !== 'input' && tag !== 'textarea';
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
    if (this.keys.has('ArrowUp') || this.keys.has('KeyI')) return 'up';
    if (this.keys.has('ArrowDown') || this.keys.has('KeyK')) return 'down';
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
