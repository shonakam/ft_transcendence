import type { ChatRoomRepository } from '../../domain/chat/repository/ChatRoomRepository.ts';
import type { UserRepository } from '../../domain/user/repository/UserRepository.ts';
import type { ChatRoom } from '../../domain/chat/entity/ChatRoom.ts';

export class GetOrCreateDMRoomUseCase {
  constructor(
    private chatRoomRepo: ChatRoomRepository,
    private userRepo: UserRepository,
  ) {}

  async execute(userId1: string, userId2: string): Promise<ChatRoom> {
    const existingRoom = await this.chatRoomRepo.findDMRoom(userId1, userId2);
    if (existingRoom) {
      return existingRoom;
    }

    const user1 = await this.userRepo.findById(userId1);
    const user2 = await this.userRepo.findById(userId2);

    if (!user1 || !user2) {
      throw new Error('User not found');
    }

    const room: ChatRoom = {
      id: crypto.randomUUID(),
      name: `${user1.username} / ${user2.username}`,
      type: 'dm',
      createdAt: Math.floor(Date.now() / 1000),
    };

    await this.chatRoomRepo.save(room);
    await this.chatRoomRepo.addMember(room.id, userId1);
    await this.chatRoomRepo.addMember(room.id, userId2);

    return room;
  }
}
