import { api } from '../../lib/httpClient';

export interface GameRecord {
  id?: number;
  gameId: string;
  leftUserId: string;
  rightUserId: string;
  leftAlias?: string | null;
  rightAlias?: string | null;
  leftPoint: number;
  rightPoint: number;
  winnerId?: string | null;
  endedAt: number;
  createdAt: number;
}

export interface GetStatsParams {
  limit?: number;
  offset?: number;
}

export interface SaveGameResultParams {
  gameId?: string;
  leftUserId: string;
  rightUserId: string;
  leftAlias?: string | null;
  rightAlias?: string | null;
  leftScore: number;
  rightScore: number;
  winner: 'left' | 'right';
  endedAt?: number;
}

export interface UserWinRate {
  userId: string;
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number; // 0-100 percentage
}

export async function getGameStats(
  params?: GetStatsParams
): Promise<GameRecord[]> {
  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.offset) queryParams.set('offset', params.offset.toString());

  const query = queryParams.toString();
  const endpoint = query ? `game/stats?${query}` : 'game/stats';

  return api.get<GameRecord[]>(endpoint);
}

export async function saveGameResult(
  params: SaveGameResultParams
): Promise<GameRecord[]> {
  return api.post<GameRecord[]>('game/stats', params);
}

export async function getUserWinRate(userId: string): Promise<UserWinRate> {
  return api.get<UserWinRate>(`game/stats/${userId}/winrate`);
}
