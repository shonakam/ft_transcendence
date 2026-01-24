import type { Socket } from 'socket.io';
import { container } from '../../../container/index.ts';
// import { GameServerEntry } from '../../../container/GameSessionRegistry.ts';
import type { GameSide } from '@shonakam/common/game/types/gameSide.d.ts';
import { PlayerInput } from '@shonakam/common/index.ts';
import { RemotePongGameServer } from '../../../domain/game/entity/RemotePongGameServer.ts';
import { RemoteInputHandler } from '../../../domain/game/entity/RemoteInputHandler.ts';

export class GameRequestHandler {
  // Handle user registration
  static handleRegister(socket: Socket, payload: { userId: string }): void {
    const registry = container.gameSessionRegistry;
    const success = registry.addUserSocket(payload.userId, socket);
    if (success) {
      socket.emit('registerResponse', {
        message: `User ${payload.userId} registered successfully`,
      });
    } else {
      socket.emit('registerResponse', {
        message: `User ${payload.userId} registration failed`,
      });
    }
  }

  // Handle game creation
  static handleCreateGame(socket: Socket): void {
    const registry = container.gameSessionRegistry;
    if (registry.getInputHandlerBySocket(socket) !== null) {
      console.error(
        'GameRequestHandler: Input handler already exists for this socket',
      );
      return;
    }
    const handler = new RemoteInputHandler();
    const gameServer = new RemotePongGameServer(handler);
    const userId = registry.getUserIdBySocket(socket);
    if (!userId) {
      console.error(
        'GameRequestHandler: No user ID found for the given socket',
      );
      return;
    }
    handler.setWebSocket('left', socket);
    // registry.addGameServer('' + registry.gameIdCounter++, gameServer);
    gameServer.start();
  }

  static handleJoin(socket: Socket, payload: { roomId: string | null }): void {
    const registry = container.gameSessionRegistry;
    if (payload === null) {
      let handler: RemoteInputHandler | null =
        registry.getInputHandlerBySocket(socket);
      if (!handler) {
        handler = new RemoteInputHandler();
        // registry.socketToInputHandler.set(socket, handler);
      }
      const gameServer = new RemotePongGameServer(handler);
      // registry.addGameServer('demo_' + socket.id, gameServer);
      gameServer.start();
      // gameServer.addPlayer(socket);
      return;
    }
    // const gameServer = registry.getGameServerByRoomId(payload.roomId);
    // if (!gameServer) {
    //   console.error(
    //     `GameRequestHandler: No game server found for roomId ${payload.roomId}`,
    //   );
    //   return;
    // }
    // gameServer.addPlayer(socket);
  }

  // Handle player input
  static handlePlayerInput(
    socket: Socket,
    payload: [GameSide, PlayerInput],
  ): void {
    const registry = container.gameSessionRegistry;
    const inputHandler: RemoteInputHandler | null =
      registry.getInputHandlerBySocket(socket);
    if (!inputHandler) {
      console.error(
        'GameRequestHandler: No input handler found for the given socket',
      );
      return;
    }
    const side: GameSide = payload[0];
    const input: PlayerInput = payload[1];
    // TODO: Validate input here if necessary
    inputHandler.updateFromWs(side, input);
  }

  // static handleLeave(
  //   socket: Socket,
  //   payload: { roomId: string },
  //   registry: GameSessionRegistry,
  // ): void {
  //   const gameServer = registry.getGameServerByRoomId(payload.roomId);
  //   if (!gameServer) {
  //     console.error(
  //       `GameRequestHandler: No game server found for roomId ${payload.roomId}`,
  //     );
  //     return;
  //   }
  //   gameServer.removePlayer(socket);
  // }
}
