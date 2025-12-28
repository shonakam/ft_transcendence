import { config } from "../../conf.ts";
import { VolatileDataRepositoryRedis } from "../../infra/redis/repository/VolatileDataRepositoryRedis.ts";
import { UserRepository } from "../../domain/user/repository/UserRepository.ts";
import { TokenService } from "./TokenService.ts";
import { User2faRepository } from "../../domain/user/repository/User2faRepository.ts";
import { VerifyTOTPForm } from "../../domain/auth/form/VerifyTOTPForm.ts";
import speakeasy from 'speakeasy';
import { getUnixTimeMs } from "../../utils/unixtime.ts";
import { RefreshToken } from "../../domain/auth/vo/RefreshToken.ts";

export class VerifyTOTPUseCase {
  constructor(
    private volatileDataRepositoryRedis: VolatileDataRepositoryRedis,
    private userRepo: UserRepository,
    private tokenService: TokenService,
    private user2faRepository: User2faRepository,
  ) {}

  async execute(form: VerifyTOTPForm): Promise<{accessToken: string, refreshToken: string}> {
    const payload = this.tokenService.verifyToken(form.tmpAuthToken, config.auth.jwtTmpAuthSecret)
    if (typeof payload === "string" || !('sub' in payload) || !payload.sub) {
      console.warn("VerifyTOTPUseCase: invald payload")
      throw new Error("Invalid tmp auth token.")
    }

    const user2fa = await this.user2faRepository.findById(payload.sub)
    if (!user2fa?.totpSeceret) {
      console.warn("VerifyTOTPUseCase: findById is failed.")
      throw new Error("Not registered.")
    }

    if (!speakeasy.totp.verify({secret: user2fa.totpSeceret, token: form.code})) {
      console.warn("VerifyTOTPUseCase: invalid auth code.")
      throw new Error("Invalid auth code.")
    }

    if (!user2fa.isTotpEnabled) {
      user2fa.updatedAt = getUnixTimeMs()
      user2fa.isTotpEnabled = 1
      await this.user2faRepository.save(user2fa)
    }

    const loginPayload = { id: payload.sub }
    const access = this.tokenService.generateAccessToken(loginPayload)
    const refresh = this.tokenService.generateRefreshToken(loginPayload)

    const key = `session:refresh:${payload.sub}`
    const ttl = refresh.expiredAt - getUnixTimeMs()
    await this.volatileDataRepositoryRedis.set(key, refresh.token, ttl)

    return {
      accessToken: access.token,
      refreshToken: refresh.token,
    }
  }
}
