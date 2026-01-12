import { config } from '../../conf.ts';
import { VolatileDataRepositoryRedis } from '../../infra/redis/repository/VolatileDataRepositoryRedis.ts';
import { UserRepository } from '../../domain/user/repository/UserRepository.ts';
import { TokenService } from './TokenService.ts';
import { User2faRepository } from '../../domain/user/repository/User2faRepository.ts';
import { VerifyTOTPForm } from '../../domain/auth/form/VerifyTOTPForm.ts';
import speakeasy from 'speakeasy';
import { getUnixTimeMs } from '../../utils/unixtime.ts';
import { VaultService } from '../../infra/vault/vault.service.ts';

export class VerifyTOTPUseCase {
  constructor(
    private volatileDataRepositoryRedis: VolatileDataRepositoryRedis,
    private userRepo: UserRepository,
    private tokenService: TokenService,
    private user2faRepository: User2faRepository,
    private vaultService: VaultService,
  ) {}

  private getPayload(a: string, t: string) {
    console.log('access: ', a);
    console.log('tmpauth: ', t);
    let payload;
    if (a == null || a == undefined) {
      payload = this.tokenService.verifyToken(t, config.auth.jwtTmpAuthSecret);
    } else {
      payload = this.tokenService.verifyToken(a, config.auth.jwtAccessSecret);
    }
    return payload;
  }

  async execute(
    form: VerifyTOTPForm,
    a: string,
    t: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = this.getPayload(a, t);
    if (typeof payload === 'string' || !('sub' in payload) || !payload.sub) {
      console.warn('VerifyTOTPUseCase: invald payload');
      throw new Error('Invalid tmp auth token.');
    }

    const user2fa = await this.user2faRepository.findById(payload.sub);
    if (!user2fa) {
      // ユーザーの2FA情報が見つからない場合
      throw new Error('Not registered.');
    }

    // Get the actual secret from Vault
    // Vaultから実際のシークレットを取得
    const vaultData = await this.vaultService.getSecret(`secret/data/mfa/${payload.sub}`);
    const totpSecret = vaultData?.secret;

    if (!totpSecret) {
      // Vaultにシークレットが存在しない場合
      console.warn('VerifyTOTPUseCase: Secret not found in Vault.');
      throw new Error('Secret not found in Vault.');
    }

    // Verify the TOTP code. Added '!' to fix the logic: throw error if verification FAILS.
    // TOTPコードの検証。ロジックを修正：検証に失敗した場合（!）にエラーをスロー。
    if (!speakeasy.totp.verify({ secret: totpSecret, token: form.code })) {
      console.warn('VerifyTOTPUseCase: invalid auth code.');
      throw new Error('Invalid auth code.');
    }

    if (!user2fa.isTotpEnabled) {
      user2fa.updatedAt = getUnixTimeMs();
      user2fa.isTotpEnabled = 1;
      await this.user2faRepository.save(user2fa);
    }

    const loginPayload = { id: payload.sub };
    const access = this.tokenService.generateAccessToken(loginPayload);
    const refresh = this.tokenService.generateRefreshToken(loginPayload);

    const key = `session:refresh:${payload.sub}`;
    const ttl = refresh.expiredAt - getUnixTimeMs();
    await this.volatileDataRepositoryRedis.set(key, refresh.token, ttl);

    return {
      accessToken: access.token,
      refreshToken: refresh.token,
    };
  }
}
