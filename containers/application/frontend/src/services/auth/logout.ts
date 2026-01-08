import { api } from '../../lib/httpClient';

export async function logout(): Promise<void> {
  return api.delete<void>('auth/logout');
}
