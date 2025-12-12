import { LoginForm } from "../../domain/auth/form/LoginForm.ts";
import { TokenService } from "./TokenService.ts";
import { UserRepository } from "../../domain/user/repository/UserRepository.ts";
import Password from "../../domain/user/vo/Password.ts";
import { VolatileDataRepositoryRedis } from "../../infra/redis/repository/VolatileDataRepositoryRedis.ts";
import { getUnixTimeMs } from "../../utils/unixtime.ts";

export interface LoginResponse {
  accessToken: string | null
  refreshToken: string | null
  tmpAuthToken: string | null
}

export class LoginUseCase {
  constructor(
    private volatileDataRepositoryRedis: VolatileDataRepositoryRedis,
    private userRepo: UserRepository,
    private tokenService: TokenService,
  ) {}

  private async generateTmpToken(id: string): Promise<LoginResponse> {
    const payload = { sub: id }
    const tmpAuth = this.tokenService.generateTmpAuthToken(payload)
    return {
      accessToken: null,
      refreshToken: null,
      tmpAuthToken: tmpAuth.token
    }
  }

  private async issueTokenAndSotoreToken(id: string): Promise<LoginResponse> {
    const payload = { id: id } // TODO: Define VO
    const access = this.tokenService.generateAccessToken(payload)
    const refresh = this.tokenService.generateRefreshToken(payload)

    const key = `session:refresh:${id}`
    const ttl = refresh.expiredAt - getUnixTimeMs()
    await this.volatileDataRepositoryRedis.set(key, refresh.token, ttl)
    return {
      accessToken: access.token,
      refreshToken: refresh.token,
      tmpAuthToken: null
    }
  }

  async execute(form: LoginForm): Promise<LoginResponse> {
    const user = await this.userRepo.findByEmail(form.email)
    if (!user) {
      console.warn("LoginUseCase: findByEmail is failed.")
      throw new Error("Invalid email or password.")
    }

    if (!Password.compare(form.password, user.password!)) {
      console.warn("LoginUseCase: Password compare is failed.")
      throw new Error("Invalid email or password.")
    }

    console.log("user: ", user)
    return (user.is2faEnabled == 1)
      ? this.generateTmpToken(user.id)
      : this.issueTokenAndSotoreToken(user.id)
  }
}
