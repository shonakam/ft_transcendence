export type ChatRoomType = 'global' | 'dm';

export interface ChatRoom {
  id: string;
  name: string | null;
  type: ChatRoomType;
  createdAt: number;
}
