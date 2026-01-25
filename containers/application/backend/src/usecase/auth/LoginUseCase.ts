import { LoginForm } from '../../domain/auth/form/LoginForm.ts';
import { TokenService } from './TokenService.ts';
import { UserRepository } from '../../domain/user/repository/UserRepository.ts';
import Password from '../../domain/user/vo/Password.ts';
import { VolatileDataRepositoryRedis } from '../../infra/redis/repository/VolatileDataRepositoryRedis.ts';
import { getUnixTimeMs } from '../../utils/unixtime.ts';
import { User2faRepository } from '../../domain/user/repository/User2faRepository.ts';
import { JwtSecrets } from '../../infra/vault/vault.service.ts';
import { vaultService } from '../../main.ts';

export interface LoginResponse {
  accessToken: string | null;
  refreshToken: string | null;
  tmpAuthToken: string | null;
}

export class LoginUseCase {
  constructor(
    private volatileDataRepositoryRedis: VolatileDataRepositoryRedis,
    private userRepo: UserRepository,
    private tokenService: TokenService,
    private user2faRepository: User2faRepository,
  ) {}

  private async generateTmpToken(id: string): Promise<LoginResponse> {
    const payload = { id: id };
    const jwts: JwtSecrets = await vaultService.getJwtSecrets();
    const tmpAuth = this.tokenService.generateTmpAuthToken(payload, jwts.tmp_auth_secret);
    return {
      accessToken: null,
      refreshToken: null,
      tmpAuthToken: tmpAuth.token,
    };
  }

  private async issueTokenAndSotoreToken(id: string): Promise<LoginResponse> {
    const payload = { id: id }; // TODO: Define VO
    const jwts: JwtSecrets = await vaultService.getJwtSecrets();
    const access = this.tokenService.generateAccessToken(payload, jwts.access_secret);
    const refresh = this.tokenService.generateRefreshToken(payload, jwts.refresh_secret);

    const key = `session:refresh:${id}`;
    const ttl = refresh.expiredAt - getUnixTimeMs();
    await this.volatileDataRepositoryRedis.set(key, refresh.token, ttl);
    return {
      accessToken: access.token,
      refreshToken: refresh.token,
      tmpAuthToken: null,
    };
  }

  async execute(form: LoginForm): Promise<LoginResponse> {
    const user = await this.userRepo.findByEmail(form.email);
    if (!user) {
      console.warn('LoginUseCase: findByEmail is failed.');
      throw new Error('Invalid email or password.');
    }

    if (!Password.compare(form.password, user.password!)) {
      console.warn('LoginUseCase: Password compare is failed.');
      throw new Error('Invalid email or password.');
    }

    const user2fa = await this.user2faRepository.findById(user.id);
    // if (!user2fa?.totpSeceret) {
    //   console.warn("VerifyTOTPUseCase: findById is failed.")
    //   throw new Error("Not registered.")
    // }

    console.log('user: ', user);
    return user2fa!.isTotpEnabled == 1
      ? this.generateTmpToken(user.id)
      : this.issueTokenAndSotoreToken(user.id);
  }
}
