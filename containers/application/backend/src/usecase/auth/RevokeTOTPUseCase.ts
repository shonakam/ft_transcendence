import { config } from '../../conf.ts';
import { VolatileDataRepositoryRedis } from '../../infra/redis/repository/VolatileDataRepositoryRedis.ts';
import { UserRepository } from '../../domain/user/repository/UserRepository.ts';
import { TokenService } from './TokenService.ts';
import { User2faRepository } from '../../domain/user/repository/User2faRepository.ts';
import { VerifyTOTPForm } from '../../domain/auth/form/VerifyTOTPForm.ts';
import speakeasy from 'speakeasy';
import { getUnixTimeMs } from '../../utils/unixtime.ts';
import { RefreshToken } from '../../domain/auth/vo/RefreshToken.ts';
import UserId from '../../domain/user/vo/UserId.ts';
import { transaction } from '../../infra/sqlite/db.ts';
import { VaultService } from '../../infra/vault/vault.service.ts';

export class RevokeTOTPUseCase {
  constructor(
    private userRepo: UserRepository,
    private user2faRepository: User2faRepository,
    private vaultService: VaultService,
  ) {}

async execute(id: UserId): Promise<void> {
    const userId = id.get();
    const user = await this.userRepo.findById(userId);
    if (!user) {
      console.warn('RevokeTOTPUseCase: user not found.');
      throw new Error('User not found.');
    }

    const user2fa = await this.user2faRepository.findById(userId);
    if (!user2fa) {
      console.warn('RevokeTOTPUseCase: 2FA record not found.');
      throw new Error('Not registered.');
    }

    // 1. Execute DB transaction to update 2FA status
    // 1. 2FA状態を更新するためにDBトランザクションを実行
    await transaction(async (db) => {
      try {
        user.is2faEnabled = 0;
        await this.userRepo.save(user);

        user2fa.isTotpEnabled = 0;
        user2fa.totpSeceret = ''; // Clear secret field in DB
        await this.user2faRepository.save(user2fa);
      } catch (e) {
        console.error(`RevokeTOTPUseCase: transaction error ${e}`);
        throw new Error(`RevokeTOTPUseCase: transaction error ${e}`);
      }
    });

    // 2. Delete the secret from Vault after successful DB update
    // 2. DB更新に成功した後、Vaultからシークレットを削除
    await this.vaultService.deleteSecret(`secret/data/mfa/${userId}`);
  }
}
