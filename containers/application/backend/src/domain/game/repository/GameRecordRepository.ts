import type { GameRecord } from '../entity/GameRecord.ts';

export interface GameRecordRepository {
  saveMany(records: GameRecord[]): Promise<void>;
  findByUserId(
    userId: string,
    options?: { limit?: number; offset?: number },
  ): Promise<GameRecord[]>;
}
