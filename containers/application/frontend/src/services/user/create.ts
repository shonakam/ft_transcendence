import { api } from '../../lib/httpClient';
import { UserCreateRequest, UserCreateResponse } from '../../types/user';

export function userCreateRequestForm(
  email: string,
  username: string,
  password: string,
  imagePath: string | null
  // is2faEnabled: boolean
): UserCreateRequest {
  return {
    email: email,
    username: username,
    password: password,
    imagePath: imagePath,
    // is2faEnabled: is2faEnabled
  } as UserCreateRequest;
}

export async function createUser(
  data: UserCreateRequest
): Promise<UserCreateResponse> {
  return api.post<UserCreateResponse>('users', data);
}
