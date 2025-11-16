import { TokenService } from "./TokenService.ts";

export class AccessToken {
  private constructor(
    public readonly token: string,
    public readonly expiredAt: number
  ) {}

  static create(token: string, ttlMs: number): AccessToken {
    return new AccessToken(token, ttlMs);
  }
}
