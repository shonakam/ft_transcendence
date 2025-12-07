import { config } from "../../conf.ts";
import { VolatileDataRepositoryRedis } from "../../infra/redis/repository/VolatileDataRepositoryRedis.ts";
import { UserRepository } from "../../domain/user/repository/UserRepository.ts";
import { TokenService } from "./TokenService.ts";
import { User2faRepository } from "../../domain/user/repository/User2faRepository.ts";
import { VerifyTOTPForm } from "../../domain/auth/form/VerifyTOTPForm.ts";
import speakeasy from 'speakeasy';
import { getUnixTimeMs } from "../../utils/unixtime.ts";
import { RefreshToken } from "../../domain/auth/vo/RefreshToken.ts";
import UserId from "../../domain/user/vo/UserId.ts";
import { transaction } from "../../infra/sqlite/db.ts";

export class RevokeTOTPUseCase {
  constructor(
    private userRepo: UserRepository,
    private user2faRepository: User2faRepository,
  ) {}

  async execute(id: UserId): Promise<void> {
    const user = await this.userRepo.findById(id.get())
    if (!user) {
      console.warn("RevokeTOTPUseCase: findByEmail is failed.")
      throw new Error("Invalid email or password.")
    }

    const user2fa = await this.user2faRepository.findById(id.get())
    if (!user2fa?.totpSeceret) {
      console.warn("RevokeTOTPUseCase: findById is failed.")
      throw new Error("Not registered.")
    }

    await transaction(async (db) => {
      try {
        user.is2faEnabled = 0
        await this.userRepo.save(user)

        user2fa.isTotpEnabled = 0
        user2fa.totpSeceret = ""
        await this.user2faRepository.save(user2fa)
      } catch (e) {
        console.error(`RevokeTOTPUseCase: transaction error ${e}`)
        throw new Error(`RevokeTOTPUseCase: transaction error ${e}`)
      }
    })

  }
}
