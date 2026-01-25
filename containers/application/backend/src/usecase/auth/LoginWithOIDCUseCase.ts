import { config } from '../../conf.ts';
import { TokenService } from './TokenService.ts';
import { UserRepository } from '../../domain/user/repository/UserRepository.ts';
import { VolatileDataRepositoryRedis } from '../../infra/redis/repository/VolatileDataRepositoryRedis.ts';
import { OIDCForm } from '../../domain/auth/form/OIDCForm.ts';
import { AuthCode } from '../../domain/auth/vo/AuthCode.ts';
import { HttpClient } from '../../infra/http/client.ts';
import { UserIdpRepository } from '../../domain/user/repository/UserIdPRepository.ts';
import { transaction } from '../../infra/sqlite/db.ts';
import UserId from '../../domain/user/vo/UserId.ts';
import { getUnixTimeMs } from '../../utils/unixtime.ts';
import UserIdpId from '../../domain/user/vo/UserIdpId.ts';
import { IdP } from '../../infra/idp/IdP.ts';
import { User2faRepository } from '../../domain/user/repository/User2faRepository.ts';
import { vaultService } from '../../main.ts';
import { JwtSecrets } from '../../infra/vault/vault.service.ts';

interface IdpConfig {
  redirect_uri: string;
  providers: {
    [provider: string]: {
      endpoint: string;
      path: string;
      clientId: string;
      clientSecret: string;
    };
  };
}

export interface LoginWithOIDCResponse {
  accessToken: string | null;
  refreshToken: string | null;
  tmpAuthToken: string | null;
}

export class LoginWithOIDCUseCase {
  constructor(
    private volatileDataRepositoryRedis: VolatileDataRepositoryRedis,
    private userRepo: UserRepository,
    private userIdpRepo: UserIdpRepository,
    private tokenService: TokenService,
    private user2faRepo: User2faRepository,
  ) {}

  private switchIdP(provider: string) {
    const providerEndpoint = (config.auth.idp as IdpConfig).providers[provider];
    if (!providerEndpoint || !providerEndpoint.endpoint) {
      throw new Error(
        `switchIdP: IdP configuration or endpoint not found for provider: ${provider}`,
      );
    }

    return IdP.getProviderService(
      provider,
      new HttpClient(providerEndpoint.endpoint),
    );
  }

  private async syncProfileData(id: string, userInfo: any): Promise<void> {
    const user = await this.userRepo.findById(id);
    if (user) {
      user.username = userInfo.name;
      user.email = userInfo.email;
      user.imagePath = userInfo.imagePath;
      await this.userRepo.save(user);
    }
  }

  private async generateTmpToken(id: string): Promise<LoginWithOIDCResponse> {
    const payload = { id: id };
    const jwts: JwtSecrets = await vaultService.getJwtSecrets();
    const tmpAuth = this.tokenService.generateTmpAuthToken(payload, jwts.tmp_auth_secret);
    return {
      accessToken: null,
      refreshToken: null,
      tmpAuthToken: tmpAuth.token,
    };
  }

  private async issueTokenAndSotoreToken(
    userId: string,
    provider: string,
  ): Promise<LoginWithOIDCResponse> {
    const payload = { id: userId, idp: provider };
    const jwts: JwtSecrets = await vaultService.getJwtSecrets();
    const access = this.tokenService.generateAccessToken(payload, jwts.access_secret);
    const refresh = this.tokenService.generateRefreshToken(payload, jwts.refresh_secret);
    const key = `session:refresh:${userId}`;
    const ttl = refresh.expiredAt - getUnixTimeMs();
    await this.volatileDataRepositoryRedis.set(key, refresh.token, ttl);
    return {
      accessToken: access.token,
      refreshToken: refresh.token,
      tmpAuthToken: null,
    };
  }

  async execute(
    form: OIDCForm,
    provider: string,
  ): Promise<LoginWithOIDCResponse> {
    const code = AuthCode.from(form.code);

    const idp = this.switchIdP(provider);
    if (!idp) {
      throw new Error(`switchIdP: IdP not found`);
    }
    const res = await idp.trade(code);
    const userInfo = await idp.getUserInfo(res.access_token);
    const now = getUnixTimeMs();

    const { userId, isTotpEnabled } = await transaction(async (db) => {
      const user = await this.userIdpRepo.providerUserId(
        userInfo.providerUserId,
        provider,
      );
      let userId: string;
      if (!user) {
        userId = UserId.create().get();
        await this.userRepo.save({
          id: userId,
          username: userInfo.name,
          email: userInfo.email,
          password: null,
          imagePath: userInfo.imagePath,
          is2faEnabled: 0,
          createdAt: now,
          updatedAt: now,
          withdrawnAt: null,
        });

        await this.user2faRepo.save({
          userId: userId,
          totpSeceret: null,
          isTotpEnabled: 0,
          createdAt: now,
          updatedAt: now,
        });

        await this.userIdpRepo.save({
          id: UserIdpId.create().get(),
          userId: userId,
          provider: provider,
          providerUserId: userInfo.providerUserId,
          imagePath: userInfo.imagePath,
          createdAt: now,
          updatedAt: now,
          withdrawnAt: null,
        });
      } else {
        userId = user.userId;
        await this.syncProfileData(userId, userInfo);
      }

      const user2fa = await this.user2faRepo.findById(userId);
      return {
        userId,
        isTotpEnabled: user2fa?.isTotpEnabled === 1,
      };
    });

    return isTotpEnabled
      ? this.generateTmpToken(userId)
      : this.issueTokenAndSotoreToken(userId, provider);
  }
}
