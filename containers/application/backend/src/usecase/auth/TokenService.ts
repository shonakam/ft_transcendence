import jwt from 'jsonwebtoken';
import { config } from '../../conf.ts';
import { AccessToken } from '../../domain/auth/vo/AccessToken.ts';
import { RefreshToken } from '../../domain/auth/vo/RefreshToken.ts';
import { getUnixTimeMs } from '../../utils/unixtime.ts';

export class TokenService {
  public generateAccessToken(payload: {}): AccessToken {
    const ttlMs = config.auth.accessTokenTtlMs;
    const secret = config.auth.jwtAccessSecret;

    const tokenString = jwt.sign(payload, secret, { expiresIn: ttlMs / 1000 });

    return AccessToken.create(tokenString, getUnixTimeMs() + ttlMs); 
  }

  public generateRefreshToken(payload: {}): RefreshToken {
    const ttlMs = config.auth.refreshTokenTtlMs;
    const secret = config.auth.jwtRefreshSecret;

    const tokenString = jwt.sign(payload, secret, { expiresIn: ttlMs / 1000 });

    return RefreshToken.create(tokenString, getUnixTimeMs() + ttlMs);
  }
}