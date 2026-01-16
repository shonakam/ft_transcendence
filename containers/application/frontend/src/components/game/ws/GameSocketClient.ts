import { io, Socket } from 'socket.io-client';

export class GameSocketClient {
  private readonly baseUrl = 'https://transcendence.42.fr';
  private readonly options = {
    path: '/ws',
    transports: ['websocket', 'polling'],
  };
  private socket: Socket;

  constructor() {
    this.socket = io(this.baseUrl + '/game/remote', this.options);
    this.initSocket();
  }

  initSocket(): void {
    this.socket.on('connected', () => {
      console.log('Connected to game server via WebSocket');
    });

    this.socket.on('demoResponse', (message: { message: string }) => {
      console.log('Demo message from server:', message.message);
    });
  }

  sendDemoRequest(): void {
    this.socket.emit('demo');
  }

  getSocket(): Socket {
    return this.socket;
  }
}
