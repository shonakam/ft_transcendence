import { UserRepositorySqlite } from '../infra/sqlite/repository/user/UserRepositorySqlite.ts';

import { CreateUserUseCase } from '../usecase/user/CreateUserUseCase.ts';
import { GetUserUseCase } from '../usecase/user/GetUserUseCase.ts';
import { ListUserUseCase } from '../usecase/user/ListUserUseCase.ts';
import { UpdateUserUseCase } from '../usecase/user/UpdateUserUseCase.ts';
import { DeleteUserUseCase } from '../usecase/user/DeleteUserUseCase.ts';
import { User2faRepositorySqlite } from '../infra/sqlite/repository/user/User2faRepositorySqlite.ts';
import { LocalFileStorage } from '../infra/storage/LocalFileStorage.ts';

export interface UserUseCases {
  createUser: CreateUserUseCase;
  getUser: GetUserUseCase;
  listUsers: ListUserUseCase;
  updateUser: UpdateUserUseCase;
  deleteUser: DeleteUserUseCase;
}

export async function initUserUseCases() {
  const userRepository = new UserRepositorySqlite();
  const user2faRepository = new User2faRepositorySqlite();
  const localFileStorage = new LocalFileStorage();

  const createUser = new CreateUserUseCase(userRepository, user2faRepository);
  const getUser = new GetUserUseCase(userRepository, user2faRepository);
  const listUsers = new ListUserUseCase(userRepository);
  const updateUser = new UpdateUserUseCase(userRepository, localFileStorage);
  const deleteUser = new DeleteUserUseCase(userRepository);

  return {
    createUser,
    getUser,
    listUsers,
    updateUser,
    deleteUser,
  };
}
