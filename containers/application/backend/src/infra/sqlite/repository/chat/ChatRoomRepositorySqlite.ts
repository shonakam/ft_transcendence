import { getDb } from '../../db.ts';
import type { Database } from 'sqlite';
import type { ChatRoomRepository } from '../../../../domain/chat/repository/ChatRoomRepository.ts';
import type { ChatRoom } from '../../../../domain/chat/entity/ChatRoom.ts';

export class ChatRoomRepositorySqlite implements ChatRoomRepository {
  private get db(): Database {
    return getDb();
  }

  private scan(row: any): ChatRoom {
    return {
      id: row.id,
      name: row.name,
      type: row.type,
      createdAt: row.created_at,
    };
  }

  async save(room: ChatRoom): Promise<void> {
    await this.db.run(
      `INSERT INTO chat_rooms (id, name, type, created_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         type = excluded.type,
         created_at = excluded.created_at`,
      [room.id, room.name, room.type, room.createdAt]
    );
  }

  async findById(id: string): Promise<ChatRoom | null> {
    const row = await this.db.get(`SELECT * FROM chat_rooms WHERE id = ?`, [id]);
    return row ? this.scan(row) : null;
  }

  async findGlobalRoom(): Promise<ChatRoom | null> {
    const row = await this.db.get(`SELECT * FROM chat_rooms WHERE type = 'global' LIMIT 1`);
    return row ? this.scan(row) : null;
  }

  async findDmRoom(userId1: string, userId2: string): Promise<ChatRoom | null> {
    const row = await this.db.get(
      `SELECT r.* FROM chat_rooms r
       JOIN chat_room_members m1 ON r.id = m1.room_id
       JOIN chat_room_members m2 ON r.id = m2.room_id
       WHERE r.type = 'dm' AND m1.user_id = ? AND m2.user_id = ?`,
      [userId1, userId2]
    );
    return row ? this.scan(row) : null;
  }

  async listRoomsByUserId(userId: string): Promise<ChatRoom[]> {
    const rows = await this.db.all(
      `SELECT r.* FROM chat_rooms r
       JOIN chat_room_members m ON r.id = m.room_id
       WHERE m.user_id = ?
       ORDER BY r.created_at DESC`,
      [userId]
    );
    return rows.map((row) => this.scan(row));
  }
}
