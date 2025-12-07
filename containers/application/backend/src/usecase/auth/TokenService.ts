import jwt from 'jsonwebtoken';
import { config } from '../../conf.ts';
import { AccessToken } from '../../domain/auth/vo/AccessToken.ts';
import { RefreshToken } from '../../domain/auth/vo/RefreshToken.ts';
import { getUnixTimeMs } from '../../utils/unixtime.ts';
import { TmpAuthToken } from '../../domain/auth/vo/TmpAuthToken.ts';

export class TokenService {
  // https://datatracker.ietf.org/doc/html/rfc7519#section-4.1
  private payloadConfigure(payload: jwt.JwtPayload): jwt.JwtPayload {
    return payload = {
      iss: config.auth.issure,
      sub: payload.id,
      aud: config.auth.audience,
      // exp: number | undefined;
      // nbf: number | undefined;
      // iat: number | undefined;
      // jti: string | undefined;
    }
  }

  public generateAccessToken(payload: jwt.JwtPayload): AccessToken {
    const ttlMs = config.auth.accessTokenTtlMs;
    const secret = config.auth.jwtAccessSecret;

    payload = this.payloadConfigure(payload)
    const tokenString = jwt.sign(payload, secret, { expiresIn: ttlMs / 1000 });

    return AccessToken.create(tokenString, getUnixTimeMs() + ttlMs);
  }

  public generateRefreshToken(payload: jwt.JwtPayload): RefreshToken {
    const ttlMs = config.auth.refreshTokenTtlMs;
    const secret = config.auth.jwtRefreshSecret;

    const tokenString = jwt.sign(payload, secret, { expiresIn: ttlMs / 1000 });

    return RefreshToken.create(tokenString, getUnixTimeMs() + ttlMs);
  }

  public generateTmpAuthToken(payload: jwt.JwtPayload): TmpAuthToken {
    const ttlMs = config.auth.accessTokenTtlMs; // 期限はアクセストークンと同じ値を使用
    const secret = config.auth.jwtTmpAuthSecret;

    payload = this.payloadConfigure(payload)
    const tokenString = jwt.sign(payload, secret, { expiresIn: ttlMs / 1000 });
    return TmpAuthToken.create(tokenString, getUnixTimeMs() + ttlMs)
  }

  public verifyToken(token: string, secret: string): jwt.JwtPayload | string {
    try {
      return jwt.verify(token, secret);
    } catch (e) {
      throw new Error("Invalid token.");
    }
  }
}
