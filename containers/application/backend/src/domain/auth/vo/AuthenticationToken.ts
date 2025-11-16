export abstract class AuthenticationToken {
  protected constructor(
    protected readonly token: string,
    protected readonly expiresAt: number,
  ) {}

  isValid(): boolean {
    return Date.now() < this.expiresAt;
  }

  getToken(): string {
    return this.token;
  }
}
