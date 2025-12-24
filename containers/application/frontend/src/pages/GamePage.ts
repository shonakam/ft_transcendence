import { Component } from '../interface/Component.js';
import { AuthModal } from '../components/organisms/user/AuthModal.js';

import { GameCanvas } from '../components/game/GameCanvas.js';
import { PongGame } from '../components/game/PongGame.js';

import CONFIG from '../components/game/GameConfig.js';

export interface GamePage extends Component {
  rootElement: HTMLElement;
  authModal: AuthModal;
  gameCanvas: GameCanvas;
  pongGame: PongGame;

  render(): void;
  addSpaceEventListener(): void;
}

export class GamePage implements GamePage{
  rootElement: HTMLElement;
  authModal: AuthModal;
  gameCanvas: GameCanvas;
  pongGame: PongGame;

  constructor() {
    this.rootElement = document.createElement('section');
    this.authModal = new AuthModal();

    this.render();
    this.gameCanvas = new GameCanvas(
      this.rootElement.querySelector('.canvas-stack') as HTMLElement
      , CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    this.pongGame = new PongGame(this.gameCanvas);
    this.pongGame.initRenderer();
    this.addSpaceEventListener();
    this.pongGame.state.onScoreChange = this.updateScore.bind(this);
    this.pongGame.state.onStatusChange = this.updateStatus.bind(this);
    this.pongGame.state.playerSide = "both";

    this.rootElement.appendChild(this.authModal.getElement());
  }

  getElement(): HTMLElement {
    return this.rootElement;
  }

  render(): void {
    this.rootElement.innerHTML = `
    <div class="text-center pt-16">
      <div class="mb-6"> </div>
      <h1 class="text-4xl font-bold mb-4">Solo Game Page</h1>
      <p class="text-lg text-gray-700">This is the solo game page.</p>
    </div>
    <div class="scoreboard text-center mt-4">
      <span id="score-left">0</span> : <span id="score-right">0</span><br>
      <span id="winning-score" class="ml-4 text-gray-600">(First to ${CONFIG.WINNING_SCORE} wins)</span><br>
      <span id="game-status" class="ml-4 text-gray-600">Status: Ready</span>
    </div>
    <div class="game-canvas flex justify-center mt-8">
      <div class="canvas-stack" style="position:relative; width:800px; height:400px;"></div>
    </div>
    <div class="text-center mt-8">
      <p class="text-gray-600">Left Player: <b>'W' / 'S'</b>, Right Player: <b>'Up Arrow' / 'Down Arrow'</b> to move the paddles up and down.</p>
      <p class="text-gray-600">Press <b>'Space'</b> to start/pause/resume the game.</p>
    </div>
  `;
  }

  addSpaceEventListener(): void {
    window.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        if (this.pongGame.state.status === 'ready' ||
          this.pongGame.state.status === 'paused') {
          this.pongGame.start();
        } else if (this.pongGame.state.status === 'playing') {
          this.pongGame.state.setStatus('paused');
        }
      }
    });
  }

  updateScore(left: number, right: number) {
    document.getElementById('score-left')!.textContent = left.toString();
    document.getElementById('score-right')!.textContent = right.toString();
    if (left < CONFIG.WINNING_SCORE && right < CONFIG.WINNING_SCORE)
      return;
    const winner = left >= CONFIG.WINNING_SCORE ? 'Left Player' : 'Right Player';
    // add winning message
    document.querySelector('.game-canvas')!.innerHTML += `
      <div class="winning-message absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-75 p-4 rounded shadow-lg">
        <h2 class="text-5xl font-bold mb-2">${winner} Wins!</h2>
        <p class="text-xl">Final Score: ${left} : ${right}</p>
      </div>
    `;
  }

  updateStatus(status: string) {
    document.getElementById('game-status')!.textContent = `Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`;
  }
}
