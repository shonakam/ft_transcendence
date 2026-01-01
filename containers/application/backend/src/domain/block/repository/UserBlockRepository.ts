import type { UserBlock } from '../entity/UserBlock.ts';

export interface UserBlockRepository {
  save(block: UserBlock): Promise<void>;
  delete(blockerId: string, blockedId: string): Promise<void>;
  findByBlockerId(blockerId: string): Promise<UserBlock[]>;
  isBlocked(blockerId: string, blockedId: string): Promise<boolean>;
}
