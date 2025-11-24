import { LoginForm } from "../../domain/auth/form/LoginForm.ts";
import { TokenService } from "./TokenService.ts";
import { UserRepository } from "../../domain/user/repository/UserRepository.ts";
import Password from "../../domain/user/vo/Password.ts";
import { VolatileDataRepositoryRedis } from "../../infra/redis/repository/VolatileDataRepositoryRedis.ts";
import { getUnixTimeMs } from "../../utils/unixtime.ts";

export class LoginUseCase {
  constructor(
    private volatileDataRepositoryRedis: VolatileDataRepositoryRedis,
    private userRepo: UserRepository,
    private tokenService: TokenService,
  ) {}

  private async generateTmpToken() {

  }

  private async issueTokenAndSotoreToken(id: string) {
    const payload = { id: id } // TODO: Define VO
    const access = this.tokenService.generateAccessToken(payload)
    const refresh = this.tokenService.generateRefreshToken(payload)

    const key = `session:refresh:${id}`
    const ttl = refresh.expiredAt - getUnixTimeMs()
    await this.volatileDataRepositoryRedis.set(key, refresh.token, ttl)
    return {
      accessToken: access.token,
      refreshToken: refresh.token,
    }
  }

  async execute(form: LoginForm): Promise<{accessToken: string, refreshToken: string} | string> {
    const user = await this.userRepo.findByEmail(form.email)
    if (!user) {
      console.warn("LoginUseCase: findByEmail is failed.")
      throw new Error("Invalid email or password.")
    }

    if (!Password.compare(form.password, user.password!)) {
      console.warn("LoginUseCase: Password compare is failed.")
      throw new Error("Invalid email or password.")
    }

    if (user.is2faEnabled) {
      throw new Error()
      // return this.generateTmpToken()
    } else {
      return this.issueTokenAndSotoreToken(user.id)
    }
  }
}
