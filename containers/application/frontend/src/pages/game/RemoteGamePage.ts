// import { GamePage } from './GamePage';
import { Component } from '../../interface/Component';

import { GameCanvas } from '../../components/game/canvas/GameCanvas';
import { RemoteInputHandler } from '../../components/game/inputHandler/ReoteInputHandler';
import { RemoteGame } from '../../components/game/RemoteGame';
import gameTemplate from './game.html?raw';

import CONFIG from '@shonakam/common/game/GameConfig';
import { GameSocket } from '../../components/game/ws/GameSocket';

export class RemoteGamePage implements Component {
  // private rootElement: HTMLElement = document.getElementById(
  // 'app-root'
  // ) as HTMLElement;
  el: HTMLElement = document.createElement('main');
  gameCanvas: GameCanvas;
  inputHandler = new RemoteInputHandler();
  pongGame: RemoteGame;
  socket: GameSocket = new GameSocket();

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
    this.socket.connect({
      onGameState: (state) => this.pongGame.updateState(state),
      onLog: (message) => this.showLog(message),
    });
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

  private showLog(message: string) {
    const logEl = this.el.querySelector('#game-log');
    if (logEl) {
      const entry = document.createElement('p');
      entry.textContent = message;
      logEl.appendChild(entry);
      logEl.scrollTop = logEl.scrollHeight;
    }
  }
}
