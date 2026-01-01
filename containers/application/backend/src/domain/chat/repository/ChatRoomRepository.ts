import type { ChatRoom } from '../entity/ChatRoom.ts';

export interface ChatRoomRepository {
  save(room: ChatRoom): Promise<void>;
  findById(id: string): Promise<ChatRoom | null>;
  findGlobalRoom(): Promise<ChatRoom | null>;
  findDmRoom(userId1: string, userId2: string): Promise<ChatRoom | null>;
  listRoomsByUserId(userId: string): Promise<ChatRoom[]>;
}
