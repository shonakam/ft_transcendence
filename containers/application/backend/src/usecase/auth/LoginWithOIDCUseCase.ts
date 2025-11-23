import { config } from "../../conf.ts";
import { TokenService } from "./TokenService.ts";
import { UserRepository } from "../../domain/user/repository/UserRepository.ts";
import { VolatileDataRepositoryRedis } from "../../infra/redis/repository/VolatileDataRepositoryRedis.ts";
import { OIDCForm } from "../../domain/auth/form/OIDCForm.ts";
import { AuthCode } from "../../domain/auth/vo/AuthCode.ts";
import { HttpClient } from "../../infra/http/client.ts";
import { UserIdpRepository } from "../../domain/user/repository/UserIdPRepository.ts";
import { transaction } from "../../infra/sqlite/db.ts";
import UserId from "../../domain/user/vo/UserId.ts";
import { getUnixTimeMs } from "../../utils/unixtime.ts";
import UserIdpId from "../../domain/user/vo/UserIdpId.ts";
import { IdP } from "../../infra/idp/IdP.ts";

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

export class LoginWithOIDCUseCase {
  constructor(
    private volatileDataRepositoryRedis: VolatileDataRepositoryRedis,
    private userRepo: UserRepository,
    private userIdpRepo: UserIdpRepository,
    private tokenService: TokenService,
  ) {}

  private switchIdP(provider: string) {
    const providerEndpoint = (config.auth.idp as IdpConfig).providers[provider]
    if (!providerEndpoint || !providerEndpoint.endpoint) {
      throw new Error(`switchIdP: IdP configuration or endpoint not found for provider: ${provider}`)
    }

    return IdP.getProviderService(provider, new HttpClient(providerEndpoint.endpoint))
  }

  private async syncProfileData(id: string, userInfo: any): Promise<void> {
    let user = await this.userRepo.findById(id)
    if (user) {
      user.username = userInfo.name
      user.email = userInfo.email
      user.imagePath = userInfo.imagePath
      await this.userRepo.save(user)
    }
  }

  async execute(form: OIDCForm, provider: string): Promise<{accessToken: string, refreshToken: string}> {
    const code = AuthCode.from(form.code)

    const idp = this.switchIdP(provider)
    if (!idp) {
      throw new Error(`switchIdP: IdP not found`);
    }
    const res = await idp.trade(code)
    const userInfo = await idp.getUserInfo(res.access_token)

    const now = getUnixTimeMs()
    const {access, refresh} = await transaction(async (db) => {
      let userId
      let user = await this.userIdpRepo.findById(userInfo.id, provider)
      if (!user) {
        userId = UserId.create()
        await this.userRepo.save({
          id: userId.get(),
          username: userInfo.name,
          email: userInfo.email,
          password: null,
          imagePath: userInfo.imagePath,
          createdAt: now,
          updatedAt: now,
          withdrawnAt: null,
        })

        console.log("now: ", now)
        await this.userIdpRepo.save({
          id: UserIdpId.create().get(),
          userId: userId.get(),
          provider: provider,
          providerUserId: userInfo.providerUserId,
          imagePath: userInfo.imagePath,
          createdAt: now,
          updatedAt: now,
          withdrawnAt: null,
        })
      } else {
        userId = user.userId
        await this.syncProfileData(userId, userInfo)
      }

      const payload = { id: userId, idp: provider }
      const access = this.tokenService.generateAccessToken(payload)
      const refresh = this.tokenService.generateRefreshToken(payload)

      const key = `login-session:${userId}`
      const ttl = refresh.expiredAt - now
      await this.volatileDataRepositoryRedis.set(key, refresh.token, ttl)

      return {access, refresh}
    })

    return {
      accessToken: access.token,
      refreshToken: refresh.token,
    };
  }
}
