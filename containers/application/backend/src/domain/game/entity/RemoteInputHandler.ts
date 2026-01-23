import type { Socket } from 'socket.io';
import { InputHandler } from '@shonakam/common';
import type { InputState, PlayerInput } from '@shonakam/common';
import type { GameSide } from '@shonakam/common';

export class RemoteInputHandler implements InputHandler {
  inputState: InputState = {
    left: { direction: 'none', isStartPressed: false },
    right: { direction: 'none', isStartPressed: false },
  };
  sockets: (Socket | null)[] = [null, null];

  constructor() {}

  public getInput(): InputState {
    return this.inputState;
  }

  public setWebSocket(side: 'left' | 'right', socket: Socket): boolean {
    const index = side === 'left' ? 0 : 1;
    if (!socket) return false;
    if (this.sockets[index] === socket) return true;
    if (this.sockets[index] !== null) return false;
    this.sockets[index] = socket;
    return true;
  }

  public isSocketSet(side: GameSide): boolean {
    const index = side === 'left' ? 0 : 1;
    return this.sockets[index] !== null;
  }

  public isSocketsSet(): boolean {
    return this.isSocketSet('left') && this.isSocketSet('right');
  }

  public getSocket(side: GameSide): Socket | null {
    const index = side === 'left' ? 0 : 1;
    return this.sockets[index];
  }

  public getSockets(): (Socket | null)[] {
    return this.sockets;
  }

  public getSideBySocket(socket: Socket): GameSide | null {
    if (this.sockets[0] === socket) return 'left';
    if (this.sockets[1] === socket) return 'right';
    return null;
  }

  public updateFromWs(side: GameSide, input: PlayerInput): void {
    if (!this.validInput(input)) {
      console.error(
        'RemoteInputHandler: Invalid input received from WebSocket',
      );
      return;
    }
    this.inputState[side] = { ...input };
  }

  private validInput(input: PlayerInput): boolean {
    const validDirections = ['none', 'up', 'down'];
    return (
      validDirections.includes(input.direction) &&
      typeof input.isStartPressed === 'boolean'
    );
  }
}
