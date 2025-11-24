import { getDb } from '../../db.ts';
import type { Database } from 'sqlite';

import { User2faRepository } from '../../../../domain/user/repository/User2faRepository.ts';
import { User2fa } from '../../../../domain/user/entity/User2fa.ts';

export class User2faRepositorySqlite implements User2faRepository {
  private get db(): Database {
    return getDb();
  }

  private scan(row: any): User2fa {
    return {
      userId: row.user_id,
      totpSeceret: row.totp_secret,
      isTotpEnabled: row.is_totp_enabled,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    } as User2fa
  }

  async save(user2fa: User2fa): Promise<void> {
    try {
      await this.db.run(
        `INSERT INTO user_2fa (user_id, totp_secret, is_totp_enabled, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(user_id) DO UPDATE SET
           totp_secret = excluded.totp_secret,
           is_totp_enabled = excluded.is_totp_enabled,
           created_at = excluded.created_at,
           updated_at = excluded.updated_at`,
        [
          user2fa.userId,
          user2fa.totpSeceret,
          user2fa.isTotpEnabled,
          user2fa.createdAt,
          user2fa.updatedAt,
        ],
      );
    } catch (err) {
      console.error("User2faRepositorySqlite.sacve: ", err, user2fa)
    } 
  }

  async findById(userId: string): Promise<User2fa | null> {
    let row
    try {
      row = await this.db.get(`SELECT * FROM user_2fa WHERE user_id = ?`, [userId]);
    } catch (err) {
      console.error("User2faRepositorySqlite.sacve:", err)
    }
    return this.scan(row) ?? null;
  }
}
