export interface GameRecord {
  id?: number;
  gameId: string;
  userId: string;
  alias: string | null;
  score: number;
  isWinner: boolean;
  side: 'left' | 'right';
  endedAt: number;
  createdAt: number;
}
