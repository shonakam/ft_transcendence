// import { Component } from '../../interface/Component';

// import { GameCanvas } from '../../components/game/canvas/GameCanvas';
// import { InputHandler } from '@shonakam/common/index';
// import { PongGame } from '@shonakam/common/game/interface/PongGame';

// import CONFIG from '@shonakam/common/game/GameConfig';
// import gameTemplate from './game.html?raw';

// export abstract class GamePage implements Component {
//   private rootElement: HTMLElement = document.getElementById(
//     'app-root'
//   ) as HTMLElement;
//   private el: HTMLElement = document.createElement('main');
//   private gameCanvas: GameCanvas;
//   protected inputHandler: InputHandler = new InputHandler();
//   protected pongGame: PongGame;

//   constructor() {
//     this.el.innerHTML = gameTemplate;
//     this.gameCanvas = new GameCanvas(
//       this.el.querySelector('.canvas-stack') as HTMLElement,
//       CONFIG.CANVAS_WIDTH,
//       CONFIG.CANVAS_HEIGHT
//     );

//     this.pongGame = this.initPongGame(this.gameCanvas, this.inputHandler);
//     this.pongGame.initRender();
//     this.addSpaceEventListener();
//     this.pongGame.state.onScoreChange = this.updateScore.bind(this);
//     this.pongGame.state.onStatusChange = this.updateStatus.bind(this);
//     this.pongGame.state.playerSide = 'both';
//   }

//   protected abstract initPongGame(
//     gameCanvas: GameCanvas,
//     inputHandler: InputHandler
//   ): PongGame;

//   destroy(): void {
//     // this.pongGame.destroy();
//     this.el.remove();
//   }

//   getElement(): HTMLElement {
//     return this.el;
//   }

//   protected abstract addSpaceEventListener(): void;

//   protected abstract updateScore(left: number, right: number): void;

//   protected abstract updateStatus(status: string): void;
// }
