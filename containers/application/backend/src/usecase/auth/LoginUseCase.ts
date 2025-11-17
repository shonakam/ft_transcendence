import { LoginForm } from "../../domain/auth/form/LoginForm.ts";
import { TokenService } from "../../domain/auth/vo/TokenService.ts";
import { UserRepository } from "../../domain/user/repository/UserRepository.ts";
import Password from "../../domain/user/vo/Password.ts";
import UserId from "../../domain/user/vo/UserId.ts";

export class LoginUseCase {
  constructor(
    private userRepo: UserRepository,
    private tokenService: TokenService,
    // private authRepo: AuthRepository
  ) {} // using redis

  async execute(form: LoginForm): Promise<{accessToken: string, refreshToken: string}> {
    const user = await this.userRepo.findByEmail(form.email)
    if (!user) {
      console.warn("LoginUseCase: findByEmail is failed.")
      throw new Error("Invalid email or password.")
    }

    if (!Password.compare(form.password, user.password)) {
      console.warn("LoginUseCase: Password compare is failed.")
      throw new Error("Invalid email or password.")
    }

    const access = this.tokenService.generateAccessToken(UserId.from(user.id))
    const refresh = this.tokenService.generateRefreshToken(UserId.from(user.id))
    return {
      accessToken: access.token,
      refreshToken: refresh.token,
    };
  }
}
