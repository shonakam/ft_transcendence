import { getDb } from '../../db.ts';
import type { Database } from 'sqlite';
import type { ChatMessageRepository } from '../../../../domain/chat/repository/ChatMessageRepository.ts';
import type { ChatMessage } from '../../../../domain/chat/entity/ChatMessage.ts';

export class ChatMessageRepositorySqlite implements ChatMessageRepository {
  private get db(): Database {
    return getDb();
  }

  private scan(row: any): ChatMessage {
    return {
      id: row.id,
      roomId: row.room_id,
      senderId: row.sender_id,
      content: row.content,
      messageType: row.message_type,
      createdAt: row.created_at,
    };
  }

  async save(message: ChatMessage): Promise<void> {
    await this.db.run(
      `INSERT INTO chat_messages (id, room_id, sender_id, content, message_type, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        message.id,
        message.roomId,
        message.senderId,
        message.content,
        message.messageType,
        message.createdAt,
      ],
    );
  }

  async findByRoomId(roomId: string): Promise<ChatMessage[]> {
    const rows = await this.db.all(
      `SELECT * FROM chat_messages WHERE room_id = ? ORDER BY created_at ASC`,
      [roomId],
    );
    return rows.map((row) => this.scan(row));
  }
}
