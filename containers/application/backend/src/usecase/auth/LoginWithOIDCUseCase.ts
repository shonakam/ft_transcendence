import { config } from "../../conf.ts";
import { TokenService } from "./TokenService.ts";
import { UserRepository } from "../../domain/user/repository/UserRepository.ts";
import { VolatileDataRepositoryRedis } from "../../infra/redis/repository/VolatileDataRepositoryRedis.ts";
import { getUnixTimeMs } from "../../utils/unixtime.ts";
import { OIDCForm } from "../../domain/auth/form/OIDCForm.ts";
import { AuthCode } from "../../domain/auth/vo/AuthCode.ts";
import { IdP42Service } from "../../infra/idp/42.ts";
import { HttpClient } from "../../infra/http/client.ts";

interface IdpConfig {
  redirect_uri: string;
  providers: {
    [provider: string]: {
      endpoint: string;
      path: string;
      clientId: string;
      clientSecret: string;
    };
  };
}

export class LoginWithOIDCUseCase {
  constructor(
    private volatileDataRepositoryRedis: VolatileDataRepositoryRedis,
    private userRepo: UserRepository,
    private tokenService: TokenService,
  ) {}

  private switchIdP(provider: string) {
    const providerEndpoint = (config.auth.idp as IdpConfig).providers[provider]
    if (!providerEndpoint || !providerEndpoint.endpoint) {
      throw new Error(`switchIdP: IdP configuration or endpoint not found for provider: ${provider}`)
    }

    const cient = new HttpClient(providerEndpoint.endpoint)
    
    switch (provider) {
      case 'ft': return new IdP42Service(cient)
      // case 'google':
      // case 'github':
      default: throw new Error(`switchIdP: Unsupported provider: ${provider}`)
    }
  }

  async execute(form: OIDCForm, provider: string): Promise<{accessToken: string, refreshToken: string}> {
    const code = AuthCode.from(form.code)

    const idp = this.switchIdP(provider)
    const res = await idp.trade(code)
    const userInfo = await idp.getUserInfo(res.access_token)

    console.log("INFO: ", userInfo)
    
    throw new Error("== STOP ==")
    // return {
    //   accessToken: access.token,
    //   refreshToken: refresh.token,
    // };
  }
}
