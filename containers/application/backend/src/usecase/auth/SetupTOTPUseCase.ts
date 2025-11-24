import { config } from "../../conf.ts";
import { TokenService } from "./TokenService.ts";
import { UserRepository } from "../../domain/user/repository/UserRepository.ts";
import { SetupTOTPForm } from "../../domain/auth/form/SetupTOTPForm.ts";
import { User2faRepository } from "../../domain/user/repository/User2faRepository.ts";

export class SetupTOTPUseCase {
  constructor(
    private userRepo: UserRepository,
    private tokenService: TokenService,
    private user2faRepository: User2faRepository,
  ) {}

  async execute(form: SetupTOTPForm): Promise<{}> {
    const payload = this.tokenService.verifyToken(form.tmpAuthToken, config.auth.jwtTmpAuthSecret)
    if (typeof payload === "string" || !('id' in payload)) {
      console.warn("SetupTOTPUseCase: invald payload")
      throw new Error("Invalid refresh token.")
    }

    const user = await this.userRepo.findById(payload.id)
    if (!user) {
      console.warn("SetupTOTPUseCase: findById is failed.")
      throw new Error("User not found.")
    }

    const user_2fa = await this.user2faRepository.findById(user.id)
    if (!user_2fa || user_2fa.isTotpEnabled) {
      console.warn("SetupTOTPUseCase: findById is failed or already registered.")
      throw new Error("execute failed.")
    }
    
    // TOTP用秘密鍵の生成


    // QRの生成
    throw new Error("")
  }
}
