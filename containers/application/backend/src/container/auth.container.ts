import { UserRepositorySqlite } from '../infra/sqlite/repository/user/UserRepositorySqlite.ts';

import { LoginUseCase } from "../usecase/auth/LoginUseCase.ts";
import { LogoutUseCase } from '../usecase/auth/LogoutUseCase.ts';
import { RefreshUseCase } from '../usecase/auth/RefreshUseCase.ts';
import { TokenService } from "../usecase/auth/TokenService.ts";
import { VolatileDataRepositoryRedis } from '../infra/redis/repository/VolatileDataRepositoryRedis.ts';
import { LoginWithOIDCUseCase } from '../usecase/auth/LoginWithOIDCUseCase.ts';
import { UserIdpRepositorySqlite } from '../infra/sqlite/repository/user/UserIdpRepositorySqlite.ts';
import { Verify2faUseCase } from '../usecase/auth/Verify2faUseCase.ts';

export interface authUseCases {
    login: LoginUseCase;
    loginWithOIDC: LoginWithOIDCUseCase,
    logout: LogoutUseCase;
    refresh: RefreshUseCase;
    verify2fa: Verify2faUseCase;
}

export async function initAuthUsecases() {
  const userRepository = new UserRepositorySqlite();
  const userIdpRepo = new UserIdpRepositorySqlite();
  const volatileDataRepositoryRedis = new VolatileDataRepositoryRedis();
  const tokenService = new TokenService();

  const login = new LoginUseCase(volatileDataRepositoryRedis, userRepository, tokenService);
  const loginWithOIDC = new LoginWithOIDCUseCase(volatileDataRepositoryRedis, userRepository, userIdpRepo, tokenService);
  const logout = new LogoutUseCase(volatileDataRepositoryRedis, userRepository, tokenService);
  const refresh = new RefreshUseCase(volatileDataRepositoryRedis, userRepository, tokenService);
  const verify2fa = new Verify2faUseCase(volatileDataRepositoryRedis, userRepository, tokenService)

  return { login, loginWithOIDC, logout, refresh, verify2fa };
}
