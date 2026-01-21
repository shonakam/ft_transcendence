import type { Socket } from 'socket.io';

export class GameSocketRegistry {
  // User and socket mappings
  socketToUserId = new Map<Socket, string>();
  userIdToSocket = new Map<string, Socket>();

  constructor() {}

  // User socket management
  addUserSocket(userId: string, socket: Socket): boolean {
    if (this.userIdToSocket.has(userId) || this.socketToUserId.has(socket)) {
      console.error(`GameSessionRegistry: User ${userId} already registered`);
      return false;
    }
    this.userIdToSocket.set(userId, socket);
    this.socketToUserId.set(socket, userId);
    return true;
  }

  getUserSocket(userId: string): Socket | null {
    return this.userIdToSocket.get(userId) || null;
  }

  getUserIdBySocket(socket: Socket): string | null {
    return this.socketToUserId.get(socket) || null;
  }

  deleteSocketByUserId(userId: string): boolean {
    if (
      !this.userIdToSocket.has(userId) ||
      !this.socketToUserId.has(this.userIdToSocket.get(userId) as Socket)
    ) {
      console.error(`GameSessionRegistry: No socket found for user ${userId}`);
      return false;
    }
    const socket = this.userIdToSocket.get(userId) as Socket;
    this.userIdToSocket.delete(userId);
    this.socketToUserId.delete(socket);
    return true;
  }

  deleteUserBySocket(socket: Socket): boolean {
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
