import type { ChatRoomMember } from '../entity/ChatRoomMember.ts';

export interface ChatRoomMemberRepository {
  save(member: ChatRoomMember): Promise<void>;
  findByRoomId(roomId: string): Promise<ChatRoomMember[]>;
  findByRoomAndUser(roomId: string, userId: string): Promise<ChatRoomMember | null>;
  delete(roomId: string, userId: string): Promise<void>;
}
