// import { GamePage } from './GamePage';
import { Component } from '../../interface/Component';

import { GameCanvas } from '../../components/game/canvas/GameCanvas';
import { LocalInputHandler } from '../../components/game/inputHandler/LocalInputHandler';
import { LocalGame } from '../../components/game/LocalGame';
import localGameTemplate from './local-game.html?raw';

import CONFIG from '@shonakam/common/game/GameConfig';
import { TournamentRender } from '../../components/game/tournament/TournamentRender';
import { authStore } from '../../store/authStore';
import { saveGameResult } from '../../services/game/stats';
import { chatService } from '../../services/chat/ChatService';

export class LocalGamePage implements Component {
  private el: HTMLElement = document.createElement('main');
  private gameCanvas: GameCanvas;
  private inputHandler = new LocalInputHandler();
  private pongGame: LocalGame;
  private tournament: TournamentRender;
  private currentSpeedMultiplier: number = 1;

  // 現在の試合情報
  private currentMatch: {
    roundIndex: number;
    matchIndex: number;
    p1Alias: string;
    p2Alias: string;
  } | null = null;
  private isTournamentMode: boolean = false;

  constructor() {
    this.el.innerHTML = localGameTemplate;
    this.gameCanvas = new GameCanvas(
      this.el.querySelector('.canvas-stack') as HTMLElement,
      CONFIG.CANVAS_WIDTH,
      CONFIG.CANVAS_HEIGHT
    );
    this.pongGame = new LocalGame(this.gameCanvas, this.inputHandler);
    this.pongGame.initRender();

    // トーナメントをコールバック付きで初期化
    this.tournament = new TournamentRender({
      onTournamentStart: () => this.onTournamentStart(),
      onMatchReady: (match) => this.onMatchReady(match),
    });

    this.render();
    this.pongGame.state.onScoreChange = this.updateScore.bind(this);
    this.pongGame.state.onStatusChange = this.updateStatus.bind(this);
    this.pongGame.state.playerSide = 'both';
  }

  public render(): void {
    // Hide match info initially
    this.el.querySelector('#match-info')!.classList.add('hidden');
    this.updateWinningScore();
    this.setupSpeedSelector();

    // トーナメントを表示（フォームから開始）
    this.el
      .querySelector('.tournament-section')!
      .appendChild(this.tournament.getElement());
  }

