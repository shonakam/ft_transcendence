import { SqliteUserRepository } from '../infra/sqlite/repository/UserRepositorySqlite.ts';

import { CreateUserUseCase } from '../usecase/user/CreateUserUseCase.ts';
import { GetUserUseCase } from '../usecase/user/GetUserUseCase.ts';
import { ListUserUseCase } from '../usecase/user/ListUserUseCase.ts';
import { UpdateUserUseCase } from '../usecase/user/UpdateUserUseCase.ts';
import { DeleteUserUseCase } from '../usecase/user/DeleteUserUseCase.ts';

export interface UserUseCases {
  createUser: CreateUserUseCase;
  getUser: GetUserUseCase;
  listUsers: ListUserUseCase;
  updateUser: UpdateUserUseCase;
  deleteUser: DeleteUserUseCase;
}

export async function initUserUseCases() {
  const userRepository = new SqliteUserRepository();

  const createUser = new CreateUserUseCase(userRepository);
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
