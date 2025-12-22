import { Vector2 } from "../../interface/Vector2.ts";

import CONFIG from "./GameConfig.js";

export interface Ball {
	position: Vector2;
	velocity: Vector2;
	radius: number;
}

export class Ball implements Ball {
	constructor() {
		this.reset();
		this.radius = CONFIG.BALL_RADIUS;
	}

	reset() {
		this.position = { x: CONFIG.CANVAS_WIDTH / 2, y: CONFIG.CANVAS_HEIGHT / 2 };

		// avoiding multiples of π/2 so cos and sin are never zero
		let randomAngle: number;
		do {
			randomAngle = Math.random() * 2 * Math.PI;
		} while (
			Math.abs(Math.cos(randomAngle)) < 0.01 ||
			Math.abs(Math.sin(randomAngle)) < 0.01
		);

		this.velocity = {
			x: CONFIG.BALL_SPEED * Math.cos(randomAngle),
			y: CONFIG.BALL_SPEED * Math.sin(randomAngle),
		};
	}
}
