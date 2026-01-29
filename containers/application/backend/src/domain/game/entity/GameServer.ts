import type { WebSocket } from 'ws';
import { container } from '../../../container/index.ts';

import { PongGame } from '@shonakam/common';
import { GameState } from '@shonakam/common';
import { PhysicsEngine } from '@shonakam/common';
import { checkGoalCollision } from '@shonakam/common';
import { GameSide } from '@shonakam/common';

import { RemoteInputHandler } from './RemoteInputHandler.ts';
import { ResponseHandler } from '../../../adapter/websocket/game/ResponseHandler.ts';
import minilog, { TAG } from '../../../utils/minilog.ts';

export class GameServer implements PongGame {
  input: RemoteInputHandler;
  state: GameState;
  gameId: number;
  lastFrameTime: number | null = null;
  private readonly loopCallback: (time: number) => void;
  private isReadyLoopRunning = false;

  constructor(inputHandler: RemoteInputHandler, gameId: number) {
    this.input = inputHandler;
    this.gameId = gameId;
    this.state = new GameState();
    this.loopCallback = this.loop.bind(this);
    // send initial state to clients here if needed
  }

  // ready状態でパドル位置を送信するループを開始
  startReadyLoop(): void {
    if (this.isReadyLoopRunning) return;
    this.isReadyLoopRunning = true;
    this.readyLoop();
  }

  // readyループを停止
  stopReadyLoop(): void {
    this.isReadyLoopRunning = false;
  }

  private readyLoop(): void {
    // ループが停止されたか、playingになったらreadyループは終了
    if (
      !this.isReadyLoopRunning ||
      this.state.status === 'playing' ||
      this.state.status === 'finished'
    ) {
      this.isReadyLoopRunning = false;
      return;
    }

    // パドル位置を更新（ボールは動かさない）
    PhysicsEngine.update(1 / 60, this.state, this.input, true); // paddleOnly

    const sockets = this.input.getSockets();
    if (sockets[0]) ResponseHandler.state(sockets[0], this.state);
    if (sockets[1]) ResponseHandler.state(sockets[1], this.state);

    setTimeout(() => this.readyLoop(), 1000 / 60);
  }

  start(): void {
    if (this.state.status === 'ready' || this.state.status === 'paused')
      this.state.setStatus('playing');
    // dtをリセットして、再開時にボールが飛ばないようにする
    this.lastFrameTime = null;
    this.loop(performance.now());
  }

  stop(): void {
    if (this.state.status !== 'playing') return;
    this.state.setStatus('paused');
    // send paused state to clients here if needed
  }

  loop(currentTime: number): void {
    let dt: number;
    if (this.lastFrameTime === null) dt = 0;
    else dt = (currentTime - this.lastFrameTime) / 1000;
    this.lastFrameTime = currentTime;

    PhysicsEngine.update(dt, this.state, this.input);
    const goal = checkGoalCollision(
      this.state.ball,
      this.state.config.CANVAS_WIDTH,
    );

    // send updated positions to clients here if needed
    this.updateScore(goal);
    const sockets: (WebSocket | null)[] = this.input.getSockets();
    if (sockets[0]) ResponseHandler.state(sockets[0], this.state);
    if (sockets[1]) ResponseHandler.state(sockets[1], this.state);
    if (this.state.status === 'playing')
      setTimeout(() => this.loop(performance.now()), 1000 / 60);
  }

  updateScore(goal: GameSide | 'none'): void {
    if (goal === 'none') return;

    // 即座にボールをリセット（連続ゴール検知を防ぐ）
    this.state.ball.reset();

    // incrementScore は勝利条件達成時に true を返し、status を 'finished' に設定する
    const isGameOver =
      goal === 'left'
        ? this.state.incrementScore('left')
        : this.state.incrementScore('right');

    if (isGameOver) {
      // ゲーム終了 - 最終状態を送信してループを終了
      const sockets = this.input.getSockets();
      if (sockets[0]) ResponseHandler.state(sockets[0], this.state);
      if (sockets[1]) ResponseHandler.state(sockets[1], this.state);
      this.state.setStatus('finished');
      this.saveGameResult();
      return;
    }

    this.state.setStatus('ready');
    // ready ループを再開してパドル操作を維持
    this.startReadyLoop();
  }

  private async saveGameResult(): Promise<void> {
    const register = container.gameUseCases.saveGameResult;

    try {
      const userIds = this.input.getUserIds();
      const userAliases = this.input.getUserAliases();
      const leftUserId = userIds[0];
      const rightUserId = userIds[1];

      // Only save if both players have IDs
      if (!leftUserId || !rightUserId) {
        minilog.w(
          TAG.GAME,
          `GameServer: Cannot save result - missing player IDs (left: ${leftUserId}, right: ${rightUserId})`,
        );
        return;
      }

      await register.execute({
        leftUserId,
        rightUserId,
        leftAlias: userAliases[0],
        rightAlias: userAliases[1],
        leftScore: this.state.scores[0],
        rightScore: this.state.scores[1],
        winner: this.state.winner ?? 'left',
        endedAt: Date.now(),
      });

      minilog.i(
        TAG.GAME,
        `GameServer: Game ${this.gameId} result saved successfully`,
      );
    } catch (err) {
      console.error('RemotePongGameServer: Failed to save game result:', err);
    } finally {
      // ゲーム終了後、ルームをクリーンアップ
      this.cleanupGameRoom();
    }
  }

  private cleanupGameRoom(): void {
    const gameRegistry = container.gameSessionRegistry;
    const socketRegistry = container.gameSocketRegistry;

    // 両プレイヤーのソケット登録を解除
    const sockets = this.input.getSockets();
    for (const socket of sockets) {
      if (socket) {
        gameRegistry.deleteUserFromGame(socket);
      }
    }

    // ゲームルームを削除
    if (gameRegistry.deleteGameByGameId(this.gameId)) {
      minilog.i(
        TAG.GAME,
        `GameServer: Game ${this.gameId} room deleted after finish`,
      );
    }
  }
}
