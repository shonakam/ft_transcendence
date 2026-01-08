import type { ChatMessageRepository } from '../../domain/chat/repository/ChatMessageRepository.ts';
import type { ChatRoomRepository } from '../../domain/chat/repository/ChatRoomRepository.ts';
import type { UserBlockRepository } from '../../domain/chat/repository/UserBlockRepository.ts';
import type { ChatMessage, MessageType } from '../../domain/chat/entity/ChatMessage.ts';

export class SendMessageUseCase {
  constructor(
    private chatMessageRepo: ChatMessageRepository,
    private chatRoomRepo: ChatRoomRepository,
    private userBlockRepo: UserBlockRepository,
  ) {}

  async execute(
    senderId: string,
    roomId: string,
    content: string,
    messageType: MessageType = 'text',
  ): Promise<ChatMessage> {
    const room = await this.chatRoomRepo.findById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    // Optional: Check if sender is blocking or blocked?
    // Usually we allow sending but recipient filters.
    // However, for DM, if sender is blocked by recipient, we might want to fail fast or just let it go.
    // The requirement says "blocked user's message is hidden from me".
    // So sender can send, but recipient won't see it if they blocked the sender.

    const message: ChatMessage = {
      id: crypto.randomUUID(),
      roomId,
      senderId,
      content,
      messageType,
      createdAt: Math.floor(Date.now() / 1000),
    };

    await this.chatMessageRepo.save(message);
    return message;
  }
}
