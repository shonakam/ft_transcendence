import type { ChatMessageRepository } from '../../domain/chat/repository/ChatMessageRepository.ts';
import type { UserBlockRepository } from '../../domain/block/repository/UserBlockRepository.ts';
import type { ChatMessage } from '../../domain/chat/entity/ChatMessage.ts';

export class GetChatHistoryUseCase {
  constructor(
    private chatMessageRepository: ChatMessageRepository,
    private userBlockRepository: UserBlockRepository
  ) {}

  async execute(userId: string, roomId: string, limit = 50, offset = 0): Promise<ChatMessage[]> {
    const messages = await this.chatMessageRepository.findByRoomId(roomId, limit, offset);
    const blocks = await this.userBlockRepository.findByBlockerId(userId);
    const blockedUserIds = new Set(blocks.map((b) => b.blockedId));

    return messages.filter((m) => !blockedUserIds.has(m.senderId));
  }
}
