import { api } from '../../lib/httpClient'

// User profile response
export interface UserResponse {
  id: string;
  email: string;
  username: string;
  password: string | null;
  imagePath: string | null;
  is2faEnabled: number; // 0 or 1
  createdAt: number;
  updatedAt: number;
  withdrawnAt: null | number;
}

export async function getMe(): Promise<UserResponse> {
  return api.get<UserResponse>('users/me');
}

// TODO: Implement getStats() to fetch user/game statistics for dashboard
// Example:
// export async function getStats(): Promise<DashboardStats> {
//   return api.get<DashboardStats>('users/me/stats');
// }
// Define DashboardStats interface according to backend response
