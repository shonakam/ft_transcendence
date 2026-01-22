import type { Vector2 } from './types/vector2';
import type { GameSide } from './types/gameSide';
export declare class Paddle {
    position: Vector2;
    thickness: number;
    length: number;
    speed: number;
    constructor(side: GameSide);
    jsonify(): {
        position: Vector2;
    };
}
//# sourceMappingURL=Paddle.d.ts.map