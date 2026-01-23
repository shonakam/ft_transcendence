import type { Database } from 'sqlite';
import { getDb, transaction } from '../../../sqlite/db.ts';
import type { GameRecordRepository } from '../../../../domain/game/repository/GameRecordRepository.ts';
import type { GameRecord } from '../../../../domain/game/entity/GameRecord.ts';

export class GameRecordRepositorySqlite implements GameRecordRepository {
  private get db(): Database {
    return getDb();
  }

  private scan(row: any): GameRecord {
    return {
      id: row.id,
      gameId: row.game_id,
      userId: row.user_id,
      alias: row.alias,
      score: row.score,
      isWinner: Boolean(row.is_winner),
      side: row.side,
      endedAt: row.ended_at,
      createdAt: row.created_at,
    };
  }

  async saveMany(records: GameRecord[]): Promise<void> {
    await transaction(async (db) => {
      for (const record of records) {
        await db.run(
          `INSERT INTO game_records (game_id, user_id, alias, score, is_winner, side, ended_at, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            record.gameId,
            record.userId,
            record.alias,
            record.score,
            record.isWinner ? 1 : 0,
            record.side,
            record.endedAt,
            record.createdAt,
          ],
        );
      }
    });
  }

  async findByUserId(
    userId: string,
    options?: { limit?: number; offset?: number },
  ): Promise<GameRecord[]> {
    const limit = options?.limit ?? 20;
    const offset = options?.offset ?? 0;

    const rows = await this.db.all(
      `SELECT * FROM game_records WHERE user_id = ?
       ORDER BY ended_at DESC, id DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset],
    );
    return rows.map((row: any) => this.scan(row));
  }
}
