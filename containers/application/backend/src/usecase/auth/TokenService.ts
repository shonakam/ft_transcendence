import jwt from 'jsonwebtoken';
import { config } from '../../conf.ts';
import UserId from '../../domain/user/vo/UserId.ts'
import { LoginSession } from '../../domain/auth/vo/LoginSession.ts';

export class TokenService {
  // --- configから秘密鍵とTTLを読み込む ---
  private readonly accessSecret: string = config.auth.jwtAccessSecret;
  private readonly refreshSecret: string = config.auth.jwtRefreshSecret;
  private readonly accessTokenTtlMs: number = config.auth.accessTokenTtlMs;   // 例: 900000 (15分)
  private readonly refreshTokenTtlMs: number = config.auth.refreshTokenTtlMs; // 例: 2592000000 (30日)

  constructor() {
    // 必須設定のチェック
    if (!this.accessSecret || !this.refreshSecret || !this.accessTokenTtlMs || !this.refreshTokenTtlMs) {
      throw new Error('JWTの秘密鍵またはTTLがconfigに設定されていません');
    }
  }

  public generateAccessToken(userId: UserId): LoginSession {
    const payload = { id: userId.toString() };
    const expiresInSeconds = this.accessTokenTtlMs / 1000;

    // ★ 1. JWTの生成ロジック
    const tokenString = jwt.sign(
      payload,
      this.accessSecret,
      { expiresIn: expiresInSeconds }
    );

    return AccessToken.create(tokenString, this.accessTokenTtlMs);
  }

  /**
   * 新しいリフレッシュトークン（JWT）を署名・生成し、VOとして返します
   */
  public generateRefreshToken(userId: UserId): RefreshToken {
    const payload = { id: userId.toString() };

    const expiresInSeconds = this.refreshTokenTtlMs / 1000;

    // ★ 1. JWTの生成ロジック
    const tokenString = jwt.sign(
      payload,
      this.refreshSecret,
      { expiresIn: expiresInSeconds }
    );

    // ★ 2. VOの生成
    return RefreshToken.create(tokenString, this.refreshTokenTtlMs);
  }
}