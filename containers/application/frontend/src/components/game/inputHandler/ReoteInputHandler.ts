import type { Socket } from 'socket.io-client';
import { InputHandler, PlayerInput } from '@shonakam/common/index';

export class RemoteInputHandler implements InputHandler {
  socket: Socket | null = null;
  input: PlayerInput = { direction: 'none', isStartPressed: false };

  constructor() {
    this.attach();
  }

  attach(): void {
    window.addEventListener('keydown', (e) => {
      if (!this.isInputFocused()) return;
      if (e.code === 'ArrowUp' || e.code === 'KeyI') {
        this.input.direction = 'up';
      } else if (e.code === 'ArrowDown' || e.code === 'KeyK') {
        this.input.direction = 'down';
      } else if (e.code === 'Space') {
        this.input.isStartPressed = true;
      }
    });
    window.addEventListener('keyup', (e) => {
      if (!this.isInputFocused()) return;
      if (
        e.code === 'ArrowUp' ||
        e.code === 'ArrayDown' ||
        e.code === 'KeyI' ||
        e.code === 'KeyK'
      )
        this.input.direction = 'none';
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

  setSocket(socket: Socket): void {
    this.socket = socket;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}
