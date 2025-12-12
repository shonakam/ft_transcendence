import { api } from '../../lib/httpClient';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {}

export function loginRequestForm(
	email: string,
	password: string,
): LoginRequest {
	return {
		email: email,
		password: password
	} as LoginRequest
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
	return api.post<LoginRequest>('auth/login', data);
}
