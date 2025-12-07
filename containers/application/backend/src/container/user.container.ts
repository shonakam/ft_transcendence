import { UserRepositorySqlite } from '../infra/sqlite/repository/user/UserRepositorySqlite.ts';

import { CreateUserUseCase } from '../usecase/user/CreateUserUseCase.ts';
import { GetUserUseCase } from '../usecase/user/GetUserUseCase.ts';
import { ListUserUseCase } from '../usecase/user/ListUserUseCase.ts';
import { UpdateUserUseCase } from '../usecase/user/UpdateUserUseCase.ts';
import { DeleteUserUseCase } from '../usecase/user/DeleteUserUseCase.ts';
import { User2faRepositorySqlite } from '../infra/sqlite/repository/user/User2faRepositorySqlite.ts';

export interface UserUseCases {
  createUser: CreateUserUseCase;
  getUser: GetUserUseCase;
  listUsers: ListUserUseCase;
  updateUser: UpdateUserUseCase;
  deleteUser: DeleteUserUseCase;
}

export async function initUserUseCases() {
  const userRepository = new UserRepositorySqlite();
  const user2faRepository = new User2faRepositorySqlite()

  const createUser = new CreateUserUseCase(userRepository, user2faRepository);
  const getUser = new GetUserUseCase(userRepository);
  const listUsers = new ListUserUseCase(userRepository);
  const updateUser = new UpdateUserUseCase(userRepository);
  const deleteUser = new DeleteUserUseCase(userRepository);

  return {
    createUser,
    getUser,
    listUsers,
    updateUser,
    deleteUser,
  };
}
