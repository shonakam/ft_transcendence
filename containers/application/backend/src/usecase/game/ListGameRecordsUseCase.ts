import type { GameRecordRepository } from '../../domain/game/repository/GameRecordRepository.ts';
import type { GameRecord } from '../../domain/game/entity/GameRecord.ts';

export class ListGameRecordsUseCase {
  constructor(private repo: GameRecordRepository) {}

  async execute(
    userId: string,
    options?: { limit?: number; offset?: number },
  ): Promise<GameRecord[]> {
    return this.repo.findByUserId(userId, options);
  }
}
