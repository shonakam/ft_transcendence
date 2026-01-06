import { uuidv4 } from '../../../utils/uuidv4.ts';

export default class UserBlockId {
  private constructor(private readonly value: string) {}

  static create(): UserBlockId {
    return new UserBlockId(uuidv4());
  }

  static from(value: string): UserBlockId {
    return new UserBlockId(value);
  }

  get(): string {
    return this.value;
  }

  equals(other: UserBlockId): boolean {
    return this.value === other.value;
  }
}