  private setupSpeedSelector(): void {
    const speedButtons = this.el.querySelectorAll('.speed-btn');
    const speedMap: { [key: string]: number } = {
      'speed-1x': 1,
      'speed-5x': 5,
      'speed-10x': 10,
    };

    speedButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const multiplier = speedMap[btn.id];
        if (multiplier !== undefined) {
          this.currentSpeedMultiplier = multiplier;
          this.pongGame.setBallSpeedMultiplier(multiplier);
          this.pongGame.state.ball.reset();
          this.pongGame.renderer.render();

          // Update button styles
          speedButtons.forEach((b) => {
            b.classList.remove('bg-blue-600');
            b.classList.add('bg-white/20');
          });
          btn.classList.remove('bg-white/20');
          btn.classList.add('bg-blue-600');
        }
      });
    });
  }

  private onTournamentStart(): void {
    this.isTournamentMode = true;
    // ゲームを初期状態にリセット
    this.resetGameForNewMatch();
  }

  private onMatchReady(match: {
    roundIndex: number;
    matchIndex: number;
    p1Alias: string;
    p2Alias: string;
  }): void {
    this.currentMatch = match;
    // 試合開始を通知
    this.tournament.startCurrentMatch();
    this.showMatchInfo(match.p1Alias, match.p2Alias);

    // Generalチャネルに通知を送る
    if (authStore.isLoggedIn()) {
      chatService
        .sendMessage(
          'global-room-id-001',
          `Tournament Match Started: ${match.p1Alias} vs ${match.p2Alias} 🏓`
        )
        .catch((err) =>
          console.error('Failed to send tournament start message:', err)
        );
    }

    // ゲームをリセット
    this.resetGameForNewMatch();
  }

  private showMatchInfo(p1Alias: string, p2Alias: string): void {
    const matchInfoSection = this.el.querySelector(
      '#match-info'
    ) as HTMLElement;
    matchInfoSection.classList.remove('hidden');
    // Remote形式と同じくmatch-displayを使用
    const matchDisplay = this.el.querySelector('#match-display');
    if (matchDisplay) {
      matchDisplay.textContent = `${p1Alias} vs ${p2Alias}`;
    }
  }

  private resetGameForNewMatch(): void {
    // スコアをリセット
    this.pongGame.state.scores = [0, 0];
    this.updateScore(0, 0);
    this.pongGame.state.status = 'ready';

    // ボールを中央にリセット
    this.pongGame.state.ball.reset();

    // パドルを初期位置にリセット
    const centerY = (CONFIG.CANVAS_HEIGHT - CONFIG.PADDLE_LENGTH) / 2;
    this.pongGame.state.paddles[0].position.y = centerY;
    this.pongGame.state.paddles[1].position.y = centerY;

    // 描画を更新
    this.pongGame.renderer.render();

    // 勝利メッセージを削除
    const winningMessage = this.el.querySelector('.winning-message');
    if (winningMessage) winningMessage.remove();
  }

  public destroy(): void {
    this.removeSpaceEventListener();
    this.el.remove();
  }

  public getElement(): HTMLElement {
    this.addSpaceEventListener();
    return this.el;
  }

  private keydownHandler = (event: KeyboardEvent) => {
    if (event.code === 'Space') {
      if (this.pongGame.state.status === 'finished' && !this.isTournamentMode) {
        // ゲーム終了後のリスタート
        this.resetGameForNewMatch();
        // 勝利メッセージを削除
        const winningMessage = this.el.querySelector('.winning-message');
        if (winningMessage) winningMessage.remove();
        this.pongGame.start();
      } else if (
        this.pongGame.state.status === 'ready' ||
        this.pongGame.state.status === 'paused'
      ) {
        this.pongGame.start();
      } else if (this.pongGame.state.status === 'playing') {
        this.pongGame.stop();
      }
    }
  };

  private addSpaceEventListener(): void {
    window.addEventListener('keydown', this.keydownHandler);
  }

  private removeSpaceEventListener(): void {
    window.removeEventListener('keydown', this.keydownHandler);
  }

  private updateWinningScore() {
    this.el.querySelector('#winning-score')!.textContent =
      `(First to ${CONFIG.WINNING_SCORE} wins)`;
  }

  private updateScore(left: number, right: number) {
    this.el.querySelector('#score-left')!.textContent = left.toString();
    this.el.querySelector('#score-right')!.textContent = right.toString();
    if (left < CONFIG.WINNING_SCORE && right < CONFIG.WINNING_SCORE) return;

    // 試合終了処理
    this.handleMatchEnd(left, right);
  }

  private handleMatchEnd(left: number, right: number): void {
    const winnerName = this.currentMatch
      ? left >= CONFIG.WINNING_SCORE
        ? this.currentMatch.p1Alias
        : this.currentMatch.p2Alias
      : left >= CONFIG.WINNING_SCORE
        ? 'Left Player'
        : 'Right Player';

    // トーナメントモードの場合、先にisFinishedを予測（recordMatchResult呼び出し前）
    // recordMatchResult呼び出しを遅延させて、メッセージ表示後に次の試合へ進む
    const wasInTournament = this.isTournamentMode && this.currentMatch !== null;

    // 勝利メッセージを表示（既存のcanvasを壊さないようにinsertAdjacentHTMLを使用）
    const canvasStack = this.el.querySelector('.canvas-stack')!;
    let nextStepMessage: string;
    if (this.isTournamentMode) {
      // 一旦「次の試合へ」と表示、終了時は後で更新
      nextStepMessage =
        '<p class="text-lg text-gray-400 mt-6">Next match starting soon...</p>';
    } else {
      nextStepMessage =
        '<p class="text-lg text-gray-400 mt-6">Press Space to play again</p>';
    }
    const winningMessageHTML = `
      <div class="winning-message absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-50">
        <div class="text-center">
          <p class="text-2xl text-gray-300 mb-2">🏆 Winner 🏆</p>
          <h2 class="text-6xl font-extrabold text-white mb-4 drop-shadow-lg">${winnerName}</h2>
          <p class="text-3xl font-bold text-gray-200">${left} : ${right}</p>
          ${nextStepMessage}
        </div>
      </div>
    `;
    canvasStack.insertAdjacentHTML('beforeend', winningMessageHTML);

    // 試合単体の保存（トーナメントモードでない場合、またはトーナメント内の各試合を即座に保存）
    if (authStore.isLoggedIn()) {
      this.saveSingleMatchResult(left, right).catch(console.error);
    }

    // トーナメントモードの場合、遅延後に結果を記録して次の試合へ
    if (wasInTournament) {
      this.currentMatch = null;
      setTimeout(() => {
        this.tournament.recordMatchResult(left, right);
        const isTournamentFinished = this.tournament.isFinished();

        if (isTournamentFinished) {
          this.showTournamentResult();
        }
        // 次の試合がある場合はonMatchReadyコールバックで自動的に処理される
      }, 2000);
    }
  }

  private async saveSingleMatchResult(
    left: number,
    right: number
  ): Promise<void> {
    const loggedInUser = await authStore.getMe();
    const loggedInUserId = loggedInUser?.id;
    const loggedInUsername = authStore.getUsername();

    if (!loggedInUserId || !loggedInUsername) return;

    let p1Alias = 'Left Player';
    let p2Alias = 'Right Player';
    let p1Id = `anon:left`;
    let p2Id = `anon:right`;

    if (this.currentMatch) {
      p1Alias = this.currentMatch.p1Alias;
      p2Alias = this.currentMatch.p2Alias;

      // 現在の試合からIDを特定する試み
      const p1IsMe = p1Alias === loggedInUsername;
      const p2IsMe = p2Alias === loggedInUsername;

      if (!p1IsMe && !p2IsMe) return; // 自分が参加していない試合は保存しない

      p1Id = p1IsMe ? loggedInUserId : `anon:${p1Alias}`;
      p2Id = p2IsMe ? loggedInUserId : `anon:${p2Alias}`;
    } else {
      // 非トーナメントのローカル対戦（通常は自分が左）
      p1Id = loggedInUserId;
      p1Alias = loggedInUsername;
    }

    try {
      await saveGameResult({
        leftUserId: p1Id,
        rightUserId: p2Id,
        leftAlias: p1Alias,
        rightAlias: p2Alias,
        leftScore: left,
        rightScore: right,
        winner: left > right ? 'left' : 'right',
      });
      console.log(`[LocalGamePage] Match saved successfully`);
    } catch (err) {
      console.error('[LocalGamePage] Failed to save single match:', err);
    }
  }

  private async showTournamentResult(): Promise<void> {
    const winner = this.tournament.getWinner();
    const results = this.tournament.getCompletedResults();

    // 勝利メッセージを更新（トーナメント優勝者）
    const winningMessage = this.el.querySelector('.winning-message');
    if (winningMessage) {
      winningMessage.innerHTML = `
        <div class="text-center">
          <p class="text-3xl text-yellow-400 mb-4">🏆 Tournament Champion 🏆</p>
          <h2 class="text-6xl font-extrabold text-white mb-4 drop-shadow-lg">${winner?.alias ?? 'Unknown'}</h2>
          <p class="text-lg text-gray-400">Total matches played: ${results.length}</p>
        </div>
      `;
    }

    // Generalチャネルに優勝通知を送る
    if (authStore.isLoggedIn()) {
      chatService
        .sendMessage(
          'global-room-id-001',
          `🏆 Tournament Ended! Champion: ${winner?.alias ?? 'Unknown'}! 🏆`
        )
        .catch((err) =>
          console.error('Failed to send tournament end message:', err)
        );
    }

    // ログインユーザーが参加している試合のみバックエンドに保存
    if (authStore.isLoggedIn()) {
      const loggedInUser = await authStore.getMe();
      const loggedInUserId = loggedInUser?.id;

      if (loggedInUserId) {
        // ログインユーザーが参加した試合を抽出
        const userMatches = results.filter(
          (match) =>
            match.p1.userId === loggedInUserId ||
            match.p2.userId === loggedInUserId ||
            match.p1.alias === authStore.getUsername() ||
            match.p2.alias === authStore.getUsername()
        );

        // 各試合を保存
        for (const match of userMatches) {
          try {
            // ログインユーザーのIDを確実に紐付ける
            const p1IsMe = match.p1.alias === authStore.getUsername();
            const p2IsMe = match.p2.alias === authStore.getUsername();

            const leftId = p1IsMe
              ? loggedInUserId
              : match.p1.userId || `anon:${match.p1.alias}`;
            const rightId = p2IsMe
              ? loggedInUserId
              : match.p2.userId || `anon:${match.p2.alias}`;

            console.log(
              `[LocalGamePage] Saving match: ${match.p1.alias}(${leftId}) vs ${match.p2.alias}(${rightId})`
            );

            await saveGameResult({
              leftUserId: leftId,
              rightUserId: rightId,
              leftAlias: match.p1.alias,
              rightAlias: match.p2.alias,
              leftScore: match.p1.score ?? 0,
              rightScore: match.p2.score ?? 0,
              winner: match.winner === 1 ? 'left' : 'right',
            });
            console.log(`Saved match: ${match.p1.alias} vs ${match.p2.alias}`);
          } catch (err) {
            console.error('Failed to save match result:', err);
          }
        }
      }
    }
  }

  private updateStatus(status: string) {
    this.el.querySelector('#game-status')!.textContent =
      `Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`;
  }
}
