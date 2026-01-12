import { UserRepositorySqlite } from '../infra/sqlite/repository/user/UserRepositorySqlite.ts';

import { LoginUseCase } from '../usecase/auth/LoginUseCase.ts';
import { LogoutUseCase } from '../usecase/auth/LogoutUseCase.ts';
import { RefreshUseCase } from '../usecase/auth/RefreshUseCase.ts';
import { TokenService } from '../usecase/auth/TokenService.ts';
import { VolatileDataRepositoryRedis } from '../infra/redis/repository/VolatileDataRepositoryRedis.ts';
import { LoginWithOIDCUseCase } from '../usecase/auth/LoginWithOIDCUseCase.ts';
import { UserIdpRepositorySqlite } from '../infra/sqlite/repository/user/UserIdpRepositorySqlite.ts';
import { VerifyTOTPUseCase } from '../usecase/auth/VerifyTOTPUseCase.ts';
import { User2faRepositorySqlite } from '../infra/sqlite/repository/user/User2faRepositorySqlite.ts';
import { SetupTOTPUseCase } from '../usecase/auth/SetupTOTPUseCase.ts';
import { RevokeTOTPUseCase } from '../usecase/auth/RevokeTOTPUseCase.ts';
import { VaultService } from '../infra/vault/vault.service.ts';

export interface authUseCases {
  login: LoginUseCase;
  loginWithOIDC: LoginWithOIDCUseCase;
  logout: LogoutUseCase;
  refresh: RefreshUseCase;
  setupTOTP: SetupTOTPUseCase;
  verifyTOTP: VerifyTOTPUseCase;
  revokeTOTP: RevokeTOTPUseCase;
}

export async function initAuthUsecases() {
  const userRepository = new UserRepositorySqlite();
  const userIdpRepo = new UserIdpRepositorySqlite();
  const volatileDataRepositoryRedis = new VolatileDataRepositoryRedis();
  const tokenService = new TokenService();
  const user2faRepository = new User2faRepositorySqlite();
  const vaultService = new VaultService();
  await vaultService.init();

  const login = new LoginUseCase(
    volatileDataRepositoryRedis,
    userRepository,
    tokenService,
    user2faRepository,
  );
  const loginWithOIDC = new LoginWithOIDCUseCase(
    volatileDataRepositoryRedis,
    userRepository,
    userIdpRepo,
    tokenService,
    user2faRepository,
  );
  const logout = new LogoutUseCase(
    volatileDataRepositoryRedis,
    userRepository,
    tokenService,
  );
  const refresh = new RefreshUseCase(
    volatileDataRepositoryRedis,
    userRepository,
    tokenService,
  );
  const setupTOTP = new SetupTOTPUseCase(
    userRepository,
    tokenService,
    user2faRepository,
    vaultService,
  );
  const verifyTOTP = new VerifyTOTPUseCase(
    volatileDataRepositoryRedis,
    userRepository,
    tokenService,
    user2faRepository,
    vaultService,
  );
  const revokeTOTP = new RevokeTOTPUseCase(
    userRepository,
    user2faRepository,
    vaultService
  );

  return {
    login,
    loginWithOIDC,
    logout,
    refresh,
    setupTOTP,
    verifyTOTP,
    revokeTOTP,
  };
}
