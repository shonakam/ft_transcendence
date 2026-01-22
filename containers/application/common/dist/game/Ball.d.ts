import { Vector2 } from './types/vector2';
export declare class Ball {
    position: Vector2;
    velocity: Vector2;
    radius: number;
    constructor();
    reset(): void;
    jsonify(): {
        position: Vector2;
        velocity: Vector2;
        radius: number;
    };
}
//# sourceMappingURL=Ball.d.ts.map