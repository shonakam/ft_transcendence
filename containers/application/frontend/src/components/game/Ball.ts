import { Vector2 } from '../../interface/Vector2.js';

import CONFIG from './GameConfig.js';

export class Ball {
  position: Vector2;
  velocity: Vector2;
  radius: number;

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
    let randomAngle: number;
    do {
      randomAngle = Math.random() * 2 * Math.PI;
    } while (
      Math.abs(Math.cos(randomAngle)) < 0.1 ||
      Math.abs(Math.sin(randomAngle)) < 0.1
    );

    this.velocity = {
      x: CONFIG.BALL_SPEED * Math.cos(randomAngle),
      y: CONFIG.BALL_SPEED * Math.sin(randomAngle),
    };
  }
}
