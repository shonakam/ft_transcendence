import type { Socket } from 'socket.io';

import { container } from '../../../container/index.ts';
import { GameSocketRegistry } from '../../../container/GameSocketRegistry.ts';
import { GameSessionRegistry } from '../../../container/GameSessionRegistry.ts';

import { ResponseHandler } from './ResponseHandler.ts';
import { RemoteInputHandler } from '../../../domain/game/entity/RemoteInputHandler.ts';
import { PlayerInput } from '@shonakam/common/index.ts';

import minilog, { TAG } from '../../../utils/minilog.ts';

export class RequestHandler {
  // User registration
  static registerUser(socket: Socket, payload: { userId: string }): void {
    const socketRegistry = container.gameSocketRegistry;
    const success = socketRegistry.addUserSocket(payload.userId, socket);

    if (success === false) {
      this.errorLog(socket, `Failed to register user ${payload.userId}`);
      return;
    }
    ResponseHandler.registered(socket, payload.userId);
    minilog.i(
      TAG.GAME,
      `RequestHandler: User ${payload.userId} registered successfully`,
    );
  }

  // User un-registration
  static unRegisterUser(socket: Socket): void {
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
  static createGame(socket: Socket): void {
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
  static joinGame(socket: Socket, payload: { gameId: number }): void {
    if (this.checkRegistration(socket) === false) return;
    if (this.checkGameExistence(socket) === false) return;
    const gameRegistry = container.gameSessionRegistry;
    const gameEntry = gameRegistry.addUserToGame(socket, payload.gameId);
    if (gameEntry === null) {
      this.errorLog(socket, 'Failed to add user to the game.');
      return;
    }
    minilog.i(TAG.GAME, 'RequestHandler: User added to game successfully');
  }

  // Handle player input
  static input(socket: Socket, payload: { input: PlayerInput }): void {
    if (this.checkRegistration(socket) === false) return;
    if (this.checkGameExistence(socket) === false) return;
    const inputHandler: RemoteInputHandler | null =
      container.gameSessionRegistry.getInputHandlerBySocket(socket);
    if (inputHandler === null) {
      this.errorLog(socket, 'No input handler found for this socket.');
      return;
    }
    const side: 'left' | 'right' | null = inputHandler.getSideBySocket(socket);
    if (side === null) {
      this.errorLog(socket, 'Socket not associated with any game side.');
      return;
    }
    inputHandler.updateFromWs(side, payload.input);
  }

  // Handle player leaving the game
  static leaveGame(socket: Socket): void {
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
  static checkRegistration(socket: Socket): boolean {
    const socketRegistry: GameSocketRegistry = container.gameSocketRegistry;
    if (socketRegistry.getUserIdBySocket(socket) === null) {
      this.errorLog(socket, 'Socket not registered. Please register first.');
      return false;
    }
    return true;
  }

  static checkGameExistence(socket: Socket): boolean {
    const gameRegistry: GameSessionRegistry = container.gameSessionRegistry;
    if (gameRegistry.getGameEntryBySocket(socket) === null) {
      this.errorLog(socket, 'No game associated with this socket.');
      return false;
    }
    return true;
  }

  static errorLog(socket: Socket, message: string): void {
    ResponseHandler.sendMessage(socket, 'error', {
      message: `RequestHandler: ${message}`,
    });
    minilog.e(TAG.GAME, `RequestHandler: ${message}`);
  }
}
