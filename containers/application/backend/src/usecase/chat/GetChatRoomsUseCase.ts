import type { ChatRoomRepository } from '../../domain/chat/repository/ChatRoomRepository.ts';
import type { ChatRoomMemberRepository } from '../../domain/chat/repository/ChatRoomMemberRepository.ts';
import type { ChatRoom } from '../../domain/chat/entity/ChatRoom.ts';
import { uuidv4 } from '../../utils/uuidv4.ts';
import { getUnixTimeSec } from '../../utils/unixtime.ts';

export class GetChatRoomsUseCase {
  constructor(
    private chatRoomRepository: ChatRoomRepository,
    private chatRoomMemberRepository: ChatRoomMemberRepository
  ) {}

  async execute(userId: string): Promise<ChatRoom[]> {
    // Ensure Global Room exists
    let globalRoom = await this.chatRoomRepository.findGlobalRoom();
    if (!globalRoom) {
      globalRoom = {
        id: uuidv4(),
        name: 'Global Chat',
        type: 'global',
        createdAt: getUnixTimeSec(),
      };
      await this.chatRoomRepository.save(globalRoom);
    }

    // Ensure User is member of Global Room
    const membership = await this.chatRoomMemberRepository.findByRoomAndUser(globalRoom.id, userId);
    if (!membership) {
      await this.chatRoomMemberRepository.save({
        id: uuidv4(),
        roomId: globalRoom.id,
        userId: userId,
        createdAt: getUnixTimeSec(),
      });
    }

    return await this.chatRoomRepository.listRoomsByUserId(userId);
  }
}
