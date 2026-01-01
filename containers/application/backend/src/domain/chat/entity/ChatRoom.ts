export interface ChatRoom {
  id: string;
  name: string | null;
  type: 'global' | 'dm';
  createdAt: number;
}
