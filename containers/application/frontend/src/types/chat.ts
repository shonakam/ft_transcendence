export type ChatRoomType = 'global' | 'dm';

export interface ChatRoom {
  id: string;
  name: string | null;
  type: ChatRoomType;
  createdAt: number;
}

export type MessageType = 'text' | 'invitation';

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  messageType: MessageType;
  createdAt: number;
}

export interface UserBlock {
  id: string;
  blockerId: string;
  blockedId: string;
  createdAt: number;
}
