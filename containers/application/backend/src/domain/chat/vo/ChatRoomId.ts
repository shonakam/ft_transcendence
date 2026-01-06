import { uuidv4 } from '../../../utils/uuidv4.ts';

export default class ChatRoomId {
  private constructor(private readonly value: string) {}

  static create(): ChatRoomId {
    return new ChatRoomId(uuidv4());
  }

  static from(value: string): ChatRoomId {
    return new ChatRoomId(value);
  }

  get(): string {
    return this.value;
  }

  equals(other: ChatRoomId): boolean {
    return this.value === other.value;
  }
}
