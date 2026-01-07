import { api } from '../../lib/httpClient';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string | null;
  refreshToken: string | null;
  tmpAuthToken: string | null;
}

export function loginRequestForm(
  email: string,
  password: string
): LoginRequest {
  return {
    email: email,
    password: password,
  } as LoginRequest;
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  return api.post<LoginResponse>('auth/login', data);
}
