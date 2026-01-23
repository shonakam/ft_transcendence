import type { WebSocket } from 'ws';

import { container } from '../../../container/index.ts';
import { GameSocketRegistry } from '../../../container/GameSocketRegistry.ts';
import { GameSessionRegistry } from '../../../container/GameSessionRegistry.ts';

import { ResponseHandler } from './ResponseHandler.ts';
import { RemoteInputHandler } from '../../../domain/game/entity/RemoteInputHandler.ts';
import { GameSide, PlayerInput } from '@shonakam/common/index.ts';

import minilog, { TAG } from '../../../utils/minilog.ts';

export class RequestHandler {
  // User registration
  static registerUser(socket: WebSocket, userId: string): void {
    const socketRegistry = container.gameSocketRegistry;
    const success = socketRegistry.addUserSocket(userId, socket);

    if (success === false) {
      this.errorLog(socket, `Failed to register user ${userId}`);
      return;
    }
    ResponseHandler.registered(socket, userId);
    minilog.i(
      TAG.GAME,
      `RequestHandler: User ${userId} registered successfully`,
    );
  }

  // User un-registration
  static unRegisterUser(socket: WebSocket): void {
    if (this.checkRegistration(socket) === false) return;
    if (this.checkGameExistence(socket) === true) {
      const gameRegistry = container.gameSessionRegistry;
      if (gameRegistry.deleteUserFromGame(socket) === false) {
        this.errorLog(socket, 'Failed to remove user from the game.');
        return;
      }
    }
    const socketRegistry = container.gameSocketRegistry;
    const userId = socketRegistry.getUserIdBySocket(socket);
    if (socketRegistry.deleteUserBySocket(socket) === false) {
      this.errorLog(socket, `Failed to unregister user ${userId}`);
      return;
    }
    ResponseHandler.unregistered(socket, userId);
    minilog.i(
      TAG.GAME,
      `RequestHandler: User ${userId} unregistered successfully`,
    );
  }

  // --------

  // Game creation
  static createGame(socket: WebSocket): void {
    const gameRegistry = container.gameSessionRegistry;
    if (this.checkRegistration(socket) === false) {
      return;
    }
    if (gameRegistry.getInputHandlerBySocket(socket) !== null) {
      this.errorLog(socket, 'Socket already associated with a game.');
      return;
    }
    if (gameRegistry.generateGame(socket) === false) {
      this.errorLog(socket, 'Failed to create a new game.');
      return;
    }
    minilog.i(TAG.GAME, 'RequestHandler: Game created successfully');
  }

  // Invite player to game
  static joinGame(socket: WebSocket, gameId: number): void {
    if (this.checkRegistration(socket) === false) return;
    if (this.checkGameExistence(socket) === false) return;
    const gameRegistry = container.gameSessionRegistry;
    const gameEntry = gameRegistry.addUserToGame(socket, gameId);
    if (gameEntry === null) {
      this.errorLog(socket, 'Failed to add user to the game.');
      return;
    }
    minilog.i(TAG.GAME, 'RequestHandler: User added to game successfully');
  }

  // Handle player input
  static input(socket: WebSocket, input: PlayerInput): void {
    if (this.checkRegistration(socket) === false) return;
    if (this.checkGameExistence(socket) === false) return;
    const inputHandler: RemoteInputHandler | null =
      container.gameSessionRegistry.getInputHandlerBySocket(socket);
    if (inputHandler === null) {
      this.errorLog(socket, 'No input handler found for this socket.');
      return;
    }
    const sideFromSocket: GameSide | null =
      inputHandler.getSideBySocket(socket);
    if (sideFromSocket === null) {
      this.errorLog(socket, 'Socket not associated with any game side.');
      return;
    }
    inputHandler.updateFromWs(sideFromSocket, input);
  }

  // Handle player leaving the game
  static leaveGame(socket: WebSocket): void {
    if (this.checkRegistration(socket) === false) return;
    if (this.checkGameExistence(socket) === false) return;
    const gameRegistry = container.gameSessionRegistry;
    if (gameRegistry.deleteUserFromGame(socket) === false) {
      this.errorLog(socket, 'Failed to remove user from the game.');
      return;
    }
    minilog.i(TAG.GAME, 'RequestHandler: User left the game successfully');
  }

  // --------

  // Helper methods
  static checkRegistration(socket: WebSocket): boolean {
    const socketRegistry: GameSocketRegistry = container.gameSocketRegistry;
    if (socketRegistry.getUserIdBySocket(socket) === null) {
      this.errorLog(socket, 'Socket not registered. Please register first.');
      return false;
    }
    return true;
  }

  static checkGameExistence(socket: WebSocket): boolean {
    const gameRegistry: GameSessionRegistry = container.gameSessionRegistry;
    if (gameRegistry.getGameEntryBySocket(socket) === null) {
      this.errorLog(socket, 'No game associated with this socket.');
      return false;
    }
    return true;
  }

  static errorLog(socket: WebSocket, message: string): void {
    ResponseHandler.sendMessage(socket, 'error', {
      message: `RequestHandler: ${message}`,
    });
    minilog.e(TAG.GAME, `RequestHandler: ${message}`);
  }
}
