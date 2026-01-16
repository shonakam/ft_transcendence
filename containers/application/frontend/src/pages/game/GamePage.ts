import { Component } from '../../interface/Component';

import { GameCanvas } from '../../components/game/canvas/GameCanvas';
import { LocalInputHandler } from '../../components/game/inputHandler/LocalInputHandler';
import { LocalPongGame } from '../../components/game/LocalPongGame';

import CONFIG from '@shonakam/common/game/GameConfig';
import gameTemplate from './game.html?raw';

export class GamePage implements Component {
  private rootElement: HTMLElement = document.getElementById(
    'app-root'
  ) as HTMLElement;
  private el: HTMLElement = document.createElement('main');
  private gameCanvas: GameCanvas;
  private inputHandler = new LocalInputHandler();
  private pongGame: LocalPongGame;

  constructor() {
    this.el.innerHTML = gameTemplate;
    this.gameCanvas = new GameCanvas(
      this.el.querySelector('.canvas-stack') as HTMLElement,
      CONFIG.CANVAS_WIDTH,
      CONFIG.CANVAS_HEIGHT
    );

    this.pongGame = new LocalPongGame(this.gameCanvas, this.inputHandler);
    this.pongGame.initRender();
    this.addSpaceEventListener();
    this.pongGame.state.onScoreChange = this.updateScore.bind(this);
    this.pongGame.state.onStatusChange = this.updateStatus.bind(this);
    this.pongGame.state.playerSide = 'both';
  }

  public destroy(): void {
    // this.pongGame.destroy();
    this.el.remove();
  }

  public getElement(): HTMLElement {
    return this.el;
  }

  private addSpaceEventListener(): void {
    window.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        if (
          this.pongGame.state.status === 'ready' ||
          this.pongGame.state.status === 'paused'
        ) {
          this.pongGame.start();
        } else if (this.pongGame.state.status === 'playing') {
          this.pongGame.state.setStatus('paused');
        }
      }
    });
  }

  private updateScore(left: number, right: number) {
    document.getElementById('score-left')!.textContent = left.toString();
    document.getElementById('score-right')!.textContent = right.toString();
    if (left < CONFIG.WINNING_SCORE && right < CONFIG.WINNING_SCORE) return;
    const winner =
      left >= CONFIG.WINNING_SCORE ? 'Left Player' : 'Right Player';
    // add winning message
    document.querySelector('.game-canvas')!.innerHTML += `
      <div class="winning-message absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-75 p-4 rounded shadow-lg">
        <h2 class="text-5xl font-bold mb-2">${winner} Wins!</h2>
        <p class="text-xl">Final Score: ${left} : ${right}</p>
      </div>
    `;
  }

  private updateStatus(status: string) {
    document.getElementById('game-status')!.textContent =
      `Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`;
  }
}
