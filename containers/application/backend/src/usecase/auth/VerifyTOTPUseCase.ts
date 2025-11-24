import { config } from "../../conf.ts";
import { TokenService } from "./TokenService.ts";
import { UserRepository } from "../../domain/user/repository/UserRepository.ts";
import { VolatileDataRepositoryRedis } from "../../infra/redis/repository/VolatileDataRepositoryRedis.ts";
import { VerifyTOTPForm } from "../../domain/auth/form/VerifyTOTPForm.ts";

export class VerifyTOTPUseCase {
  constructor(
    private volatileDataRepositoryRedis: VolatileDataRepositoryRedis,
    private userRepo: UserRepository,
    private tokenService: TokenService,
    
  ) {}

  async execute(form: VerifyTOTPForm, foctor: string): Promise<{accessToken: string, refreshToken: string}> {
    throw new Error("")
  }
}
