import type { WebSocket } from 'ws';
import { GameSessionRegistry } from '../../../domain/game/entity/GameSessionRegistry.ts';

import { RemotePongGameServer } from '../../../domain/game/entity/RemoteGameServer.ts';
// import { GameResponseSender } from './GameResponseSender.ts';
import { RemoteInputHandler } from '../../../domain/game/entity/RemoteInputHandler.ts';

export class GameRequestHandler {
  static handle(
    message: unknown,
    socket: WebSocket,
    registry: GameSessionRegistry,
  ): void {
    // check if message type is gamemessagerequest
    if (typeof message !== 'object' || message === null) {
      console.warn('Invalid message format');
      return;
    }
    const parsed = message as { type: string; payload: object };
    const type = parsed.type;
    const payload = parsed.payload;

    switch (type) {
      // Handle registration logic
      case 'join': {
        const { userId } = payload as { userId: string };
        registry.addUserSocket(userId, socket);
        break;
      }
      case 'generateGame': {
        const { userId } = payload as { userId: string };
        const input = new RemoteInputHandler();
        const gameServer = new RemotePongGameServer(input);
        registry.addGameServer(userId, gameServer);
        break;
      }
      // case 'joinGame':
      //   break;
      // // Handle game start logic
      // case 'startGame':
      //   break;
      // // Handle other message types
      // case 'playerInput':
      //   // this.handlePlayerInput(payload);
      //   break;
      default:
        console.warn(`Unknown message type: ${type}`);
    }
  }

  // private handlePlayerInput(payload: any): void {
  // this.gameServer.input.updateFromPayload(payload);
  // }

  // private handleStartGame(): void {
  // this.gameServer.startGameLoop(this.responseSender);
  // }
}
