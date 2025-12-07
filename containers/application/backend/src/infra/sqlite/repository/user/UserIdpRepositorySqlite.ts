import { getDb } from '../../db.ts';
import type { Database } from 'sqlite';
import type { UserIdpRepository } from '../../../../domain/user/repository/UserIdPRepository.ts';
import { UserIdp } from '../../../../domain/user/entity/UserIdp.ts';

export class UserIdpRepositorySqlite implements UserIdpRepository {
  private get db(): Database {
    return getDb();
  }

  async save(userIdp: UserIdp): Promise<void> {
    await this.db.run(
      `INSERT INTO user_idps (id, user_id, provider, provider_user_id, image_path, created_at, updated_at, withdrawn_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         user_id = excluded.user_id,
         provider = excluded.provider,
         provider_user_id = excluded.provider_user_id,
         image_path = excluded.image_path,
         created_at = excluded.created_at,
         updated_at = excluded.updated_at,
         withdrawn_at = excluded.withdrawn_at`,
      [
        userIdp.id,
        userIdp.userId,
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
       AND withdrawn_at IS NULL`, 
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
