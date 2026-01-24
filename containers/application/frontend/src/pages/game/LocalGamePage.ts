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

export class LocalGamePage implements Component {
  private el: HTMLElement = document.createElement('main');
  private gameCanvas: GameCanvas;
  private inputHandler = new LocalInputHandler();
  private pongGame: LocalGame;
  private tournament: TournamentRender;

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

    // トーナメントを表示（フォームから開始）
    this.el
      .querySelector('.tournament-section')!
      .appendChild(this.tournament.getElement());
  }

  private onTournamentStart(): void {
    this.isTournamentMode = true;
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
      if (
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

    // 勝利メッセージを表示
    this.el.querySelector('.game-canvas')!.innerHTML += `
      <div class="winning-message absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-75 p-4 rounded shadow-lg">
        <h2 class="text-5xl font-bold mb-2">${winnerName} Wins!</h2>
        <p class="text-xl">Final Score: ${left} : ${right}</p>
        ${this.isTournamentMode ? '<p class="text-sm text-gray-600 mt-2">Next match starting soon...</p>' : ''}
      </div>
    `;

    // トーナメントモードの場合、結果を記録して次の試合へ
    if (this.isTournamentMode && this.currentMatch) {
      // 結果を記録
      this.tournament.recordMatchResult(left, right);
      this.currentMatch = null;

      // トーナメント終了チェック
      if (this.tournament.isFinished()) {
        setTimeout(() => this.showTournamentResult(), 2000);
      }
      // 次の試合はコールバックで自動的に通知される
    }
  }

  private async showTournamentResult(): Promise<void> {
    const winner = this.tournament.getWinner();
    const results = this.tournament.getCompletedResults();

    // 勝利メッセージを更新
    const winningMessage = this.el.querySelector('.winning-message');
    if (winningMessage) {
      winningMessage.innerHTML = `
        <h2 class="text-5xl font-bold mb-4">🏆 Tournament Champion 🏆</h2>
        <p class="text-3xl font-bold text-blue-600">${winner?.alias ?? 'Unknown'}</p>
        <p class="text-sm text-gray-600 mt-4">Total matches played: ${results.length}</p>
      `;
    }

    // ログインユーザーが参加している試合のみバックエンドに保存
    if (authStore.isLoggedIn()) {
      const loggedInUserId = authStore.getUsername();
      if (loggedInUserId) {
        // ログインユーザーが参加した試合を抽出
        const userMatches = results.filter(
          (match) =>
            match.p1.userId === loggedInUserId ||
            match.p2.userId === loggedInUserId
        );

        // 各試合を保存
        for (const match of userMatches) {
          try {
            await saveGameResult({
              leftUserId: match.p1.userId || `anon:${match.p1.alias}`,
              rightUserId: match.p2.userId || `anon:${match.p2.alias}`,
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
