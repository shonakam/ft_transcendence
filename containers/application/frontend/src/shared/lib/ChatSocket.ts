export class ChatSocket {
  private socket: WebSocket | null = null;
  private onMessageCallbacks: ((message: any) => void)[] = [];

  constructor(private url: string) {}

  connect(token: string) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}${this.url}`;
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      this.socket?.send(JSON.stringify({ type: 'auth', token }));
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.onMessageCallbacks.forEach((cb) => cb(data));
    };

    this.socket.onclose = () => {
      console.log('Chat Socket closed');
    };
  }

  sendMessage(roomId: string, content: string, recipientId?: string) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'message',
        roomId,
        recipientId,
        content,
        messageType: 'text'
      }));
    }
  }

  onMessage(callback: (message: any) => void) {
    this.onMessageCallbacks.push(callback);
  }

  disconnect() {
    this.socket?.close();
  }
}
