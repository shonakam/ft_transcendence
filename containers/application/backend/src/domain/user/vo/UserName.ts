export default class UserName {
  private constructor(private readonly value: string) {}

  static create(name: string): UserName {
    const trimmed = name.trim();
    if (!/^[a-zA-Z0-9]{1,20}$/.test(trimmed)) {
      throw new Error('Invalid username: must be 1-20 alphanumeric characters');
    }
    return new UserName(trimmed);
  }

  get(): string {
    return this.value;
  }

  equals(other: UserName): boolean {
    return this.value === other.value;
  }
}
