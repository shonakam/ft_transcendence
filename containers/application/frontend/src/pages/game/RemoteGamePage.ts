// import { GamePage } from './GamePage';
import { Component } from '../../interface/Component';

import { GameCanvas } from '../../components/game/canvas/GameCanvas';
import { RemoteInputHandler } from '../../components/game/inputHandler/RemoteInputHandler';
import { RemoteGame } from '../../components/game/RemoteGame';
import remoteGameTemplate from './remote-game.html?raw';

import CONFIG from '@shonakam/common/game/GameConfig';
import { GameSocket } from '../../components/game/ws/GameSocket';
import type { GameState } from '@shonakam/common';
import { authStore } from '../../store/authStore';

export class RemoteGamePage implements Component {
  el: HTMLElement = document.createElement('main');
  gameCanvas: GameCanvas;
  inputHandler = new RemoteInputHandler();
  pongGame: RemoteGame;
  socket: GameSocket = new GameSocket();

  // UI状態
  private userId: string | null = null;
  private currentGameId: number | null = null;
  private mySide: 'left' | 'right' | null = null;
  private leftPlayer: string | null = null;
  private rightPlayer: string | null = null;
  private leftPlayerAlias: string | null = null;
  private rightPlayerAlias: string | null = null;
  private pendingJoinGameId: number | null = null; // URLパラメータからの自動参加用

  constructor() {
    this.el.innerHTML = remoteGameTemplate;
    this.gameCanvas = new GameCanvas(
      this.el.querySelector('.canvas-stack') as HTMLElement,
      CONFIG.CANVAS_WIDTH,
      CONFIG.CANVAS_HEIGHT
    );
    this.pongGame = new RemoteGame(
      this.gameCanvas,
      this.inputHandler,
      this.socket
    );
    this.pongGame.initRender();
    this.render();
    this.pongGame.state.onScoreChange = this.updateScore.bind(this);
    this.pongGame.state.onStatusChange = this.updateStatus.bind(this);
    this.initUIEventListeners();
    this.checkUrlGameIdParam();
    this.socket.connect({
      onRegistered: (userId) => this.handleRegistered(userId),
      onGameGenerated: (gameId, state) =>
        this.handleGameGenerated(gameId, state),
      onPlayerAdded: (gameId, side) => this.handlePlayerAdded(gameId, side),
      onOpponentJoined: (gameId, opponentId, opponentAlias) =>
        this.handleOpponentJoined(gameId, opponentId, opponentAlias),
      onGameReady: (
        gameId,
        leftPlayer,
        rightPlayer,
        yourSide,
        leftAlias,
        rightAlias
      ) =>
        this.handleGameReady(
          gameId,
          leftPlayer,
          rightPlayer,
          yourSide,
          leftAlias,
          rightAlias
        ),
      onGameStart: (gameId) => this.handleGameStart(gameId),
      onGameState: (state) => this.pongGame.updateState(state),
      onPlayerLeft: (gameId, playerId) =>
        this.handlePlayerLeft(gameId, playerId),
      onGameLeft: (gameId) => this.handleGameLeft(gameId),
      onOpponentDisconnected: (gameId, opponentId) =>
        this.handleOpponentDisconnected(gameId, opponentId),
      onError: (message) => this.handleError(message),
    });
  }

  private initUIEventListeners(): void {
    // ゲーム作成ボタン
    const createBtn = this.el.querySelector('#create-game-btn');
    createBtn?.addEventListener('click', () => {
      this.socket.sendCreateGame();
    });

    // ゲーム参加ボタン
    const joinBtn = this.el.querySelector('#join-game-btn');
    const joinInput = this.el.querySelector(
      '#join-game-input'
    ) as HTMLInputElement;
    joinBtn?.addEventListener('click', () => {
      const gameId = parseInt(joinInput.value, 10);
      if (!isNaN(gameId)) {
        this.socket.sendJoinGame(gameId);
      }
    });

    // 退出ボタン
    const leaveBtn = this.el.querySelector('#leave-game-btn');
    leaveBtn?.addEventListener('click', () => {
      this.socket.sendLeaveGame();
    });
  }

  // WebSocket コールバックハンドラ
  private handleRegistered(userId: string): void {
    this.userId = userId;
    // URLパラメータからのゲームIDがあれば自動参加
    if (this.pendingJoinGameId !== null) {
      this.socket.sendJoinGame(this.pendingJoinGameId);
      this.pendingJoinGameId = null;
    }
  }

