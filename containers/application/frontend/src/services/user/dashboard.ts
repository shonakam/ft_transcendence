import { api } from '../../lib/httpClient';
import { UserResponse } from '../../types/user';

export async function getMe(): Promise<UserResponse> {
  return api.get<UserResponse>('users/me');
}

export async function getUserById(id: string): Promise<UserResponse> {
  return api.get<UserResponse>(`users/${id}`);
}
