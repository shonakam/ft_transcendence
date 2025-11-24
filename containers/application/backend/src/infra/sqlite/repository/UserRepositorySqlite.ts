import { getDb } from '../db.ts';
import type { Database } from 'sqlite';
import type { UserRepository } from '../../../domain/user/repository/UserRepository.ts';
import { User } from '../../../domain/user/entity/User.ts';

export class UserRepositorySqlite implements UserRepository {
  private get db(): Database {
    return getDb();
  }

  async save(user: User): Promise<void> {
    await this.db.run(
      `INSERT INTO users (id, email, username, password, image_path, is_2fa_enabled, created_at, updated_at, withdrawn_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         email = excluded.email,
         username = excluded.username,
         password = excluded.password,
         image_path = excluded.image_path,
         is_2fa_enabled = excluded.is_2fa_enabled,
         created_at = excluded.created_at,
         updated_at = excluded.updated_at,
         withdrawn_at = excluded.withdrawn_at`,
      [
        user.id,
        user.email,
        user.username,
        user.password,
        user.imagePath,
        user.is2faEnabled,
        user.createdAt,
        user.updatedAt,
        user.withdrawnAt,
      ],
    );
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.db.get(`SELECT * FROM users WHERE id = ? AND withdrawn_at IS NULL`, [id]);
    return row ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.db.get(`SELECT * FROM users WHERE email = ? AND withdrawn_at IS NULL`, [email]);
    return row ?? null;
  }

  /* physical delete */
  // async delete(id: string): Promise<void> {
  //   await this.db.run(`DELETE FROM users WHERE id = ?`, [id]);
  // }

  /* logical delete */
  async delete(id: string, deletedEmail: string, withdrawnAt: number): Promise<void> {
    await this.db.run(`UPDATE users SET withdrawn_at = ?, email = ? WHERE id = ?`, [withdrawnAt, deletedEmail, id])
  }

  async list(offset = 0, limit = 10): Promise<User[]> {
    const rows = await this.db.all(`
      SELECT * FROM users WHERE withdrawn_at IS NULL ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]);
    return rows;
  }
}
