import { getDb } from '../../db.ts';
import type { Database } from 'sqlite';
import type { ChatRoomMemberRepository } from '../../../../domain/chat/repository/ChatRoomMemberRepository.ts';
import type { ChatRoomMember } from '../../../../domain/chat/entity/ChatRoomMember.ts';

export class ChatRoomMemberRepositorySqlite implements ChatRoomMemberRepository {
  private get db(): Database {
    return getDb();
  }

  private scan(row: any): ChatRoomMember {
    return {
      id: row.id,
      roomId: row.room_id,
      userId: row.user_id,
      createdAt: row.created_at,
    };
  }

  async save(member: ChatRoomMember): Promise<void> {
    await this.db.run(
      `INSERT INTO chat_room_members (id, room_id, user_id, created_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         room_id = excluded.room_id,
         user_id = excluded.user_id,
         created_at = excluded.created_at`,
      [member.id, member.roomId, member.userId, member.createdAt]
    );
  }

  async findByRoomId(roomId: string): Promise<ChatRoomMember[]> {
    const rows = await this.db.all(`SELECT * FROM chat_room_members WHERE room_id = ?`, [roomId]);
    return rows.map((row) => this.scan(row));
  }

  async findByRoomAndUser(roomId: string, userId: string): Promise<ChatRoomMember | null> {
    const row = await this.db.get(
      `SELECT * FROM chat_room_members WHERE room_id = ? AND user_id = ?`,
      [roomId, userId]
    );
    return row ? this.scan(row) : null;
  }

  async delete(roomId: string, userId: string): Promise<void> {
    await this.db.run(`DELETE FROM chat_room_members WHERE room_id = ? AND user_id = ?`, [roomId, userId]);
  }
}
