import { config } from "../../conf.ts";
import { TokenService } from "./TokenService.ts";
import { UserRepository } from "../../domain/user/repository/UserRepository.ts";
import { VolatileDataRepositoryRedis } from "../../infra/redis/repository/VolatileDataRepositoryRedis.ts";
import { VerifyTOTPForm } from "../../domain/auth/form/VerifyTOTPForm.ts";

export class Setup2faUseCase {
  constructor(
    private volatileDataRepositoryRedis: VolatileDataRepositoryRedis,
    private userRepo: UserRepository,
    private tokenService: TokenService,
  ) {}

  async execute(form: VerifyTOTPForm, foctor: string): Promise<{accessToken: string, refreshToken: string}> {
    // tmpTokenを検証 -> userIdの取得
    // TOTP用秘密鍵の生成
    // QRの生成
    throw new Error("")
  }
}
