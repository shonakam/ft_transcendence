import { Component } from '../interface/Component.js';
import { AuthModal } from '../components/organisms/user/AuthModal.js';

import { PongGame } from '../components/game/PongGame.js';
import { GameCanvas } from '../components/game/GameCanvas.ts';
import { GameState } from '../components/game/GameState.js';
import CONFIG from '../components/game/GameConfig.js';

// import { canvas } from '../components/game/pong.js';

export class GamePage implements Component {
  private rootElement: HTMLElement;
  private authModal: AuthModal;
  private gameCanvas: GameCanvas;
  private pongGame: PongGame;

  constructor() {
    this.rootElement = document.createElement('section');
    this.authModal = new AuthModal();

    this.render();

    this.gameCanvas = new GameCanvas(
      this.rootElement.querySelector('.canvas-stack') as HTMLElement
      , CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    this.pongGame = new PongGame(this.gameCanvas);
    this.rootElement.appendChild(this.authModal.getElement());
    this.pongGame.initRenderer();
    this.pongGame.start();
  }

  private render(): void {
    this.rootElement.innerHTML = `
    <div class="text-center pt-16">
      <h1 class="text-4xl font-bold mb-4">Solo Game Page</h1>
      <p class="text-lg text-gray-700">This is the solo game page.</p>
    </div>
    <div class="game-canvas flex justify-center mt-8">
      <div class="canvas-stack" style="position:relative; width:800px; height:600px;"></div>
    </div>
  `;
  }

  public getElement(): HTMLElement {
    return this.rootElement;
  }
}
