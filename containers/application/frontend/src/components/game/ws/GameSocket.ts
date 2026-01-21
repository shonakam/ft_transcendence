import { io, Socket } from 'socket.io-client';
import type { GameSide, GameState } from '@shonakam/common/index';
import type { PlayerInput } from '@shonakam/common/index';

export class GameSocket {
  private readonly baseUrl = 'https://transcendence.42.fr';
  private readonly options = {
    path: '/ws',
    transports: ['websocket', 'polling'],
  };
  private socket: Socket;

  constructor() {
    this.socket = io(this.baseUrl + '/game/remote', this.options);
    this.registerResponses();
  }

  registerResponses(): void {
    this.socket.on('connected', () => {
      console.log('Connected to game server via WebSocket');
    });
    this.socket.on('disconnect', () => {
      console.log('Disconnected from game server');
      // TODO: disconnect handling logic
    });
    this.socket.on('gameState', (state: GameState) => {
      console.log('Received game state from server:', state);
      // TODO: update remote game state
    });
    // demo
    this.socket.on('demoResponse', (message: { message: string }) => {
      console.log('Demo message from server:', message.message);
    });
  }

  getSocket(): Socket {
    return this.socket;
  }

  sendRegister(userId: string): void {
    this.socket.emit('register', { userId });
  }

  sendCreateGame(): void {
    this.socket.emit('createGame');
  }

  sendDemoRequest(): void {
    this.socket.emit('demo');
  }

  sendInput(side: GameSide, input: PlayerInput): void {
    this.socket.emit('playerInput', {side, input}
    );
  }
}
