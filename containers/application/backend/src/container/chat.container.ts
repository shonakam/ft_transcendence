import { ChatRoomRepositorySqlite } from '../infra/sqlite/repository/chat/ChatRoomRepositorySqlite.ts';
import { ChatMessageRepositorySqlite } from '../infra/sqlite/repository/chat/ChatMessageRepositorySqlite.ts';
import { UserBlockRepositorySqlite } from '../infra/sqlite/repository/chat/UserBlockRepositorySqlite.ts';
import { UserRepositorySqlite } from '../infra/sqlite/repository/user/UserRepositorySqlite.ts';

import { ListUserRoomsUseCase } from '../usecase/chat/ListUserRoomsUseCase.ts';
import { GetOrCreateDMRoomUseCase } from '../usecase/chat/GetOrCreateDMRoomUseCase.ts';
import { GetRoomMessagesUseCase } from '../usecase/chat/GetRoomMessagesUseCase.ts';
import { SendMessageUseCase } from '../usecase/chat/SendMessageUseCase.ts';
import { BlockUserUseCase } from '../usecase/chat/BlockUserUseCase.ts';
import { UnblockUserUseCase } from '../usecase/chat/UnblockUserUseCase.ts';
import { ListBlockedUsersUseCase } from '../usecase/chat/ListBlockedUsersUseCase.ts';

export interface ChatUseCases {
  listUserRooms: ListUserRoomsUseCase;
  getOrCreateDMRoom: GetOrCreateDMRoomUseCase;
  getRoomMessages: GetRoomMessagesUseCase;
  sendMessage: SendMessageUseCase;
  blockUser: BlockUserUseCase;
  unblockUser: UnblockUserUseCase;
  listBlockedUsers: ListBlockedUsersUseCase;
}

export async function initChatUseCases() {
  const chatRoomRepo = new ChatRoomRepositorySqlite();
  const chatMessageRepo = new ChatMessageRepositorySqlite();
  const userBlockRepo = new UserBlockRepositorySqlite();
  const userRepo = new UserRepositorySqlite();

  return {
    listUserRooms: new ListUserRoomsUseCase(chatRoomRepo),
    getOrCreateDMRoom: new GetOrCreateDMRoomUseCase(chatRoomRepo, userRepo),
    getRoomMessages: new GetRoomMessagesUseCase(chatMessageRepo, userBlockRepo),
    sendMessage: new SendMessageUseCase(
      chatMessageRepo,
      chatRoomRepo,
      userBlockRepo,
    ),
    blockUser: new BlockUserUseCase(userBlockRepo),
    unblockUser: new UnblockUserUseCase(userBlockRepo),
    listBlockedUsers: new ListBlockedUsersUseCase(userBlockRepo),
  };
}
