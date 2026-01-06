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
      [room.id, room.name, room.type, room.createdAt],
    );
  }

  async findById(id: string): Promise<ChatRoom | null> {
    const row = await this.db.get(`SELECT * FROM chat_rooms WHERE id = ?`, [id]);
    if (!row) return null;
    return this.scan(row);
  }

  async findUserRooms(userId: string): Promise<ChatRoom[]> {
    const rows = await this.db.all(
      `SELECT r.* FROM chat_rooms r
       JOIN chat_room_members m ON r.id = m.room_id
       WHERE m.user_id = ?
       ORDER BY r.created_at DESC`,
      [userId],
    );
    return rows.map((row) => this.scan(row));
  }

  async findDMRoom(userId1: string, userId2: string): Promise<ChatRoom | null> {
    const row = await this.db.get(
      `SELECT r.* FROM chat_rooms r
       JOIN chat_room_members m1 ON r.id = m1.room_id
       JOIN chat_room_members m2 ON r.id = m2.room_id
       WHERE r.type = 'dm' AND m1.user_id = ? AND m2.user_id = ?`,
      [userId1, userId2],
    );
    if (!row) return null;
    return this.scan(row);
  }

  async addMember(roomId: string, userId: string): Promise<void> {
    // ID generates randomly for member as it's not provided by interface, assuming we need UUID
    // However, the interface might need more careful design if ID is required
    // For now, I'll use a simple approach since the table has a PK 'id'
    const id = crypto.randomUUID();
    await this.db.run(
      `INSERT INTO chat_room_members (id, room_id, user_id, created_at)
       VALUES (?, ?, ?, (unixepoch()))
       ON CONFLICT(room_id, user_id) DO NOTHING`,
      [id, roomId, userId],
    );
  }
}
