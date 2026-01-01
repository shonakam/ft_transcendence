import type { ChatMessageRepository } from '../../domain/chat/repository/ChatMessageRepository.ts';
import type { ChatRoomRepository } from '../../domain/chat/repository/ChatRoomRepository.ts';
import type { ChatRoomMemberRepository } from '../../domain/chat/repository/ChatRoomMemberRepository.ts';
import type { ChatMessage } from '../../domain/chat/entity/ChatMessage.ts';
import { uuidv4 } from '../../utils/uuidv4.ts';
import { getUnixTimeSec } from '../../utils/unixtime.ts';
import { transaction } from '../../infra/sqlite/db.ts';

export interface SendChatMessageCommand {
  roomId?: string;
  recipientId?: string; // For auto DM room creation
  senderId: string;
  content: string;
  messageType: 'text' | 'invitation';
}

export class SendChatMessageUseCase {
  constructor(
    private chatMessageRepository: ChatMessageRepository,
    private chatRoomRepository: ChatRoomRepository,
    private chatRoomMemberRepository: ChatRoomMemberRepository
  ) {}

  async execute(command: SendChatMessageCommand): Promise<ChatMessage> {
    let roomId = command.roomId;

    if (!roomId && command.recipientId) {
      // DM Room auto creation
      const existingRoom = await this.chatRoomRepository.findDmRoom(command.senderId, command.recipientId);
      if (existingRoom) {
        roomId = existingRoom.id;
      } else {
        roomId = await transaction(async () => {
          const newRoomId = uuidv4();
          await this.chatRoomRepository.save({
            id: newRoomId,
            name: null,
            type: 'dm',
            createdAt: getUnixTimeSec(),
          });
          await this.chatRoomMemberRepository.save({
            id: uuidv4(),
            roomId: newRoomId,
            userId: command.senderId,
            createdAt: getUnixTimeSec(),
          });
          await this.chatRoomMemberRepository.save({
            id: uuidv4(),
            roomId: newRoomId,
            userId: command.recipientId!,
            createdAt: getUnixTimeSec(),
          });
          return newRoomId;
        });
      }
    }

    if (!roomId) {
      throw new Error('Room ID or Recipient ID is required');
    }

    const message: ChatMessage = {
      id: uuidv4(),
      roomId,
      senderId: command.senderId,
      content: command.content,
      messageType: command.messageType,
      createdAt: getUnixTimeSec(),
    };

    await this.chatMessageRepository.save(message);
    return message;
  }
}
