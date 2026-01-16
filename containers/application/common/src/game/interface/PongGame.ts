export interface PongGame {
  initRender?(): void;
  loop(currentTime: number): void;
  start(): void;
  stop(): void;
}
