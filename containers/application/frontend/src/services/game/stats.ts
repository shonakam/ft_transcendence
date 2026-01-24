import { api } from '../../lib/httpClient';

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
