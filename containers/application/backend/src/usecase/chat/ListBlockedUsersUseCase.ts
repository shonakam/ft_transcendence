import type { UserBlockRepository } from '../../domain/chat/repository/UserBlockRepository.ts';

export class ListBlockedUsersUseCase {
  constructor(private userBlockRepo: UserBlockRepository) {}

  async execute(blockerId: string): Promise<string[]> {
    return this.userBlockRepo.findBlockedUserIds(blockerId);
  }
}
