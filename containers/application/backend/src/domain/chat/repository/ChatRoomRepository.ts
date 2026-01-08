import type { ChatRoom } from '../entity/ChatRoom.ts';

export interface ChatRoomRepository {
  save(room: ChatRoom): Promise<void>;
  findById(id: string): Promise<ChatRoom | null>;
  findUserRooms(userId: string): Promise<ChatRoom[]>;
  findDMRoom(userId1: string, userId2: string): Promise<ChatRoom | null>;
  addMember(roomId: string, userId: string): Promise<void>;
}
