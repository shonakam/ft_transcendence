import { Component } from '../../interface/Component';

import { GameCanvas } from '@shonakam/common/game/GameCanvas';
import { PongGame } from '@shonakam/common/game/PongGame';

import CONFIG from '@shonakam/common/game/GameConfig';

import gameTemplate from './game.html?raw';

export class GamePage implements Component {
  private rootElement: HTMLElement;
  private el: HTMLElement;
  private gameCanvas: GameCanvas;
  private pongGame: PongGame;

  constructor() {
    this.rootElement = document.getElementById('app-root') as HTMLElement;
    this.el = document.createElement('main');

    this.el.innerHTML = gameTemplate;

    this.gameCanvas = new GameCanvas(
      this.el.querySelector('.canvas-stack') as HTMLElement,
      CONFIG.CANVAS_WIDTH,
      CONFIG.CANVAS_HEIGHT
    );

    this.pongGame = new PongGame(this.gameCanvas);
    this.pongGame.initRenderer();
    this.addSpaceEventListener();
    this.pongGame.state.onScoreChange = this.updateScore.bind(this);
    this.pongGame.state.onStatusChange = this.updateStatus.bind(this);
    this.pongGame.state.playerSide = 'both';
  }

  public destroy(): void {
    this.pongGame.destroy();
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
