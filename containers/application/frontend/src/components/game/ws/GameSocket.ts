import { io, Socket } from 'socket.io-client';
import type { GameState } from '@shonakam/common';
import type { PlayerInput } from '@shonakam/common';

type GameSocketHandlers = {
  onConnected?: () => void;
  onDisconnected?: () => void;
  onRegistered?: (gameId: number) => void;
  onUnregistered?: (userId: string | null) => void;
  onGameGenerated?: (state: GameState) => void;
  onPlayerAdded?: (gameId: number) => void;
  onGameReady?: () => void;
  onGameStart?: () => void;
  onGameState?: (state: GameState) => void;
  onError?: (message: string) => void;
};

export class GameSocket {
  private readonly baseUrl = 'https://transcendence.42.fr';
  private readonly options = {
    path: '/ws/',
    transports: ['websocket', 'polling'],
    withCredentials: true,
  };
  private socket: Socket;
  private handlers: GameSocketHandlers = {};

  constructor() {
    const url = this.baseUrl + '/ws/game/remote';
    this.socket = io(url, this.options);
    if (this.socket == null) {
      console.error('Failed to initialize WebSocket connection');
      throw new Error('Failed to initialize WebSocket connection');
    }
    this.registerResponses();
    console.log(`GameSocket initialized and attempting connection to ${url}`);
  }

  setHandlers(handlers: GameSocketHandlers): void {
    this.handlers = handlers;
  }

  registerResponses(): void {
    this.socket.on('connected', () => {
      console.log('Connected to game server via WebSocket');
      if (this.handlers.onConnected) {
        this.handlers.onConnected();
      }
    });
    this.socket.on('disconnect', () => {
      console.log('Disconnected from game server');
      if (this.handlers.onDisconnected) {
        this.handlers.onDisconnected();
      }
    });
    this.socket.on('disconnected', () => {
      console.log('Server confirmed disconnection');
      // TODO: disconnection handling logic
    });

    this.socket.on('registered', (data: { gameId: number }) => {
      // TODO: handle registration logic
      console.log('Registered to game server with game ID:', data.gameId);
    });
    this.socket.on('unregistered', (data: { userId: string | null }) => {
      // TODO: handle unregistration logic
      console.log('Unregistered from game server for user ID:', data.userId);
    });

    this.socket.on('gameGenerated', (state: GameState) => {
      // TODO: handle game generation logic
      console.log('Game generated with initial state:', state);
    });
    this.socket.on('playerAdded', (data: { gameId: number }) => {
      // TODO: handle player added logic
      console.log('Player added to game with ID:', data.gameId);
    });
    this.socket.on('gameReady', () => {
      console.log('Game is ready to start');
    });
    this.socket.on('gameStart', () => {
      console.log('Game has started');
    });
    this.socket.on('gameState', (state: GameState) => {
      console.log('Received game state from server:', state);
    });

    this.socket.on('error', (message: string) => {
      console.error('WebSocket error from server:', message);
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

  sendJoinGame(gameId: number): void {
    this.socket.emit('join', { gameId });
  }

  sendInput(input: PlayerInput): void {
    this.socket.emit('playerInput', { input });
  }

  sendLeaveGame(): void {
    this.socket.emit('leave');
  }

  sendDemoRequest(): void {
    this.socket.emit('demo');
  }
}