  private handleGameGenerated(gameId: number, state: GameState): void {
    this.currentGameId = gameId;
    this.mySide = 'left'; // ゲーム作成者は左
    this.leftPlayer = this.userId;
    this.leftPlayerAlias = authStore.getUsername() || this.userId;
    this.updateGameIdInput();
    this.updateMatchDisplay();
    this.pongGame.updateState(state);
    this.disableGameControls();
    // 入力送信ループを開始
    this.pongGame.start();
  }

  private handlePlayerAdded(gameId: number, side: 'left' | 'right'): void {
    this.currentGameId = gameId;
    this.mySide = side;
    this.updateGameIdInput();
    this.disableGameControls();
    // 入力送信ループを開始
    this.pongGame.start();
  }

  private handleOpponentJoined(
    _gameId: number,
    opponentId: string,
    opponentAlias: string
  ): void {
    this.rightPlayer = opponentId;
    this.rightPlayerAlias = opponentAlias;
    this.updateMatchDisplay();
  }

  private handleGameReady(
    gameId: number,
    leftPlayer: string,
    rightPlayer: string,
    yourSide: 'left' | 'right',
    leftAlias: string,
    rightAlias: string
  ): void {
    this.currentGameId = gameId;
    this.mySide = yourSide;
    this.leftPlayer = leftPlayer;
    this.rightPlayer = rightPlayer;
    this.leftPlayerAlias = leftAlias;
    this.rightPlayerAlias = rightAlias;
    this.updateGameIdInput();
    this.updateMatchDisplay();
  }

