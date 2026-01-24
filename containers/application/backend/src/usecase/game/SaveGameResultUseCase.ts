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

  async execute(input: SaveGameResultInput): Promise<GameRecord[]> {
    const gameId = input.gameId ?? randomUUID();
    const endedAt = input.endedAt ?? Date.now();
    const createdAt = Date.now();

    const leftRecord: GameRecord = {
      gameId,
      userId: input.leftUserId,
      alias: input.leftAlias ?? null,
      score: input.leftScore,
      isWinner: input.winner === 'left',
      side: 'left',
      endedAt,
      createdAt,
    };

    const rightRecord: GameRecord = {
      gameId,
      userId: input.rightUserId,
      alias: input.rightAlias ?? null,
      score: input.rightScore,
      isWinner: input.winner === 'right',
      side: 'right',
      endedAt,
      createdAt,
    };

    await this.repo.saveMany([leftRecord, rightRecord]);
    return [leftRecord, rightRecord];
  }
}
