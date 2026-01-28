import { GameRecordRepositorySqlite } from '../infra/sqlite/repository/game/GameRecordRepositorySqlite.ts';
import { SaveGameResultUseCase } from '../usecase/game/SaveGameResultUseCase.ts';
import { ListGameRecordsUseCase } from '../usecase/game/ListGameRecordsUseCase.ts';
import type { GameRecordRepository } from '../domain/game/repository/GameRecordRepository.ts';

export interface GameUseCases {
  saveGameResult: SaveGameResultUseCase;
  listGameRecords: ListGameRecordsUseCase;
  gameRecordRepository: GameRecordRepository;
}

export async function initGameUseCases(): Promise<GameUseCases> {
  const gameRecordRepo = new GameRecordRepositorySqlite();

  return {
    saveGameResult: new SaveGameResultUseCase(gameRecordRepo),
    listGameRecords: new ListGameRecordsUseCase(gameRecordRepo),
    gameRecordRepository: gameRecordRepo,
  };
}
