import { PlayerInput } from '../../game/interface/Input.ts';
import { GameState } from '../../game/GameState.ts';

// client -> server
export type ClientMessage =
  | { type: 'register'; payload: { userId: string } }
  | { type: 'createGame' }
  | { type: 'join'; payload: { gameId: number } }
  | { type: 'playerInput'; payload: { input: PlayerInput } }
  | { type: 'leave' }
  | { type: 'demo' };

// server -> client
export type ServerMessage =
  | { type: 'connected'; payload: { message: string } }
  | { type: 'disconnected'; payload: { message: string } }
  | { type: 'registered'; payload: { userId: string } }
  | { type: 'unregistered'; payload: { userId: string | null } }
  | { type: 'gameGenerated'; payload: GameState }
  | { type: 'playerAdded'; payload: { gameId: number } }
  | { type: 'gameReady' }
  | { type: 'gameStart' }
  | { type: 'gameState'; payload: GameState }
  | { type: 'error'; payload: { message: string } }
  | { type: 'demoResponse'; payload: { message: string } };
