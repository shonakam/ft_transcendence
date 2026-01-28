import { Vector2 } from './types/vector2.ts';

import CONFIG from './GameConfig.ts';

export class Ball {
  position: Vector2;
  velocity: Vector2;
  radius: number;
  speedMultiplier: number = 1;

  constructor() {
    this.position = { x: CONFIG.CANVAS_WIDTH / 2, y: CONFIG.CANVAS_HEIGHT / 2 };
    this.velocity = { x: 0, y: 0 };
    this.radius = CONFIG.BALL_RADIUS;
    this.reset();
  }

  setSpeedMultiplier(multiplier: number): void {
    this.speedMultiplier = multiplier;
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

    const speed = CONFIG.BALL_SPEED * this.speedMultiplier;
    this.velocity = {
      x: speed * Math.cos(randomAngle),
      y: speed * Math.sin(randomAngle),
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
