import type { GameRecord } from '../entity/GameRecord.ts';

export interface GameRecordRepository {
  save(record: GameRecord): Promise<void>;
  findByUserId(
    userId: string,
    options?: { limit?: number; offset?: number },
  ): Promise<GameRecord[]>;
}
