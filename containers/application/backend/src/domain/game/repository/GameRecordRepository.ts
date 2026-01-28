import type { GameRecord } from '../entity/GameRecord.ts';

export interface UserWinRate {
  userId: string;
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number; // 0-100 percentage
}

export interface GameRecordRepository {
  save(record: GameRecord): Promise<void>;
  findByUserId(
    userId: string,
    options?: { limit?: number; offset?: number },
  ): Promise<GameRecord[]>;
  getWinRateByUserId(userId: string): Promise<UserWinRate>;
}
