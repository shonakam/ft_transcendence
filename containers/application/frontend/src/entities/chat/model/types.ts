export interface ChatRoom {
  id: string;
  name: string | null;
  type: 'global' | 'dm';
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  messageType: 'text' | 'invitation';
  createdAt: number;
}
