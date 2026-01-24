import { api } from '../../lib/httpClient';

//　あとで必要な項目のみにする
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

export async function getUserById(id: string): Promise<UserResponse> {
  return api.get<UserResponse>(`users/${id}`);
}
