import { getDb } from '../../db.ts';
import type { Database } from 'sqlite';
import type { UserBlockRepository } from '../../../../domain/block/repository/UserBlockRepository.ts';
import type { UserBlock } from '../../../../domain/block/entity/UserBlock.ts';

export class UserBlockRepositorySqlite implements UserBlockRepository {
  private get db(): Database {
    return getDb();
  }

  private scan(row: any): UserBlock {
    return {
      id: row.id,
      blockerId: row.blocker_id,
      blockedId: row.blocked_id,
      createdAt: row.created_at,
    };
  }

  async save(block: UserBlock): Promise<void> {
    await this.db.run(
      `INSERT INTO user_blocks (id, blocker_id, blocked_id, created_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(blocker_id, blocked_id) DO UPDATE SET
         created_at = excluded.created_at`,
      [block.id, block.blockerId, block.blockedId, block.createdAt]
    );
  }

  async delete(blockerId: string, blockedId: string): Promise<void> {
    await this.db.run(`DELETE FROM user_blocks WHERE blocker_id = ? AND blocked_id = ?`, [blockerId, blockedId]);
  }

  async findByBlockerId(blockerId: string): Promise<UserBlock[]> {
    const rows = await this.db.all(`SELECT * FROM user_blocks WHERE blocker_id = ?`, [blockerId]);
    return rows.map((row) => this.scan(row));
  }

  async isBlocked(blockerId: string, blockedId: string): Promise<boolean> {
    const row = await this.db.get(
      `SELECT 1 FROM user_blocks WHERE blocker_id = ? AND blocked_id = ?`,
      [blockerId, blockedId]
    );
    return row !== undefined;
  }
}
