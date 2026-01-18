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
    const migrationsDir = '/app/tools/migrations';
    const files: string[] = await fs.readdir(migrationsDir);
    const sqlFiles = files
      .filter((file: string) => file.endsWith('.sql'))
      .sort((a: string, b: string) =>
        a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }),
      );

    console.log(`Found ${sqlFiles.length} migration files.`);

    for (const file of sqlFiles) {
      console.log(`Applying migration: ${file}`);
      const schemaSql = await fs.readFile(`${migrationsDir}/${file}`, 'utf8');
      await db.exec(schemaSql);
    }
  } catch (err) {
    console.error(`マイグレーションの実行に失敗しました:`, err);
    throw err;
  }
}

export function getDb(): Database<sqlite3.Database, sqlite3.Statement> {
  const txDb = transactionStorage.getStore();
  if (txDb) {
    return txDb;
  }
  if (!db) {
    throw new Error(
      'Database is not initialized. Call initializeDatabase() first.',
    );
  }
  return db;
}

export async function transaction<T>(
  fn: (db: Database) => Promise<T>,
): Promise<T> {
  const db = getDb();
  try {
    await db.exec('BEGIN');
    const result = await transactionStorage.run(db, () => fn(db));
    await db.exec('COMMIT');
    return result;
  } catch (err) {
    console.error('Transaction failed:', err);
    await db.exec('ROLLBACK');
    throw new Error('Database operation failed');
  }
}
