export class RefreshToken {
  private constructor(
    public readonly token: string,
    public readonly expiredAt: number,
  ) {}

  static create(token: string, ttlMs: number): RefreshToken {
    return new RefreshToken(token, ttlMs);
  }
}
