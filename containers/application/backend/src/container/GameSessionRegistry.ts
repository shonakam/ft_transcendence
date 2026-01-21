import type { Socket } from 'socket.io';

import { RemoteInputHandler } from '../domain/game/entity/RemoteInputHandler.ts';

// interface UserEntry {
//   userId: string;
//   socket: Socket;
//   side: GameSide | null;
//   gameId: number | null;
//   gameServer: RemotePongGameServer | null;
// }

export class GameSessionRegistry {
  gameIdCounter: number = 1;
  socketToUserId = new Map<Socket, string>();
  userIdToSocket = new Map<string, Socket>();
  socketToInputHandler = new Map<Socket, RemoteInputHandler>();

  // gameServers = new Map<number, GameServerEntry | null>();
  // userIdToServer = new Map<string, [RemotePongGameServer, string, GameSide]>();
  // gameIdToServer = new Map<string, RemotePongGameServer>();

  // userIdToEntries = new Map<string, UserEntry>();
  // gameIdToEntries = new Map<number, GameServerEntry>();

  constructor() {}

  // User socket management
  addUserSocket(userId: string, socket: Socket): boolean {
    if (this.userIdToSocket.has(userId) || this.socketToUserId.has(socket)) {
      console.error(
        `GameSessionRegistry: User ${userId} or socket already registered`,
      );
      return false;
    }
    this.userIdToSocket.set(userId, socket);
    this.socketToUserId.set(socket, userId);
    return true;
  }

  getUserSocket(userId: string): Socket | null {
    return this.userIdToSocket.get(userId) || null;
  }

  getUserIdBySocket(socket: Socket): string | null {
    return this.socketToUserId.get(socket) || null;
  }

  deleteUserSocket(userId: string): boolean {
    if (
      !this.userIdToSocket.has(userId) ||
      !this.socketToUserId.has(this.userIdToSocket.get(userId) as Socket)
    ) {
      // new Error('User not registered');
      return false;
    }
    const socket = this.userIdToSocket.get(userId) as Socket;
    this.userIdToSocket.delete(userId);
    this.socketToUserId.delete(socket);
    return true;
  }

  // Game handler management
  addInputHandler(socket: Socket, handler: RemoteInputHandler): void {
    this.socketToInputHandler.set(socket, handler);
  }

  getInputHandlerBySocket(socket: Socket): RemoteInputHandler | null {
    return this.socketToInputHandler.get(socket) ?? null;
  }

  deleteInputHandlerBySocket(socket: Socket): boolean {
    if (!this.socketToInputHandler.has(socket)) {
      return false;
    }
    this.socketToInputHandler.delete(socket);
    return true;
  }

  // addGameServer(userId: string, gameServer: RemotePongGameServer): boolean {
  //   if (this.gameIdToServer.has(userId)) {
  //     // new Error('Game server already exists for user');
  //     return false;
  //   }
  //   this.gameIdToServer.set(userId, gameServer);
  //   return true;
  // }

  // getGameServerByRoomId(roomId: string): RemotePongGameServer | null {
  //   return this.gameIdToServer.get(roomId) || null;
  // }
}
