import { api } from '../../lib/httpClient';
import { UserResponse } from '../../types/user';

export async function getMe(): Promise<UserResponse> {
  return api.get<UserResponse>('users/me');
}
