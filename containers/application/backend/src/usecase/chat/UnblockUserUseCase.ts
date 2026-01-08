import type { UserBlockRepository } from '../../domain/chat/repository/UserBlockRepository.ts';

export class UnblockUserUseCase {
  constructor(private userBlockRepo: UserBlockRepository) {}

  async execute(blockerId: string, blockedId: string): Promise<void> {
    await this.userBlockRepo.delete(blockerId, blockedId);
  }
}
