import { uuidv4 } from '../../../utils/uuidv4.ts';

export default class MessageId {
  private constructor(private readonly value: string) {}

  static create(): MessageId {
    return new MessageId(uuidv4());
  }

  static from(value: string): MessageId {
    return new MessageId(value);
  }

  get(): string {
    return this.value;
  }

  equals(other: MessageId): boolean {
    return this.value === other.value;
  }
}
