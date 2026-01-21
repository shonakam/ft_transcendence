import type { Socket } from 'socket.io';

import { GameServer } from '../domain/game/entity/GameServer.ts';
import { RemoteInputHandler } from '../domain/game/entity/RemoteInputHandler.ts';

interface GameEntry {
  gameId: number;
  gameServer: GameServer;
  inputHandler: RemoteInputHandler;
}

export class GameSessionRegistry {
  // Game mappings
  gameIdCounter: number = 0;
  gameIdToGameEntry = new Map<number, GameEntry>();
  socketToGameEntry = new Map<Socket, GameEntry>();

  constructor() {}

  // Game handler management
  generateGame(socket: Socket): boolean {
    if (this.socketToGameEntry.has(socket)) {
      console.error(
        'GameSessionRegistry: Game entry already exists for this socket',
      );
      return false;
    }
    const inputHandler = new RemoteInputHandler();
    inputHandler.setWebSocket('left', socket);
    const gameServer = new GameServer(inputHandler);
    this.socketToGameEntry.set(socket, {
      gameId: this.gameIdCounter,
      gameServer: gameServer,
      inputHandler: inputHandler,
    });
    this.gameIdToGameEntry.set(
      this.gameIdCounter,
      this.socketToGameEntry.get(socket) as GameEntry,
    );
    this.gameIdCounter++;
    return true;
  }

  addUserToGame(socket: Socket, gameId: number): boolean {
    const entry = this.gameIdToGameEntry.get(gameId);
    if (!entry) {
      console.error(
        `GameSessionRegistry: No game entry found for game ID ${gameId}`,
      );
      return false;
    }
    if (this.socketToGameEntry.has(socket)) {
      console.error(
        'GameSessionRegistry: Socket already has an associated game entry',
      );
      return false;
    }
    entry.inputHandler.setWebSocket('right', socket);
    this.socketToGameEntry.set(socket, entry);
    return true;
  }

  getGameEntryBySocket(socket: Socket): GameEntry | null {
    return this.socketToGameEntry.get(socket) || null;
  }

  getInputHandlerBySocket(socket: Socket): RemoteInputHandler | null {
    const entry = this.socketToGameEntry.get(socket);
    return entry ? entry.inputHandler : null;
  }

  getGameServerBySocket(socket: Socket): GameServer | null {
    const entry = this.socketToGameEntry.get(socket);
    return entry ? entry.gameServer : null;
  }

  deleteGameBySocket(socket: Socket): boolean {
    const entry = this.socketToGameEntry.get(socket);
    if (!entry) {
      console.error(
        'GameSessionRegistry: No game entry found for the given socket',
      );
      return false;
    }
    this.gameIdToGameEntry.delete(entry.gameId);
    this.socketToGameEntry.delete(socket);
    return true;
  }

  deleteGameByGameId(gameId: number): boolean {
    const entry = this.gameIdToGameEntry.get(gameId);
    if (!entry) {
      console.error(
        'GameSessionRegistry: No game entry found for the given game ID',
      );
      return false;
    }
    this.socketToGameEntry.delete(
      [...this.socketToGameEntry.entries()].find(
        ([, value]) => value.gameId === gameId,
      )?.[0] as Socket,
    );
    this.gameIdToGameEntry.delete(gameId);
    return true;
  }

  deleteUserFromGame(socket: Socket): boolean {
    const entry = this.socketToGameEntry.get(socket);
    if (!entry) {
      console.error(
        'GameSessionRegistry: No game entry found for the given socket',
      );
      return false;
    }
    this.socketToGameEntry.delete(socket);
    return true;
  }

  // addGameServer(userId: string, gameServer: GameServer): boolean {
  //   if (this.gameIdToServer.has(userId)) {
  //     // new Error('Game server already exists for user');
  //     return false;
  //   }
  //   this.gameIdToServer.set(userId, gameServer);
  //   return true;
  // }

  // getGameServerByRoomId(roomId: string): GameServer | null {
  //   return this.gameIdToServer.get(roomId) || null;
  // }
}
