import type { Database } from 'sqlite';
import { getDb } from '../../db.ts';
import { UserRelationshipRepository } from '../../../../domain/user/repository/UserRelationshipRepository.ts';
import { UserRelationship } from '../../../../domain/user/entity/UserRelationship.ts';

export class SQLiteUserRelationshipRepository implements UserRelationshipRepository {
  private get db(): Database {
    return getDb();
  }

  async save(relationship: UserRelationship): Promise<void> {
    const query = `
      INSERT INTO user_relationships (user_id, target_id, type, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, target_id) DO UPDATE SET
        status = excluded.status,
        updated_at = excluded.updated_at
    `;
    await this.db.run(query, [
      relationship.userId,
      relationship.targetId,
      relationship.type,
      relationship.status,
      relationship.createdAt,
      relationship.updatedAt,
    ]);
  }

  async findByUserIdAndTargetId(
    userId: string,
    targetId: string,
  ): Promise<UserRelationship | null> {
    const query = `
      SELECT * FROM user_relationships WHERE user_id = ? AND target_id = ?
    `;
    const row: any = await this.db.get(query, [userId, targetId]);
    if (!row) return null;
    return new UserRelationship({
      userId: row.user_id,
      targetId: row.target_id,
      type: row.type as 'friend',
      status: row.status as 'pending' | 'accepted',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  async findByUserIdAndStatus(
    userId: string,
    status: 'pending' | 'accepted',
  ): Promise<UserRelationship[]> {
    const query = `
      SELECT * FROM user_relationships WHERE user_id = ? AND status = ?
    `;
    const rows: any[] = await this.db.all(query, [userId, status]);
    return rows.map(
      (row) =>
        new UserRelationship({
          userId: row.user_id,
          targetId: row.target_id,
          type: row.type as 'friend',
          status: row.status as 'pending' | 'accepted',
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }),
    );
  }

  async findByTargetIdAndStatus(
    targetId: string,
    status: 'pending' | 'accepted',
  ): Promise<UserRelationship[]> {
    const query = `
      SELECT * FROM user_relationships WHERE target_id = ? AND status = ?
    `;
    const rows: any[] = await this.db.all(query, [targetId, status]);
    return rows.map(
      (row) =>
        new UserRelationship({
          userId: row.user_id,
          targetId: row.target_id,
          type: row.type as 'friend',
          status: row.status as 'pending' | 'accepted',
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }),
    );
  }

  async updateStatus(
    userId: string,
    targetId: string,
    status: 'accepted',
  ): Promise<void> {
    const query = `
      UPDATE user_relationships SET status = ?, updated_at = ? WHERE user_id = ? AND target_id = ?
    `;
    await this.db.run(query, [
      status,
      Math.floor(Date.now() / 1000),
      userId,
      targetId,
    ]);
  }

  async delete(userId: string, targetId: string): Promise<void> {
    const query = `
      DELETE FROM user_relationships WHERE user_id = ? AND target_id = ?
    `;
    await this.db.run(query, [userId, targetId]);
  }
}
