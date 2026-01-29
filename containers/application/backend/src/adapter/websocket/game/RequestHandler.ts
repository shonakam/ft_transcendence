import type { WebSocket } from 'ws';

import { container } from '../../../container/index.ts';
import { GameSocketRegistry } from '../../../container/GameSocketRegistry.ts';
import { GameSessionRegistry } from '../../../container/GameSessionRegistry.ts';

import { ResponseHandler } from './ResponseHandler.ts';
import { RemoteInputHandler } from '../../../domain/game/entity/RemoteInputHandler.ts';
import { GameSide, PlayerInput } from '@shonakam/common/index.ts';

import minilog, { TAG } from '../../../utils/minilog.ts';
import { UserRepositorySqlite } from '../../../infra/sqlite/repository/user/UserRepositorySqlite.ts';

const userRepository = new UserRepositorySqlite();

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

    const socketRegistry = container.gameSocketRegistry;
    const disconnectedUserId = socketRegistry.getUserIdBySocket(socket);

    // ゲームに参加中の場合、相手に通知を送る
    if (this.checkGameExistence(socket) === true) {
      const gameRegistry = container.gameSessionRegistry;
      const gameEntry = gameRegistry.getGameEntryBySocket(socket);

      if (gameEntry) {
        const inputHandler = gameEntry.inputHandler;
        const gameId = gameEntry.gameId;
        const gameServer = gameEntry.gameServer;

        // 相手のソケットを取得（通知用）
        const mySide = inputHandler.getSideBySocket(socket);
        const opponentSide = mySide === 'left' ? 'right' : 'left';
        const opponentSocket = inputHandler.getSocket(opponentSide);

        // ゲームループを停止（ステータスをfinishedにしてループを終了させる）
        gameServer.state.setStatus('finished');
        gameServer.stopReadyLoop();

        // ゲームからユーザーを削除
        if (gameRegistry.deleteUserFromGame(socket) === false) {
          this.errorLog(socket, 'Failed to remove user from the game.');
          return;
        }

        // 相手プレイヤーに切断を通知
        if (opponentSocket) {
          ResponseHandler.opponentDisconnected(
            opponentSocket,
            gameId,
            disconnectedUserId || '不明',
          );
          minilog.i(
            TAG.GAME,
            `RequestHandler: Notified opponent of disconnection in game ${gameId}`,
          );
        }

        // 誰もいなくなったらゲームを削除
        if (!inputHandler.hasAnySocket()) {
          gameRegistry.deleteGameByGameId(gameId);
          minilog.i(
            TAG.GAME,
            `RequestHandler: Game ${gameId} deleted (no players remaining)`,
          );
        }
      }
    }

    if (socketRegistry.deleteUserBySocket(socket) === false) {
      this.errorLog(socket, `Failed to unregister user ${disconnectedUserId}`);
      return;
    }
    ResponseHandler.unregistered(socket, disconnectedUserId);
    minilog.i(
      TAG.GAME,
      `RequestHandler: User ${disconnectedUserId} unregistered successfully`,
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
    const gameId = gameRegistry.generateGame(socket);
    if (gameId === null) {
      this.errorLog(socket, 'Failed to create a new game.');
      return;
    }
    const gameEntry = gameRegistry.getGameEntryBySocket(socket);
    ResponseHandler.generated(socket, gameId, gameEntry!.gameServer.state);
    minilog.i(TAG.GAME, `RequestHandler: Game ${gameId} created successfully`);
  }

  // Invite player to game
  static async joinGame(socket: WebSocket, gameId: number): Promise<void> {
    if (this.checkRegistration(socket) === false) return;
    const gameRegistry = container.gameSessionRegistry;
    const socketRegistry = container.gameSocketRegistry;

    // ゲームが存在するか確認
    const existingEntry = gameRegistry.gameIdToGameEntry.get(gameId);
    if (!existingEntry) {
      this.errorLog(socket, `ゲームID ${gameId} は存在しません。`);
      return;
    }

    const result = gameRegistry.addUserToGame(socket, gameId);
    if (result === null) {
      this.errorLog(socket, 'ゲームへの参加に失敗しました。');
      return;
    }
    const { gameId: joinedGameId, side } = result;

    // 参加者のユーザーID取得
    const joiningUserId = socketRegistry.getUserIdBySocket(socket) || '不明';

    // 参加者に通知（動的に割り当てられたサイドを使用）
    ResponseHandler.added(socket, joinedGameId, side as 'left' | 'right');
    minilog.i(
      TAG.GAME,
      `RequestHandler: User ${joiningUserId} added to game ${joinedGameId} as ${side} player`,
    );

    // 2人揃ったらゲーム準備完了を通知し、パドル操作を有効化
    const gameEntry = gameRegistry.getGameEntryBySocket(socket);
    if (gameEntry && gameEntry.inputHandler.isSocketsSet()) {
      const sockets = gameEntry.inputHandler.getSockets();
      const leftSocket = sockets[0];
      const rightSocket = sockets[1];

      // 左プレイヤー（ゲーム作成者）のユーザーID
      const leftUserId = leftSocket
        ? socketRegistry.getUserIdBySocket(leftSocket) || '不明'
        : '不明';
      // 右プレイヤー（参加者）のユーザーID
      const rightUserId = rightSocket
        ? socketRegistry.getUserIdBySocket(rightSocket) || '不明'
        : '不明';

      // ユーザー名（エイリアス）を取得
      let leftAlias = leftUserId;
      let rightAlias = rightUserId;
      try {
        const leftUser = await userRepository.findById(leftUserId);
        const rightUser = await userRepository.findById(rightUserId);
        if (leftUser?.username) leftAlias = leftUser.username;
        if (rightUser?.username) rightAlias = rightUser.username;
      } catch (err) {
        minilog.e(
          TAG.GAME,
          `RequestHandler: Failed to fetch user aliases: ${err}`,
        );
      }

      // 左プレイヤーに相手参加通知
      if (leftSocket) {
        ResponseHandler.opponentJoined(
          leftSocket,
          joinedGameId,
          rightUserId,
          rightAlias,
        );
        ResponseHandler.ready(
          leftSocket,
          joinedGameId,
          leftUserId,
          rightUserId,
          'left',
          leftAlias,
          rightAlias,
        );
      }
      // 右プレイヤーに gameReady 通知
      if (rightSocket) {
        ResponseHandler.ready(
          rightSocket,
          joinedGameId,
          leftUserId,
          rightUserId,
          'right',
          leftAlias,
          rightAlias,
        );
      }

      gameEntry.inputHandler.setUserInfo('left', leftUserId, leftAlias);
      gameEntry.inputHandler.setUserInfo('right', rightUserId, rightAlias);

      gameEntry.gameServer.startReadyLoop();
      minilog.i(TAG.GAME, `RequestHandler: Game ${joinedGameId} is ready`);
    }
  }

  // Handle player input
  static input(socket: WebSocket, input: PlayerInput): void {
    if (this.checkRegistration(socket) === false) return;

    // ゲームエントリーがない場合は入力を無視（エラーではなく静かに無視）
    const gameEntry =
      container.gameSessionRegistry.getGameEntryBySocket(socket);
    if (!gameEntry) return;

    const inputHandler = gameEntry.inputHandler;
    const sideFromSocket: GameSide | null =
      inputHandler.getSideBySocket(socket);

    if (sideFromSocket === null) return;

    inputHandler.updateFromWs(sideFromSocket, input);

    // isStartPressed が true の場合、処理後すぐにリセット（エッジトリガー）
    if (input.isStartPressed) {
      inputHandler.resetStartPressed(sideFromSocket);

      // 2人揃っていればゲームを開始/再開
      if (inputHandler.isSocketsSet()) {
        const gameServer = gameEntry.gameServer;
        if (
          gameServer.state.status === 'ready' ||
          gameServer.state.status === 'paused'
        ) {
          const sockets = inputHandler.getSockets();
          sockets.forEach((s) => {
            if (s) ResponseHandler.start(s, gameEntry.gameId);
          });
          gameServer.start();
          minilog.i(
            TAG.GAME,
            `RequestHandler: Game ${gameEntry.gameId} started/resumed`,
          );
        }
      }
    }
  }

  // Handle player leaving the game
  static leaveGame(socket: WebSocket): void {
    if (this.checkRegistration(socket) === false) return;
    if (this.checkGameExistence(socket) === false) return;

    const gameRegistry = container.gameSessionRegistry;
    const socketRegistry = container.gameSocketRegistry;
    const gameEntry = gameRegistry.getGameEntryBySocket(socket);
    if (!gameEntry) return;

    const gameId = gameEntry.gameId;
    const inputHandler = gameEntry.inputHandler;
    const gameServer = gameEntry.gameServer;

    // ゲーム開始後は退出不可
    if (gameServer.state.status === 'playing') {
      this.errorLog(socket, 'ゲーム中は退出できません。');
      return;
    }

    // 退出するプレイヤーのユーザーID取得
    const leavingUserId = socketRegistry.getUserIdBySocket(socket) || '不明';

    // 相手のソケットを取得（退出通知用）
    const leavingSide = inputHandler.getSideBySocket(socket);
    const opponentSide = leavingSide === 'left' ? 'right' : 'left';
    const opponentSocket = inputHandler.getSocket(opponentSide);

    // ソケットをゲームから削除
    inputHandler.removeSocket(socket);
    gameRegistry.deleteUserFromGame(socket);

    // 退出したプレイヤーに通知
    ResponseHandler.gameLeft(socket, gameId);

    // 相手プレイヤーに通知
    if (opponentSocket) {
      ResponseHandler.playerLeft(opponentSocket, gameId, leavingUserId);
    }

    // ready ループを停止
    gameServer.stopReadyLoop();

    // ゲームに誰もいなくなったら削除
    if (!inputHandler.hasAnySocket()) {
      gameRegistry.deleteGameByGameId(gameId);
      minilog.i(
        TAG.GAME,
        `RequestHandler: Game ${gameId} deleted (no players remaining)`,
      );
    }

    minilog.i(
      TAG.GAME,
      `RequestHandler: User ${leavingUserId} left game ${gameId}`,
    );
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
