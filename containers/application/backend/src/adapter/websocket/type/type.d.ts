import { GameState } from '@shonakam/common/game/GameState.ts';

// client → server
type ClientMessage =
  | { type: 'JOIN'; roomId: string }
  | { type: 'MOVE'; y: number };

// server → client
type ServerMessage =
  | { type: 'STATE'; state: GameState }
  | { type: 'SCORE'; left: number; right: number };
