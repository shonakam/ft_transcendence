import type { ChatRoom } from '../entity/ChatRoom.ts';

export interface ChatRoomRepository {
  save(chatRoom: ChatRoom): Promise<void>;
  findById(id: string): Promise<ChatRoom | null>;
  findAll(): Promise<ChatRoom[]>;
  delete(id: string): Promise<void>;
}
