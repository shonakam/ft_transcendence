import { ChatRoom, ChatMessage } from '../../entities/chat/model/types';

const BASE_URL = '/api/v1';

export class ChatApi {
  static async getRooms(): Promise<ChatRoom[]> {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(`${BASE_URL}/chat/rooms`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch rooms');
    return res.json();
  }

  static async getMessages(roomId: string): Promise<ChatMessage[]> {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(`${BASE_URL}/chat/rooms/${roomId}/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch messages');
    return res.json();
  }

  static async blockUser(userId: string): Promise<void> {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(`${BASE_URL}/blocks/${userId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to block user');
  }

  static async unblockUser(userId: string): Promise<void> {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(`${BASE_URL}/blocks/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to unblock user');
  }

  static async getBlockedUsers(): Promise<string[]> {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(`${BASE_URL}/blocks`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch blocked users');
    return res.json();
  }
}
