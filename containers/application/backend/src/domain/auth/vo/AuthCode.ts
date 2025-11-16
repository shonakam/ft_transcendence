export class AuthCode {
  private constructor(private readonly value: string) {}

  static from(value: string | undefined | null): AuthCode {
    if (value === undefined || value === null) {
      throw new Error('Authorization code must be provided.');
    }

    if (typeof value !== 'string') {
      throw new Error('Authorization code must be a string.');
    }

    if (value.trim() === '') {
      throw new Error('Authorization code cannot be empty.');
    }

    return new AuthCode(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: AuthCode): boolean {
    return this.value === other.value;
  }
}
