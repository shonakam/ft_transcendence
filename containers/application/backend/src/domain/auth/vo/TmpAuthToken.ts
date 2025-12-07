export class TmpAuthToken {
  private constructor(
    public readonly token: string,
    public readonly expiredAt: number
  ) {}

  static create(token: string, ttlMs: number): TmpAuthToken {
    return new TmpAuthToken(token, ttlMs);
  }
}
