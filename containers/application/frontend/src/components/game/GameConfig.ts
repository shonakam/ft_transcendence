/**
 * GameConfig.ts
 */

const GAME_CONFIG = {
  // Canvas dimensions
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 400,

  // Paddle properties
  PADDLE_THICKNESS: 10,
  PADDLE_LENGTH: 100,
  PADDLE_OFFSET: 30,
  PADDLE_SPEED: 600,

  PADDLE_COLLISION_OFFSET: 10,

  // Ball properties
  BALL_RADIUS: 5,
  BALL_SPEED: 500,

  // Game properties
  CENTER_LINE_DASH: [5, 15],
  BALL_RESTART_DELAY: 1000,
  BALL_VERTICAL_FACTOR: 0.6,
  BOUNCE_FACTOR: 6,
  WINNING_SCORE: 10, // Game ends when a player reaches this score

} as const;

export default GAME_CONFIG;
