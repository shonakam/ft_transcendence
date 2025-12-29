export interface CreateUserForm {
  email: string;
  username: string;
  password: string;
  imagePath: string | null;
  // is2faEnabled: boolean;
}

export interface UpdateUserForm {
  username?: string;
  email?: string;
  imagePath?: string | null;
  currentPassword: string;
  newPassword?: string;
}

export interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
}

export interface DeleteUserForm {
  email: string;
  password: string;
}
