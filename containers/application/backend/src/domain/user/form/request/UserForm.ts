export interface CreateUserForm {
  email: string;
  username: string;
  password: string;
  imagePath: string | null;
  is2faEnabled: boolean;
}

export interface UpdateUserForm {
  email: string | null;
  username: string | null;
  password: string | null;
  image: Buffer | null;
}

export interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
}

export interface DeleteUserForm {
  email: string;
  password: string;
}
