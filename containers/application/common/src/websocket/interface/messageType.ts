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
  | { type: 'gameGenerated'; payload: { gameId: number; state: GameState } }
  | { type: 'playerAdded'; payload: { gameId: number; side: 'left' | 'right' } }
  | { type: 'opponentJoined'; payload: { gameId: number; opponentId: string } }
  | {
      type: 'gameReady';
      payload: {
        gameId: number;
        leftPlayer: string;
        rightPlayer: string;
        yourSide: 'left' | 'right';
      };
    }
  | { type: 'gameStart'; payload: { gameId: number } }
  | { type: 'gameState'; payload: GameState }
  | { type: 'playerLeft'; payload: { gameId: number; playerId: string } }
  | { type: 'gameLeft'; payload: { gameId: number } }
  | { type: 'error'; payload: { message: string } }
  | { type: 'demoResponse'; payload: { message: string } };
