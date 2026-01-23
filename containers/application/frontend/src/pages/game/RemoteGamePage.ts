// import { GamePage } from './GamePage';
import { Component } from '../../interface/Component';

import { GameCanvas } from '../../components/game/canvas/GameCanvas';
import { RemoteInputHandler } from '../../components/game/inputHandler/ReoteInputHandler';
import { RemoteGame } from '../../components/game/RemoteGame';
import gameTemplate from './game.html?raw';

import CONFIG from '@shonakam/common/game/GameConfig';
import { GameSocket } from '../../components/game/ws/GameSocket';
import type { GameState } from '@shonakam/common';

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

  constructor() {
    this.el.innerHTML = gameTemplate;
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
    this.socket.connect({
      onRegistered: (userId) => this.handleRegistered(userId),
      onGameGenerated: (gameId, state) =>
        this.handleGameGenerated(gameId, state),
      onPlayerAdded: (gameId, side) => this.handlePlayerAdded(gameId, side),
      onOpponentJoined: (gameId, opponentId) =>
        this.handleOpponentJoined(gameId, opponentId),
      onGameReady: (gameId, leftPlayer, rightPlayer, yourSide) =>
        this.handleGameReady(gameId, leftPlayer, rightPlayer, yourSide),
      onGameStart: (gameId) => this.handleGameStart(gameId),
      onGameState: (state) => this.pongGame.updateState(state),
      onPlayerLeft: (gameId, playerId) =>
        this.handlePlayerLeft(gameId, playerId),
      onGameLeft: (gameId) => this.handleGameLeft(gameId),
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
    this.updateUserIdDisplay();
  }

  private handleGameGenerated(gameId: number, state: GameState): void {
    this.currentGameId = gameId;
    this.mySide = 'left'; // ゲーム作成者は左
    this.leftPlayer = this.userId;
    this.updateGameIdDisplay();
    this.updateMatchDisplay();
    this.pongGame.updateState(state);
    this.disableGameControls();
    // 入力送信ループを開始
    this.pongGame.start();
  }

  private handlePlayerAdded(gameId: number, side: 'left' | 'right'): void {
    this.currentGameId = gameId;
    this.mySide = side;
    this.updateGameIdDisplay();
    this.disableGameControls();
    // 入力送信ループを開始
    this.pongGame.start();
  }

  private handleOpponentJoined(_gameId: number, opponentId: string): void {
    this.rightPlayer = opponentId;
    this.updateMatchDisplay();
  }

  private handleGameReady(
    gameId: number,
    leftPlayer: string,
    rightPlayer: string,
    yourSide: 'left' | 'right'
  ): void {
    this.currentGameId = gameId;
    this.mySide = yourSide;
    this.leftPlayer = leftPlayer;
    this.rightPlayer = rightPlayer;
    this.updateGameIdDisplay();
    this.updateMatchDisplay();
  }

  private handleGameStart(gameId: number): void {
    this.currentGameId = gameId;
    this.updateGameIdDisplay();
    // ゲーム開始後は退出ボタンを非表示
    this.hideLeaveButton();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private handlePlayerLeft(_gameId: number, playerId: string): void {
    // 相手が退出した場合、待機状態に戻す
    if (this.mySide === 'left') {
      this.rightPlayer = null;
    } else {
      this.leftPlayer = null;
    }
    this.updateMatchDisplay();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private handleGameLeft(_gameId: number): void {
    // 自分が退出した場合、状態をリセット
    this.resetGameState();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private handleError(_message: string): void {
    // エラーは toaster で表示されるので、追加処理があれば書く
  }

  // ゲーム状態をリセット
  private resetGameState(): void {
    this.currentGameId = null;
    this.mySide = null;
    this.leftPlayer = null;
    this.rightPlayer = null;
    this.updateGameIdDisplay();
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

  // 退出ボタン表示
  private showLeaveButton(): void {
    const leaveBtn = this.el.querySelector('#leave-game-btn');
    leaveBtn?.classList.remove('hidden');
  }

  // 退出ボタン非表示
  private hideLeaveButton(): void {
    const leaveBtn = this.el.querySelector('#leave-game-btn');
    leaveBtn?.classList.add('hidden');
  }

  // UI更新メソッド
  private updateUserIdDisplay(): void {
    const userIdEl = this.el.querySelector('#user-id');
    if (userIdEl) {
      userIdEl.textContent = this.userId || '未登録';
    }
  }

  private updateGameIdDisplay(): void {
    const gameIdEl = this.el.querySelector('#game-id');
    if (gameIdEl) {
      gameIdEl.textContent =
        this.currentGameId !== null ? String(this.currentGameId) : '-';
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
      const leftName = this.leftPlayer
        ? `${this.leftPlayer} (${leftLabel})`
        : '待機中...';
      const rightName = this.rightPlayer
        ? `${this.rightPlayer} (${rightLabel})`
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
    const winner =
      left >= CONFIG.WINNING_SCORE ? 'Left Player' : 'Right Player';
    // add winning message
    this.el.querySelector('.game-canvas')!.innerHTML += `
      <div class="winning-message absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-75 p-4 rounded shadow-lg">
        <h2 class="text-5xl font-bold mb-2">${winner} Wins!</h2>
        <p class="text-xl">Final Score: ${left} : ${right}</p>
      </div>
    `;
  }

  private updateStatus(status: string) {
    this.el.querySelector('#game-status')!.textContent =
      `Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`;
  }
}
