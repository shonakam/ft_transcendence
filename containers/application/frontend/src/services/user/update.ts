import { api } from '../../lib/httpClient';
import { UserUpdateRequest, UserResponse } from '../../types/user';

export function userUpdateRequestForm(
  email: string | null,
  username: string | null,
  password: string | null,
  image: File | null
  // is2faEnabled: boolean
): UserUpdateRequest {
  return {
    email: email,
    username: username,
    password: password,
    image: image
	// is2faEnabled: is2faEnabled
  } as UserUpdateRequest;
}

export async function putMe(data: UserUpdateRequest): Promise<UserResponse> {
  const formData = new FormData();

  if (data.username !== null) formData.append('username', data.username);
  if (data.email !== null) formData.append('email', data.email);
  if (data.password !== null) formData.append('password', data.password);
  if (data.image instanceof File) formData.append('image', data.image);

  return api.put<UserResponse>('users/me', formData);
}
