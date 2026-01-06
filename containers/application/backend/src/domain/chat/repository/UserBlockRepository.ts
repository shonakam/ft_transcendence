import type { UserBlock } from '../entity/UserBlock.ts';

export interface UserBlockRepository {
  save(block: UserBlock): Promise<void>;
  delete(blockerId: string, blockedId: string): Promise<void>;
  findBlockedUserIds(blockerId: string): Promise<string[]>;
  isBlocking(blockerId: string, blockedId: string): Promise<boolean>;
}
