import { config } from "../../conf.ts";
import { TokenService } from "./TokenService.ts";
import { UserRepository } from "../../domain/user/repository/UserRepository.ts";
import { VolatileDataRepositoryRedis } from "../../infra/redis/repository/VolatileDataRepositoryRedis.ts";
import { Verify2faForm } from "../../domain/auth/form/Verify2faForm.ts";

export class Verify2faUseCase {
  constructor(
    private volatileDataRepositoryRedis: VolatileDataRepositoryRedis,
    private userRepo: UserRepository,
    private tokenService: TokenService,
  ) {}

  async execute(form: Verify2faForm, foctor: string): Promise<{accessToken: string, refreshToken: string}> {
    throw new Error("")
  }
}
