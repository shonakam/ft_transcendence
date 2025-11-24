import { getDb } from '../../db.ts';
import type { Database } from 'sqlite';

import { User2faRepository } from '../../../../domain/user/repository/User2faRepository.ts';
import { User2fa } from '../../../../domain/user/entity/User2fa.ts';

export class User2faRepositorySqlite implements User2faRepository {
  private get db(): Database {
    return getDb();
  }

//   CREATE TABLE IF NOT EXISTS user_2fa (
//     user_id TEXT PRIMARY,
//     totp_secret TEXT,
//     totp INTEGER NOT NULL DEFAULT 0,
//     created_at INTEGER NOT NULL,
//     updated_at INTEGER NOT NULL,
// );

  async save(user2fa: User2fa): Promise<void> {
    await this.db.run(
      `INSERT INTO user_2fa (user_id, totp_secret, totp, created_at, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         totp_secret = excluded.provider,
         totp = excluded.provider_user_id,
         created_at = excluded.created_at,
         updated_at = excluded.updated_at,`,
      [
        user2fa.userId,
        user2fa.totpSeceret,
        user2fa.totp,
        user2fa.createdAt,
        user2fa.updatedAt,
      ],
    );
  }

  async findById(userId: string): Promise<User2fa | null> {
    return await this.db.get(`SELECT * FROM user_2fa WHERE user_id = ?`, [userId]) ?? null;
  }
}
