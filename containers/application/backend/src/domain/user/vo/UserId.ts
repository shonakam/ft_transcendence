import { uuidv4 } from '../../../utils/uuidv4.ts';

export default class UserId {
  private constructor(private readonly value: string) {}

  static create(): UserId {
    return new UserId(uuidv4());
  }

  static from(value: string): UserId {
    return new UserId(value);
  }

  get(): string {
    return this.value;
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }
}
