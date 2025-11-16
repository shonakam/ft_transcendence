import jwt from 'jsonwebtoken';
import UserId from '../../user/vo/UserId.ts';
import { config } from '../../../conf.ts';
import { AccessToken } from './AccessToken.ts';
import { RefreshToken } from './RefreshToken.ts';
import { getUnixTimeMs } from '../../../utils/unixtime.ts';

export class TokenService {
  public generateAccessToken(id: UserId): AccessToken {
    const ttlMs = config.auth.accessTokenTtlMs;
    const secret = config.auth.jwtAccessSecret;
    const payload = { id: id.get() };

    const tokenString = jwt.sign(payload, secret, { expiresIn: ttlMs / 1000 });

    return AccessToken.create(tokenString, getUnixTimeMs() + ttlMs); 
  }

  public generateRefreshToken(id: UserId): RefreshToken {
    const ttlMs = config.auth.refreshTokenTtlMs;
    const secret = config.auth.jwtRefreshSecret;
    const payload = { id: id.get() };

    const tokenString = jwt.sign(payload, secret, { expiresIn: ttlMs / 1000 });

    return RefreshToken.create(tokenString, getUnixTimeMs() + ttlMs);
  }
}