import { GameState } from './GameState';
import { InputHandler } from './interface/Input';
import { Ball } from './Ball';
import { Paddle } from './Paddle';
import { Direction } from './types/direction';
import { GameSide } from './types/gameSide';
export declare class PhysicsEngine {
    static update(dt: number, state: GameState, inputHandler: InputHandler): void;
    static updatePaddles(dt: number, state: GameState, inputHandler: InputHandler): void;
    static updatePaddle(dt: number, paddle: Paddle, canvasHeight: number, direction: Direction): void;
    static updateBall(dt: number, ball: Ball): void;
    static checkCollisions(state: GameState): void;
    static checkHorizontalWallCollision(ball: Ball, canvasHeight: number): void;
    static checkPaddleCollision(ball: Ball, paddle: Paddle, side: GameSide): void;
}
//# sourceMappingURL=PhysicsEngine.d.ts.map