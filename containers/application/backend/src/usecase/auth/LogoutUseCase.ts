import { config } from "../../conf.ts";
import { TokenService } from "./TokenService.ts";
import { UserRepository } from "../../domain/user/repository/UserRepository.ts";
import { VolatileDataRepositoryRedis } from "../../infra/redis/repository/VolatileDataRepositoryRedis.ts";

export class LogoutUseCase {
  constructor(
    private volatileDataRepositoryRedis: VolatileDataRepositoryRedis,
    private userRepo: UserRepository,
    private tokenService: TokenService,
  ) {}

  async execute(access: string): Promise<void> {
    const payload = this.tokenService.verifyToken(access, config.auth.jwtAccessSecret);
    if (typeof payload === "string" || !('id' in payload)) {
      console.warn("LogoutUseCase: invald payload")
      throw new Error("Invalid refresh token.")
    }

    const user = await this.userRepo.findById(payload.id)
    if (!user) {
      console.warn("LogoutUseCase: findById is failed.")
      throw new Error("User not found.")
    }

    const key = `session:refresh:${user.id}`
    await this.volatileDataRepositoryRedis.delete(key)
  }
}
