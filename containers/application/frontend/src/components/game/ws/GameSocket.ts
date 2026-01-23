import type {
  GameState,
  PlayerInput,
  ClientMessage,
  ServerMessage,
} from '@shonakam/common';

type GameSocketCallbacks = {
  onGameState: (state: GameState) => void;
  onLog?: (message: string) => void;
};

export class GameSocket {
  baseUrl: string = 'wss://transcendence.42.fr';
  path: string = '/ws/game/remote';
  url: string = this.baseUrl + this.path;
  private socket: WebSocket | null = null;
  private callbacks: GameSocketCallbacks | null = null;
  private isConnecting = false;

  connect(callbacks: GameSocketCallbacks): void {
    if (this.socket || this.isConnecting) return;
    this.callbacks = callbacks;
    this.isConnecting = true;
    try {
      this.socket = new WebSocket(this.url);
      this.registerEventListeners();
    } catch {
      this.isConnecting = false;
    }
  }

  private log(message: string): void {
    this.callbacks?.onLog?.(message);
  }

  private registerEventListeners(): void {
    if (!this.socket) return;

    this.socket.addEventListener('open', () => {
      this.isConnecting = false;
      this.log('Connected to game server');
    });

    this.socket.addEventListener('close', () => {
      this.isConnecting = false;
      this.log('Disconnected from game server');
    });

    this.socket.addEventListener('error', () => {
      this.isConnecting = false;
    });

    this.socket.addEventListener('message', (event) => {
      try {
        const message: ServerMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch {
        // パースエラーは無視
      }
    });
  }

  private handleMessage(message: ServerMessage): void {
    switch (message.type) {
      case 'connected':
        break;
      case 'disconnected':
        break;
      case 'registered':
        this.log(`Registered as user: ${message.payload.userId}`);
        break;
      case 'unregistered':
        break;
      case 'gameGenerated':
        this.callbacks?.onGameState(message.payload);
        break;
      case 'playerAdded':
        break;
      case 'gameReady':
        this.log('Game is ready');
        break;
      case 'gameStart':
        this.log('Game started');
        break;
      case 'gameState':
        this.callbacks?.onGameState(message.payload);
        break;
      case 'error':
        this.log(`Error: ${message.payload.message}`);
        break;
      case 'demoResponse':
        break;
      default:
        break;
    }
  }

  private send(message: ClientMessage): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  // --- 公開メソッド ---

  getSocket(): WebSocket | null {
    return this.socket;
  }

  sendRegister(userId: string): void {
    this.send({ type: 'register', payload: { userId } });
  }

  sendCreateGame(): void {
    this.send({ type: 'createGame' });
  }

  sendJoinGame(gameId: number): void {
    this.send({ type: 'join', payload: { gameId } });
  }

  sendInput(input: PlayerInput): void {
    this.send({ type: 'playerInput', payload: { input } });
  }

  sendLeaveGame(): void {
    this.send({ type: 'leave' });
  }

  sendDemoRequest(): void {
    this.send({ type: 'demo' });
  }

  close(): void {
    this.socket?.close();
  }
}
