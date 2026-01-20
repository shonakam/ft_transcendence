export class ChatWebSocketManager {
  private static instance: ChatWebSocketManager;
  private connections: Map<string, Set<any>> = new Map();

  private constructor() {}

  public static getInstance(): ChatWebSocketManager {
    if (!ChatWebSocketManager.instance) {
      ChatWebSocketManager.instance = new ChatWebSocketManager();
    }
    return ChatWebSocketManager.instance;
  }

  /**
   * ユーザのWebSocket接続を登録する
   */
  public addConnection(userId: string, socket: WebSocket): void {
    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set());
    }
    this.connections.get(userId)!.add(socket);
  }

  /**
   * ユーザのWebSocket接続を解除する
   */
  public removeConnection(userId: string, socket: WebSocket): void {
    const userSockets = this.connections.get(userId);
    if (userSockets) {
      userSockets.delete(socket);
      if (userSockets.size === 0) {
        this.connections.delete(userId);
      }
    }
  }

  /**
   * 指定したユーザにメッセージを送信する
   */
  public sendToUser(userId: string, message: any): void {
    const userSockets = this.connections.get(userId);
    if (userSockets) {
      const payload = JSON.stringify(message);
      for (const socket of userSockets) {
        if (socket.readyState === 1) { // WebSocket.OPEN
          socket.send(payload);
        }
      }
    }
  }

  /**
   * 全ての接続済みユーザにメッセージを送信する (Global Room用)
   */
  public broadcast(message: any): void {
    const payload = JSON.stringify(message);
    for (const [userId, userSockets] of this.connections) {
      for (const socket of userSockets) {
        if (socket.readyState === 1) { // WebSocket.OPEN
          socket.send(payload);
        }
      }
    }
  }
}

export const chatWebSocketManager = ChatWebSocketManager.getInstance();
