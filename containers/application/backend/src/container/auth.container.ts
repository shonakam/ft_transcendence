import { SqliteUserRepository } from '../infra/sqlite/repository/UserRepositorySqlite.ts';

import { LoginUseCase } from "../usecase/auth/LoginUseCase.ts";

import { UserRepository } from "../domain/user/repository/UserRepository.ts";
import { TokenService } from "../domain/auth/vo/TokenService.ts";

export interface authUseCases {
    login: LoginUseCase;
    // logout: LogoutUseCase;
    // refresh: RefreshUsecase;
}

export async function initAuthUsecases() {
  const userRepository = new SqliteUserRepository();
  const tokenService = new TokenService()
  const login = new LoginUseCase(userRepository, tokenService);
//   const logout = new LogoutUseCase(userRepository);
//   const refresh = new RefreshUsecase(userRepository);

  return {
    login,
    // logout,
    // refresh
  };
}
