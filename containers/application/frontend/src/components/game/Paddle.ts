import { Vector2 } from "../../interface/Vector2.ts";

import CONFIG from "./GameConfig.js";

export interface Paddle {
	position: Vector2;
	thickness: number;
	length: number;
	speed: number;
}

export class Paddle implements Paddle {
	constructor(side: "left" | "right"){
    const y = (CONFIG.CANVAS_HEIGHT - 100) / 2;
		if (side === "left") {
			this.position = {
				x: CONFIG.PADDLE_OFFSET,
				y: y
			};
		} else {
			this.position = {
				x: CONFIG.CANVAS_WIDTH - CONFIG.PADDLE_THICKNESS - CONFIG.PADDLE_OFFSET,
				y: y
			};
		}
		this.thickness = CONFIG.PADDLE_THICKNESS;
		this.length = CONFIG.PADDLE_LENGTH;
		this.speed = CONFIG.PADDLE_SPEED;
	}
}
