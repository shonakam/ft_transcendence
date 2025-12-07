import { config } from "../../conf.ts";
import { HttpClient, FetchError } from "../http/client.ts";
import { AuthCode } from "../../domain/auth/vo/AuthCode.ts";

type IdP42Response = {
  access_token: string,
  token_type: string,
  expires_in: number,
  scope: string,
  created_at: number
}

export class IdP42Service {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly clientId = config.auth.idp.providers.ft.clientId,
    private readonly clientSecret = config.auth.idp.providers.ft.clientSecret,
  ) {}
  
  // https://api.intra.42.fr/apidoc/2.0/cursus_users/index.html
  public async trade(code: AuthCode): Promise<IdP42Response> {
    const data = {
      grant_type: 'authorization_code',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code: code.toString(),
      redirect_uri: config.auth.idp.redirect_uri,
    };

    try {
      const response = await this.httpClient.postForm<IdP42Response>(
        config.auth.idp.providers.ft.path,
        data
      );
      return response;  
    } catch (error) {
      if (error instanceof FetchError) {
        console.error(`IdP42Service.trade :42 API Error (${error.status}):`, error.data);
        throw new Error(`トークン交換中にAPIエラーが発生しました: ${error.status}`);
      }      
      console.error('Network or Timeout Error:', error);
      throw new Error('トークン交換中にネットワークエラーが発生しました。');
    }
  }

  public async getUserInfo(accessToken: string): Promise<any> { // TODO: レスポンスをエンティティにする
    const config: RequestInit = {headers: {'Authorization': `Bearer ${accessToken}`}};
    
    const rawUserInfo = await this.httpClient.get('/v2/me', config);
    const userInfo = {
      name: rawUserInfo.login,
      email: rawUserInfo.email,
      imagePath: rawUserInfo.image.link,
      providerUserId: rawUserInfo.id.toString(),
    };

    return userInfo
  }
}
