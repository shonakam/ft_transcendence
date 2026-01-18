import { ChatMessage } from '../../types/chat';

export type WsMessageType = 'NEW_MESSAGE';

export interface WsResponse {
  type: WsMessageType;
  data: any;
}

export class ChatWebsocketService {
  private socket: WebSocket | null = null;
  private listeners: Set<(msg: WsResponse) => void> = new Set();
  private isConnected = false;

  public connect() {
    if (this.socket) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Use the same host as the current page, but port 8080 for backend in dev/docker setup
    // In this specific setup, the frontend might be on a different port than backend.
    // Based on the nginx config or typical docker usage, let's assume it's relative or handled by proxy.
    // Given the API calls use BASE_URL, we should probably derive WS URL from it.
    
    // For now, let's try a default which often works in this env:
    const wsUrl = `${protocol}//${window.location.host}/ws/chat`;
    
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('ChatWebsocketService: Connected');
      this.isConnected = true;
    };

    this.socket.onmessage = (event) => {
      try {
        const response: WsResponse = JSON.parse(event.data);
        this.listeners.forEach((listener) => listener(response));
      } catch (error) {
        console.error('ChatWebsocketService: Failed to parse WS message', error);
      }
    };

    this.socket.onclose = () => {
      console.log('ChatWebsocketService: Disconnected');
      this.socket = null;
      this.isConnected = false;
      // Reconnect after 3 seconds
      setTimeout(() => this.connect(), 3000);
    };

    this.socket.onerror = (error) => {
      console.error('ChatWebsocketService: WebSocket error', error);
    };
  }

  public subscribe(listener: (msg: WsResponse) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export const chatWebsocketService = new ChatWebsocketService();