  private handleGameStart(gameId: number): void {
    this.currentGameId = gameId;
    this.updateGameIdInput();
    // ゲーム開始後は退出ボタンを非表示
    this.hideLeaveButton();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private handlePlayerLeft(_gameId: number, playerId: string): void {
    // 相手が退出した場合、待機状態に戻す
    if (this.mySide === 'left') {
      this.rightPlayer = null;
      this.rightPlayerAlias = null;
    } else {
      this.leftPlayer = null;
      this.leftPlayerAlias = null;
    }
    this.updateMatchDisplay();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private handleGameLeft(_gameId: number): void {
    // 自分が退出した場合、状態をリセット
    this.resetGameState();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private handleOpponentDisconnected(
    _gameId: number,
    _opponentId: string
  ): void {
    // 相手が切断した場合、ゲーム状態をリセット
    this.resetGameState();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private handleError(_message: string): void {
    // エラーは toaster で表示されるので、URLパラメータをクリア
    this.clearUrlGameIdParam();
  }

  // ゲーム状態をリセット
  private resetGameState(): void {
    this.currentGameId = null;
    this.mySide = null;
    this.leftPlayer = null;
    this.rightPlayer = null;
    this.leftPlayerAlias = null;
    this.rightPlayerAlias = null;
    this.clearGameIdInput();
    this.updateMatchDisplay();
    this.enableGameControls();
    this.hideLeaveButton();
    this.pongGame.stop();
  }

  // ゲーム操作ボタンを無効化
  private disableGameControls(): void {
    const createBtn = this.el.querySelector(
      '#create-game-btn'
    ) as HTMLButtonElement;
    const joinBtn = this.el.querySelector(
      '#join-game-btn'
    ) as HTMLButtonElement;
    const joinInput = this.el.querySelector(
      '#join-game-input'
    ) as HTMLInputElement;

    if (createBtn) {
      createBtn.disabled = true;
      createBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
    if (joinBtn) {
      joinBtn.disabled = true;
      joinBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
    if (joinInput) {
      joinInput.disabled = true;
      joinInput.classList.add('opacity-50', 'cursor-not-allowed');
    }
    // 退出ボタンを表示
    this.showLeaveButton();
  }

  // ゲーム操作ボタンを有効化
  private enableGameControls(): void {
    const createBtn = this.el.querySelector(
      '#create-game-btn'
    ) as HTMLButtonElement;
    const joinBtn = this.el.querySelector(
      '#join-game-btn'
    ) as HTMLButtonElement;
    const joinInput = this.el.querySelector(
      '#join-game-input'
    ) as HTMLInputElement;

    if (createBtn) {
      createBtn.disabled = false;
      createBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
    if (joinBtn) {
      joinBtn.disabled = false;
      joinBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
    if (joinInput) {
      joinInput.disabled = false;
      joinInput.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  }

  // 退出ボタン有効化
  private showLeaveButton(): void {
    const leaveBtn = this.el.querySelector(
      '#leave-game-btn'
    ) as HTMLButtonElement;
    if (leaveBtn) {
      leaveBtn.disabled = false;
      leaveBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  }

  // 退出ボタン無効化
  private hideLeaveButton(): void {
    const leaveBtn = this.el.querySelector(
      '#leave-game-btn'
    ) as HTMLButtonElement;
    if (leaveBtn) {
      leaveBtn.disabled = true;
      leaveBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
  }

  // UI更新メソッド
  private updateGameIdInput(): void {
    const joinInput = this.el.querySelector(
      '#join-game-input'
    ) as HTMLInputElement;
    if (joinInput && this.currentGameId !== null) {
      joinInput.value = String(this.currentGameId);
    }
  }

  private clearGameIdInput(): void {
    const joinInput = this.el.querySelector(
      '#join-game-input'
    ) as HTMLInputElement;
    if (joinInput) {
      joinInput.value = '';
    }
  }

  private updateMatchDisplay(): void {
    const matchEl = this.el.querySelector('#match-display');
    if (matchEl) {
      let leftLabel = '';
      let rightLabel = '';
      if (this.mySide === 'left') {
        leftLabel = 'left - you';
        rightLabel = 'right - challenger';
      } else if (this.mySide === 'right') {
        leftLabel = 'left - challenger';
        rightLabel = 'right - you';
      }
      const leftName = this.leftPlayerAlias
        ? `${this.leftPlayerAlias} (${leftLabel})`
        : '待機中...';
      const rightName = this.rightPlayerAlias
        ? `${this.rightPlayerAlias} (${rightLabel})`
        : '待機中...';
      matchEl.textContent = `${leftName} vs ${rightName}`;
    }
  }

  public render(): void {
    this.el.querySelector('h1')!.textContent = 'Remote Pong Game';
    this.el.querySelector('#game-description')!.textContent =
      'This is the remote multiplayer pong game.';
    this.updateWinningScore();
  }

  public destroy(): void {
    this.socket.disconnect();
    this.el.remove();
  }

  public getElement(): HTMLElement {
    // this.pongGame.start();
    return this.el;
  }

  private updateWinningScore() {
    this.el.querySelector('#winning-score')!.textContent =
      `(First to ${CONFIG.WINNING_SCORE} wins)`;
  }

  private updateScore(left: number, right: number) {
    this.el.querySelector('#score-left')!.textContent = left.toString();
    this.el.querySelector('#score-right')!.textContent = right.toString();
    if (left < CONFIG.WINNING_SCORE && right < CONFIG.WINNING_SCORE) return;

    // 勝利メッセージを表示（Local形式に合わせる）
    const canvasStack = this.el.querySelector('.canvas-stack');
    if (canvasStack) {
      const winnerName =
        left >= CONFIG.WINNING_SCORE
          ? this.leftPlayerAlias || 'Left Player'
          : this.rightPlayerAlias || 'Right Player';
      canvasStack.innerHTML += `
        <div class="winning-message absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div class="text-center">
            <p class="text-2xl text-gray-300 mb-2">🏆 Winner 🏆</p>
            <h2 class="text-6xl font-extrabold text-white mb-4 drop-shadow-lg">${winnerName}</h2>
            <p class="text-3xl font-bold text-gray-200">${left} : ${right}</p>
            <p class="text-lg text-gray-400 mt-6">Game Over</p>
          </div>
        </div>
      `;
    }

    // リモートゲームの結果はサーバー側（GameServer.ts）で保存されるため、
    // クライアント側からの保存は不要
  }

  private updateStatus(status: string) {
    this.el.querySelector('#game-status')!.textContent =
      `Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`;
  }

  // URLクエリパラメータからgameIdを取得して自動参加を準備
  private checkUrlGameIdParam(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const gameIdStr = urlParams.get('gameId');
    if (gameIdStr) {
      const gameId = parseInt(gameIdStr, 10);
      if (!isNaN(gameId) && gameId > 0) {
        this.pendingJoinGameId = gameId;
        // 入力欄にも反映
        const joinInput = this.el.querySelector(
          '#join-game-input'
        ) as HTMLInputElement;
        if (joinInput) {
          joinInput.value = gameId.toString();
        }
      }
    }
  }

  // URLからgameIdパラメータを削除
  private clearUrlGameIdParam(): void {
    const url = new URL(window.location.href);
    if (url.searchParams.has('gameId')) {
      url.searchParams.delete('gameId');
      window.history.replaceState({}, '', url.pathname);
    }
  }
}
