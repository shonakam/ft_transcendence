import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import type { User } from '../../../domain/user/entity/User.ts';
import type { UserRepository } from '../../../domain/user/repository/UserRepository.ts';
import { config } from '../../../conf.ts';

export class SqliteUserRepository implements UserRepository {
  private db!: Database<sqlite3.Database, sqlite3.Statement>;
  constructor(private dbPath: string = config.db.path) {}

  async init(): Promise<void> {
    this.db = await open({
      filename: this.dbPath,
      driver: sqlite3.Database,
    });

    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        imagePath TEXT,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        withdrawnAt INTEGER
      )
    `);
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
    const row = await this.db.get(`SELECT * FROM users WHERE id = ?`, [id]);
    return row ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.db.get(`SELECT * FROM users WHERE email = ?`, [
      email,
    ]);
    return row ?? null;
  }

  async delete(id: string): Promise<void> {
    await this.db.run(`DELETE FROM users WHERE id = ?`, [id]);
  }

  async list(offset = 0, limit = 10): Promise<User[]> {
    const rows = await this.db.all(
      `SELECT * FROM users ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
      [limit, offset],
    );
    return rows;
  }
}
