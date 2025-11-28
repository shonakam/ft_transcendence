import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { config } from '../../conf.ts';
import { promises as fs } from 'fs';
import { AsyncLocalStorage } from 'node:async_hooks';

const transactionStorage = new AsyncLocalStorage<Database>();
let db: Database<sqlite3.Database, sqlite3.Statement>;

export async function initializeDatabase(): Promise<void> {
  db = await open({
    filename: config.db.path,
    driver: sqlite3.Database,
  });

  await db.exec('PRAGMA journal_mode = WAL;');

  try {
    const schemaSql = await fs.readFile('/app/tools/initialize_schema.sql', 'utf8');
    await db.exec(schemaSql);
  } catch (err) {
    console.error(`スキーマファイルの読み込みまたは実行に失敗しました:`, err);
    throw err;
  }
}

export function getDb(): Database<sqlite3.Database, sqlite3.Statement> {
  const txDb = transactionStorage.getStore();
  if (txDb) {
    return txDb;
  }
  if (!db) {
    throw new Error("Database is not initialized. Call initializeDatabase() first.");
  }
  return db;
}

export async function transaction<T>(
  fn: (db: Database) => Promise<T>
): Promise<T> {
  const db = getDb();
  try {
    await db.exec('BEGIN');
    const result = await transactionStorage.run(db, () => fn(db));
    await db.exec('COMMIT');
    return result;
  } catch (err) {
    await db.exec('ROLLBACK');
    throw err;
  }
}
