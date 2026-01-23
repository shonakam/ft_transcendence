import type { WebSocket } from 'ws';
import { InputHandler } from '@shonakam/common';
import type { InputState, PlayerInput } from '@shonakam/common';
import type { GameSide } from '@shonakam/common';

export class RemoteInputHandler implements InputHandler {
  inputState: InputState = {
    left: { direction: 'none', isStartPressed: false },
    right: { direction: 'none', isStartPressed: false },
  };
  sockets: (WebSocket | null)[] = [null, null];
  userIds: (string | null)[] = [null, null];
  userAliases: (string | null)[] = [null, null];

  constructor() {}

  public getInput(): InputState {
    return this.inputState;
  }

  public setWebSocket(side: 'left' | 'right', socket: WebSocket): boolean {
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

  public getSocket(side: GameSide): WebSocket | null {
    const index = side === 'left' ? 0 : 1;
    return this.sockets[index];
  }

  public getSockets(): (WebSocket | null)[] {
    return this.sockets;
  }

  public getSideBySocket(socket: WebSocket): GameSide | null {
    if (this.sockets[0] === socket) return 'left';
    if (this.sockets[1] === socket) return 'right';
    return null;
  }

  public removeSocket(socket: WebSocket): GameSide | null {
    const side = this.getSideBySocket(socket);
    if (side === null) return null;
    const index = side === 'left' ? 0 : 1;
    this.sockets[index] = null;
    this.inputState[side] = { direction: 'none', isStartPressed: false };
    return side;
  }

  public hasAnySocket(): boolean {
    return this.sockets[0] !== null || this.sockets[1] !== null;
  }

  public resetStartPressed(side: GameSide): void {
    this.inputState[side].isStartPressed = false;
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

  public setUserInfo(
    side: GameSide,
    userId: string,
    alias?: string | null,
  ): void {
    const index = side === 'left' ? 0 : 1;
    this.userIds[index] = userId;
    this.userAliases[index] = alias ?? null;
  }

  public getUserIds(): (string | null)[] {
    return this.userIds;
  }

  public getUserAliases(): (string | null)[] {
    return this.userAliases;
  }

  private validInput(input: PlayerInput): boolean {
    const validDirections = ['none', 'up', 'down'];
    return (
      validDirections.includes(input.direction) &&
      typeof input.isStartPressed === 'boolean'
    );
  }
}
