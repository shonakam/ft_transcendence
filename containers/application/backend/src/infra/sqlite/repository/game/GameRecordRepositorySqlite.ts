import type { Database } from 'sqlite';
import { getDb, transaction } from '../../../sqlite/db.ts';
import type {
  GameRecordRepository,
  UserWinRate,
} from '../../../../domain/game/repository/GameRecordRepository.ts';
import type { GameRecord } from '../../../../domain/game/entity/GameRecord.ts';

export class GameRecordRepositorySqlite implements GameRecordRepository {
  private get db(): Database {
    return getDb();
  }

  private scan(row: any): GameRecord {
    return {
      id: row.id,
      gameId: row.game_id,
      leftUserId: row.left_user_id,
      rightUserId: row.right_user_id,
      leftAlias: row.left_alias,
      rightAlias: row.right_alias,
      leftPoint: row.left_point,
      rightPoint: row.right_point,
      winnerId: row.winner_id,
      startedAt: row.started_at,
      endedAt: row.ended_at,
      createdAt: row.created_at,
    };
  }

  async save(record: GameRecord): Promise<void> {
    await this.db.run(
      `INSERT INTO game_records (game_id, left_user_id, right_user_id, left_alias, right_alias, left_point, right_point, winner_id, started_at, ended_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        record.gameId,
        record.leftUserId,
        record.rightUserId,
        record.leftAlias ?? null,
        record.rightAlias ?? null,
        record.leftPoint,
        record.rightPoint,
        record.winnerId,
        record.startedAt,
        record.endedAt,
        record.createdAt,
      ],
    );
  }

  async findByUserId(
    userId: string,
    options?: { limit?: number; offset?: number },
  ): Promise<GameRecord[]> {
    const limit = options?.limit ?? 20;
    const offset = options?.offset ?? 0;

    const rows = await this.db.all(
      `SELECT * FROM game_records WHERE left_user_id = ? OR right_user_id = ?
       ORDER BY ended_at DESC, id DESC
       LIMIT ? OFFSET ?`,
      [userId, userId, limit, offset],
    );
    return rows.map((row: any) => this.scan(row));
  }

  async getWinRateByUserId(userId: string): Promise<UserWinRate> {
    const row = await this.db.get(
      `SELECT
        COUNT(*) as total_games,
        SUM(CASE WHEN winner_id = ? THEN 1 ELSE 0 END) as wins
       FROM game_records
       WHERE (left_user_id = ? OR right_user_id = ?)
         AND NOT (left_user_id LIKE 'anon:%' AND right_user_id LIKE 'anon:%')`,
      [userId, userId, userId],
    );

    const totalGames = row?.total_games ?? 0;
    const wins = row?.wins ?? 0;
    const losses = totalGames - wins;
    const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

    return {
      userId,
      totalGames,
      wins,
      losses,
      winRate,
    };
  }
}
