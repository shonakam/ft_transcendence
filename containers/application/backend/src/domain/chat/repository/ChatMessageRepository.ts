import type { ChatMessage } from '../entity/ChatMessage.ts';

export interface ChatMessageRepository {
  save(message: ChatMessage): Promise<void>;
  findByRoomId(roomId: string): Promise<ChatMessage[]>;
}
