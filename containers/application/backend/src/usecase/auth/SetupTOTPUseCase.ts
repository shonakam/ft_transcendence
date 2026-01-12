import { config } from '../../conf.ts';
import { TokenService } from './TokenService.ts';
import { UserRepository } from '../../domain/user/repository/UserRepository.ts';
import { User2faRepository } from '../../domain/user/repository/User2faRepository.ts';
import { User2fa } from '../../domain/user/entity/User2fa.ts';
import { getUnixTimeMs } from '../../utils/unixtime.ts';
import speakeasy from 'speakeasy';
import { VaultService } from '../../infra/vault/vault.service.ts';

export interface SetupTOTPResponse {
  uri: string;
}
export class SetupTOTPUseCase {
  constructor(
    private userRepo: UserRepository,
    private tokenService: TokenService,
    private user2faRepository: User2faRepository,
    private vaultService: VaultService,
  ) {}

  private async setTotpSecrete(userId: string, user2fa: User2fa, secret: string) {
    const now = getUnixTimeMs();

    // 1. Save state to DB (シークレットは除外してDBに状態を保存)
    user2fa.updatedAt = now;
    await this.user2faRepository.save(user2fa);

    // 2. Save secret to Vault (Vaultにシークレットを保存)
    await this.vaultService.setSecret(`secret/data/mfa/${userId}`, {
      secret: secret,
    });
  }

  async execute(accessToken: string): Promise<SetupTOTPResponse> {
    const payload = this.tokenService.verifyToken(
      accessToken,
      config.auth.jwtAccessSecret,
    );
    if (typeof payload === 'string' || !('sub' in payload) || !payload.sub) {
      console.warn('SetupTOTPUseCase: invald payload');
      throw new Error('Invalid tmp auth token.');
    }

    const user = await this.userRepo.findById(payload.sub);
    if (!user) {
      console.warn('SetupTOTPUseCase: findById is failed.');
      throw new Error('User not found.');
    }

    const user2fa = await this.user2faRepository.findById(user.id);
    if (!user2fa || user2fa.isTotpEnabled) {
      console.warn(
        'SetupTOTPUseCase: findById is failed or already registered.',
      );
      throw new Error('execute failed.');
    }

    // TOTP用秘密鍵及びurlの生成
    // https://tex2e.github.io/rfc-translater/html/rfc6238.html
    const authUrl = speakeasy.generateSecret({
      length: 20,
      otpauth_url: true,
      issuer: config.auth.issuer,
    });
    await this.setTotpSecrete(user.id, user2fa, authUrl.base32);

    return { uri: authUrl.otpauth_url };
  }
}
