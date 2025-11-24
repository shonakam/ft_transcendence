import { config } from "../../conf.ts";
import { TokenService } from "./TokenService.ts";
import { UserRepository } from "../../domain/user/repository/UserRepository.ts";
import { VolatileDataRepositoryRedis } from "../../infra/redis/repository/VolatileDataRepositoryRedis.ts";

export class RefreshUseCase {
  constructor(
    private volatileDataRepositoryRedis: VolatileDataRepositoryRedis,
    private userRepo: UserRepository,
    private tokenService: TokenService,
  ) {}

  async execute(refresh: string): Promise<{accessToken: string, refreshToken: string}> {
    const payload = this.tokenService.verifyToken(refresh, config.auth.jwtRefreshSecret);
    if (typeof payload === "string" || !('id' in payload)) {
      console.warn("RefreshUseCase: invald payload")
      throw new Error("Invalid refresh token.")
    }

    const user = await this.userRepo.findById(payload.id)
    if (!user) {
      console.warn("RefreshUseCase: findById is failed.")
      throw new Error("User not found.")
    }

    const key = `session:refresh:${user.id}`
    const value = await this.volatileDataRepositoryRedis.get(key)
    
    if (!value) {
      throw new Error("Session expired or invalid.")
    }
  
    const rePayload = { id: user.id } // TODO: Define VO
    const access = this.tokenService.generateAccessToken(rePayload)

    return {
      accessToken: access.token,
      refreshToken: refresh,
    };
  }
}
