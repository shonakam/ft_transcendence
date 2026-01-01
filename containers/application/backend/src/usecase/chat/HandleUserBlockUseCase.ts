import type { UserBlockRepository } from '../../domain/block/repository/UserBlockRepository.ts';
import { uuidv4 } from '../../utils/uuidv4.ts';
import { getUnixTimeSec } from '../../utils/unixtime.ts';

export class HandleUserBlockUseCase {
  constructor(private userBlockRepository: UserBlockRepository) {}

  async block(blockerId: string, blockedId: string): Promise<void> {
    if (blockerId === blockedId) throw new Error('Cannot block yourself');
    await this.userBlockRepository.save({
      id: uuidv4(),
      blockerId,
      blockedId,
      createdAt: getUnixTimeSec(),
    });
  }

  async unblock(blockerId: string, blockedId: string): Promise<void> {
    await this.userBlockRepository.delete(blockerId, blockedId);
  }

  async getBlockedUsers(blockerId: string): Promise<string[]> {
    const blocks = await this.userBlockRepository.findByBlockerId(blockerId);
    return blocks.map((b) => b.blockedId);
  }
}
