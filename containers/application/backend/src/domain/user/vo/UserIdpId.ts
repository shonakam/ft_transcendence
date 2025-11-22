import { uuidv4 } from '../../../utils/uuidv4.ts';

export default class UserIdpId {
  private constructor(private readonly value: string) {}

  static create(): UserIdpId {
    return new UserIdpId(uuidv4());
  }

  static from(value: string): UserIdpId {
    return new UserIdpId(value);
  }

  get(): string {
    return this.value;
  }

  equals(other: UserIdpId): boolean {
    return this.value === other.value;
  }
}
