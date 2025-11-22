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
      `INSERT INTO users (id, email, username, password, imagePath, createdAt, updatedAt, withdrawnAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         email = excluded.email,
         username = excluded.username,
         password = excluded.password,
         imagePath = excluded.imagePath,
         createdAt = excluded.createdAt,
         updatedAt = excluded.updatedAt,
         withdrawnAt = excluded.withdrawnAt`,
      [
        user.id,
        user.email,
        user.username,
        user.password,
        user.imagePath,
        user.createdAt,
        user.updatedAt,
        user.withdrawnAt,
      ],
    );
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.db.get(`SELECT * FROM users WHERE id = ? AND withdrawnAt IS NULL`, [id]);
    return row ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.db.get(`SELECT * FROM users WHERE email = ? AND withdrawnAt IS NULL`, [email]);
    return row ?? null;
  }

  /* physical delete */
  // async delete(id: string): Promise<void> {
  //   await this.db.run(`DELETE FROM users WHERE id = ?`, [id]);
  // }

  /* logical delete */
  async delete(id: string, deletedEmail: string, withdrawnAt: number): Promise<void> {
    await this.db.run(`UPDATE users SET withdrawnAt = ?, email = ? WHERE id = ?`, [withdrawnAt, deletedEmail, id])
  }

  async list(offset = 0, limit = 10): Promise<User[]> {
    const rows = await this.db.all(`
      SELECT * FROM users WHERE withdrawnAt IS NULL ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
      [limit, offset]);
    return rows;
  }
}
