import { InputHandler, PlayerInput } from '@shonakam/common';

export class RemoteInputHandler implements InputHandler {
  input: PlayerInput = { direction: 'none', isStartPressed: false };

  constructor() {
    this.attach();
  }

  attach(): void {
    window.addEventListener('keydown', (e) => {
      if (!this.isInputFocused()) return;
      if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        this.input.direction = 'up';
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        this.input.direction = 'down';
      } else if (e.code === 'Space' && !e.repeat) {
        // e.repeat で押し続けによる連続発火を防ぐ
        this.input.isStartPressed = true;
      }
    });
    window.addEventListener('keyup', (e) => {
      if (!this.isInputFocused()) return;
      if (
        e.code === 'ArrowUp' ||
        e.code === 'ArrowDown' ||
        e.code === 'KeyW' ||
        e.code === 'KeyS'
      )
        this.input.direction = 'none';
      if (e.code === 'Space') {
        this.input.isStartPressed = false;
      }
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

  getInput(): PlayerInput {
    return this.input;
  }

  resetStartPressed(): void {
    this.input.isStartPressed = false;
  }
}
