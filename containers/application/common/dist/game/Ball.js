import CONFIG from './GameConfig';
export class Ball {
    position;
    velocity;
    radius;
    constructor() {
        this.position = { x: CONFIG.CANVAS_WIDTH / 2, y: CONFIG.CANVAS_HEIGHT / 2 };
        this.velocity = { x: 0, y: 0 };
        this.radius = CONFIG.BALL_RADIUS;
        this.reset();
    }
    reset() {
        this.position = {
            x: CONFIG.CANVAS_WIDTH / 2,
            y: CONFIG.CANVAS_HEIGHT / 2,
        };
        // avoiding multiples of π/2 so cos and sin are never zero
        let randomAngle;
        do {
            randomAngle = Math.random() * 2 * Math.PI;
        } while (Math.abs(Math.cos(randomAngle)) < 0.1 ||
            Math.abs(Math.sin(randomAngle)) < 0.1);
        this.velocity = {
            x: CONFIG.BALL_SPEED * Math.cos(randomAngle),
            y: CONFIG.BALL_SPEED * Math.sin(randomAngle),
        };
    }
    jsonify() {
        return {
            position: this.position,
            velocity: this.velocity,
            radius: this.radius,
        };
    }
}
