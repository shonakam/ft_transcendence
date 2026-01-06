import { uuidv4 } from '../../../utils/uuidv4.ts';

export default class ChatRoomMemberId {
  private constructor(private readonly value: string) {}

  static create(): ChatRoomMemberId {
    return new ChatRoomMemberId(uuidv4());
  }

  static from(value: string): ChatRoomMemberId {
    return new ChatRoomMemberId(value);
  }

  get(): string {
    return this.value;
  }

  equals(other: ChatRoomMemberId): boolean {
    return this.value === other.value;
  }
}
