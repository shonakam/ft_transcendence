import { ChatRoomRepositorySqlite } from '../infra/sqlite/repository/chat/ChatRoomRepositorySqlite.ts';
import { ChatRoomMemberRepositorySqlite } from '../infra/sqlite/repository/chat/ChatRoomMemberRepositorySqlite.ts';
import { ChatMessageRepositorySqlite } from '../infra/sqlite/repository/chat/ChatMessageRepositorySqlite.ts';
import { UserBlockRepositorySqlite } from '../infra/sqlite/repository/block/UserBlockRepositorySqlite.ts';

import { GetChatRoomsUseCase } from '../usecase/chat/GetChatRoomsUseCase.ts';
import { SendChatMessageUseCase } from '../usecase/chat/SendChatMessageUseCase.ts';
import { GetChatHistoryUseCase } from '../usecase/chat/GetChatHistoryUseCase.ts';
import { GetRoomMembersUseCase } from '../usecase/chat/GetRoomMembersUseCase.ts';

export interface ChatUseCases {
  getChatRooms: GetChatRoomsUseCase;
  sendChatMessage: SendChatMessageUseCase;
  getChatHistory: GetChatHistoryUseCase;
  getRoomMembers: GetRoomMembersUseCase;
}

export async function initChatUseCases() {
  const chatRoomRepo = new ChatRoomRepositorySqlite();
  const chatRoomMemberRepo = new ChatRoomMemberRepositorySqlite();
  const chatMessageRepo = new ChatMessageRepositorySqlite();
  const userBlockRepo = new UserBlockRepositorySqlite();

  const getChatRooms = new GetChatRoomsUseCase(chatRoomRepo, chatRoomMemberRepo);
  const sendChatMessage = new SendChatMessageUseCase(chatMessageRepo, chatRoomRepo, chatRoomMemberRepo);
  const getChatHistory = new GetChatHistoryUseCase(chatMessageRepo, userBlockRepo);
  const getRoomMembers = new GetRoomMembersUseCase(chatRoomMemberRepo);

  return {
    getChatRooms,
    sendChatMessage,
    getChatHistory,
    getRoomMembers,
  };
}
