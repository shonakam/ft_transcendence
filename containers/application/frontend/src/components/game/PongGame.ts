import { GameCanvas} from './GameCanvas.js';
import IGameState, { GameState } from './GameState.js';

interface Score {
  player1: number;
  player2: number;
}

export class PongGame {
  private gameCanvas: GameCanvas;
  private gameState: GameState;

  constructor(gameCanvas: GameCanvas, gameState: GameState) {
    this.gameCanvas = gameCanvas;
    this.gameState = gameState;
  }

  private initGame(): void {

  }

  public start(): void {
    this.initGame();
  }
}
