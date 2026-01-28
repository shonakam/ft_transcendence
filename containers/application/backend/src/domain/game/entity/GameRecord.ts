export interface GameRecord {
  id?: number;
  gameId: string;
  leftUserId: string;
  rightUserId: string;
  leftPoint: number;
  rightPoint: number;
  leftAlias?: string | null;
  rightAlias?: string | null;
  winnerId?: string | null;
  startedAt?: number;
  endedAt: number;
  createdAt: number;
}
