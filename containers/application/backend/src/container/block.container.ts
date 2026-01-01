import { UserBlockRepositorySqlite } from '../infra/sqlite/repository/block/UserBlockRepositorySqlite.ts';
import { HandleUserBlockUseCase } from '../usecase/chat/HandleUserBlockUseCase.ts';

export interface BlockUseCases {
  handleUserBlock: HandleUserBlockUseCase;
}

export async function initBlockUseCases() {
  const userBlockRepo = new UserBlockRepositorySqlite();
  const handleUserBlock = new HandleUserBlockUseCase(userBlockRepo);

  return {
    handleUserBlock,
  };
}
