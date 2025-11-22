import { getDb } from '../db.ts';
import type { Database } from 'sqlite';
import type { UserIdpRepository } from '../../../domain/user/repository/UserIdpRepository.ts';
import { UserIdp } from '../../../domain/user/entity/UserIdp.ts';

export class UserIdpRepositorySqlite implements UserIdpRepository {
  private get db(): Database {
    return getDb();
  }

  async save(userIdp: UserIdp): Promise<void> {
    await this.db.run(
      `INSERT INTO user_idp (id, provider, providerUserId, imagePath, createdAt, updatedAt, withdrawnAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         provider = excluded.provider,
         provider_user_id = excluded.provider_user_id,
         imagePath = excluded.imagePath,
         createdAt = excluded.createdAt,
         updatedAt = excluded.updatedAt,
         withdrawnAt = excluded.withdrawnAt`,
      [
        userIdp.id,
        userIdp.provider,
        userIdp.providerUserId,
        userIdp.imagePath,
        userIdp.createdAt,
        userIdp.updatedAt,
        userIdp.withdrawnAt,
      ],
    );
  }

  async findById(id: string, provider: string): Promise<UserIdp | null> {
    const row = await this.db.get(
      `SELECT * FROM user_idps 
       WHERE id = ?
       AND provider = ?
       AND withdrawnAt IS NULL`, 
    [id, provider]);
    return row ?? null;
  }

  /* physical delete */
  // async delete(id: string): Promise<void> {
  //   await this.db.run(`DELETE FROM users WHERE id = ?`, [id]);
  // }

  /* logical delete */
  // async delete(id: string, deletedEmail: string, withdrawnAt: number): Promise<void> {
  //   await this.db.run(`UPDATE users SET withdrawnAt = ?, email = ? WHERE id = ?`, [withdrawnAt, deletedEmail, id])
  // }
}
