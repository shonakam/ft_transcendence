import type { ChatRoomRepository } from '../../domain/chat/repository/ChatRoomRepository.ts';
import type { ChatRoom } from '../../domain/chat/entity/ChatRoom.ts';

export class ListUserRoomsUseCase {
  constructor(private chatRoomRepo: ChatRoomRepository) {}

  async execute(userId: string): Promise<ChatRoom[]> {
    return this.chatRoomRepo.findUserRooms(userId);
  }
}
