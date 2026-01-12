import { api } from '../../lib/httpClient';
import { ChatRoom, ChatMessage } from '../../types/chat';

export class ChatService {
  async getRooms(): Promise<ChatRoom[]> {
    return api.get<ChatRoom[]>('chat/rooms');
  }

  async getOrCreateDMRoom(targetUserId: string): Promise<ChatRoom> {
    return api.post<ChatRoom>('chat/rooms/dm', { targetUserId });
  }

  async getMessages(roomId: string): Promise<ChatMessage[]> {
    return api.get<ChatMessage[]>(`chat/rooms/${roomId}/messages`);
  }

  async sendMessage(
    roomId: string,
    content: string,
    messageType: string = 'text'
  ): Promise<ChatMessage> {
    return api.post<ChatMessage>(`chat/rooms/${roomId}/messages`, {
      content,
      messageType,
    });
  }

  async blockUser(blockedUserId: string): Promise<void> {
    return api.post<void>('chat/blocks', { blockedUserId });
  }

  async unblockUser(blockedUserId: string): Promise<void> {
    return api.delete<void>(`chat/blocks/${blockedUserId}`);
  }

  async getBlockedUsers(): Promise<string[]> {
    return api.get<string[]>('chat/blocks');
  }
}

export const chatService = new ChatService();
