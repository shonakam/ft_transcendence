import type { WebSocket } from 'ws';

export class GameSocketRegistry {
  // User and socket mappings
  socketToUserId = new Map<WebSocket, string>();
  userIdToSocket = new Map<string, WebSocket>();

  constructor() {}

  // User socket management
  addUserSocket(userId: string, socket: WebSocket): boolean {
    if (this.userIdToSocket.has(userId) || this.socketToUserId.has(socket)) {
      console.error(`GameSessionRegistry: User ${userId} already registered`);
      return false;
    }
    this.userIdToSocket.set(userId, socket);
    this.socketToUserId.set(socket, userId);
    return true;
  }

  getUserSocket(userId: string): WebSocket | null {
    return this.userIdToSocket.get(userId) || null;
  }

  getUserIdBySocket(socket: WebSocket): string | null {
    return this.socketToUserId.get(socket) || null;
  }

  deleteSocketByUserId(userId: string): boolean {
    if (
      !this.userIdToSocket.has(userId) ||
      !this.socketToUserId.has(this.userIdToSocket.get(userId) as WebSocket)
    ) {
      console.error(`GameSessionRegistry: No socket found for user ${userId}`);
      return false;
    }
    const socket = this.userIdToSocket.get(userId) as WebSocket;
    this.userIdToSocket.delete(userId);
    this.socketToUserId.delete(socket);
    return true;
  }

  deleteUserBySocket(socket: WebSocket): boolean {
    const userId = this.socketToUserId.get(socket);
    if (!userId) {
      console.error(
        'GameSessionRegistry: No user ID found for the given socket',
      );
      return false;
    }
    this.socketToUserId.delete(socket);
    this.userIdToSocket.delete(userId);
    return true;
  }
}
