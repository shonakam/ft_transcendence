import type { ChatMessageRepository } from '../../domain/chat/repository/ChatMessageRepository.ts';
import type { UserBlockRepository } from '../../domain/chat/repository/UserBlockRepository.ts';
import type { ChatMessage } from '../../domain/chat/entity/ChatMessage.ts';

export class GetRoomMessagesUseCase {
  constructor(
    private chatMessageRepo: ChatMessageRepository,
    private userBlockRepo: UserBlockRepository,
  ) {}

  async execute(userId: string, roomId: string): Promise<ChatMessage[]> {
    const messages = await this.chatMessageRepo.findByRoomId(roomId);
    const blockedUserIds = await this.userBlockRepo.findBlockedUserIds(userId);

    if (blockedUserIds.length === 0) {
      return messages;
    }

    const blockedSet = new Set(blockedUserIds);
    return messages.filter((msg) => !blockedSet.has(msg.senderId));
  }
}
