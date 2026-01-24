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

export interface UserCreateRequest {
  email: string;
  username: string;
  password: string;
  imagePath: string | null;
  is2faEnabled: boolean;
}

export interface UserCreateResponse {
  id: string;
  email: string;
  message?: string;
}

export interface UserUpdateRequest {
  email: string | null;
  username: string | null;
  password: string | null;
  image: File | null;
}
