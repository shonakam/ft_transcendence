export type MessageType = 'text' | 'invitation';

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  messageType: MessageType;
  createdAt: number;
}
