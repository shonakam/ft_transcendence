import type { ChatRoomMemberRepository } from '../../domain/chat/repository/ChatRoomMemberRepository.ts';
import type { ChatRoomMember } from '../../domain/chat/entity/ChatRoomMember.ts';

export class GetRoomMembersUseCase {
  constructor(private chatRoomMemberRepository: ChatRoomMemberRepository) {}

  async execute(roomId: string): Promise<ChatRoomMember[]> {
    return await this.chatRoomMemberRepository.findByRoomId(roomId);
  }
}
