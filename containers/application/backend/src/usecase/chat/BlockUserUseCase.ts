import type { UserBlockRepository } from '../../domain/chat/repository/UserBlockRepository.ts';
import type { UserBlock } from '../../domain/chat/entity/UserBlock.ts';

export class BlockUserUseCase {
  constructor(private userBlockRepo: UserBlockRepository) {}

  async execute(blockerId: string, blockedId: string): Promise<void> {
    if (blockerId === blockedId) {
      throw new Error('Cannot block yourself');
    }

    const block: UserBlock = {
      blockerId,
      blockedId,
      createdAt: Math.floor(Date.now() / 1000),
    };

    await this.userBlockRepo.save(block);
  }
}
