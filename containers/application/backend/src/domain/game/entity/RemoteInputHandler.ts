import { WebSocket } from 'ws';
import { InputHandler, InputState } from '@shonakam/common/game/interface/Input.ts';

export class RemoteInputHandler implements InputHandler {
  private inputState: InputState;
  private webSockets: (WebSocket | null)[];

  constructor() {
    this.inputState = {
      left: { direction: 'none', isStartPressed: false },
      right: { direction: 'none', isStartPressed: false },
    };
    this.webSockets = [null, null];
  }

  registerWebSocket(sockets:WebSocket, player: 'left' | 'right') {
    const index = player === 'left' ? 0 : 1;
    this.webSockets[index] = sockets;

    // sockets.onmessage = (event: MessageEvent) => {
    //   const data = JSON.parse(event.data);
    //   this.inputState[player] = {
    //     direction: data.direction,
    //     isStartPressed: data.isStartPressed,
    //   };
    // };
  }
  // setWebSocket(side: 'left' | 'right', sockets: (WebSocket | null)[]) {
  //   const index = side === 'left' ? 0 : 1;
  //   const socket = sockets[index];
  //   if (!socket) return;

  //   socket.onmessage = (event: MessageEvent) => {
  //     const data = JSON.parse(event.data);
  //     this.inputState[side] = {
  //       direction: data.direction,
  //       isStartPressed: data.isStartPressed,
  //     };
  //   };
  // }

  public getInput(): InputState {
    return this.inputState;
  }
}
