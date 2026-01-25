import { randomUUID } from 'crypto';
import type { GameRecordRepository } from '../../domain/game/repository/GameRecordRepository.ts';
import type { GameRecord } from '../../domain/game/entity/GameRecord.ts';

type WinnerSide = 'left' | 'right';

export interface SaveGameResultInput {
  gameId?: string;
  leftUserId: string;
  rightUserId: string;
  leftAlias?: string | null;
  rightAlias?: string | null;
  leftScore: number;
  rightScore: number;
  winner: WinnerSide;
  endedAt?: number;
}

export class SaveGameResultUseCase {
  constructor(private repo: GameRecordRepository) {}

  async execute(input: SaveGameResultInput): Promise<GameRecord> {
    const gameId = input.gameId ?? randomUUID();
    const endedAt = input.endedAt ?? Date.now();
    const createdAt = Date.now();

    const record: GameRecord = {
      gameId,
      leftUserId: input.leftUserId,
      rightUserId: input.rightUserId,
      leftPoint: input.leftScore,
      rightPoint: input.rightScore,
      winnerId: input.winner === 'left' ? input.leftUserId : input.rightUserId,
      endedAt,
      createdAt,
    };

    await this.repo.save(record);
    return record;
  }
}
