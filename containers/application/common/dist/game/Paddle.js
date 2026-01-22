import CONFIG from './GameConfig';
export class Paddle {
    position;
    thickness;
    length;
    speed;
    constructor(side) {
        const y = (CONFIG.CANVAS_HEIGHT - 100) / 2;
        if (side === 'left') {
            this.position = {
                x: CONFIG.PADDLE_OFFSET,
                y: y,
            };
        }
        else {
            this.position = {
                x: CONFIG.CANVAS_WIDTH - CONFIG.PADDLE_THICKNESS - CONFIG.PADDLE_OFFSET,
                y: y,
            };
        }
        this.thickness = CONFIG.PADDLE_THICKNESS;
        this.length = CONFIG.PADDLE_LENGTH;
        this.speed = CONFIG.PADDLE_SPEED;
    }
    jsonify() {
        return {
            position: this.position,
        };
    }
}
