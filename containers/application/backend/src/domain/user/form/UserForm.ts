export interface CreateUserForm {
  email: string;
  username: string;
  password: string;
  imagePath: string | null;
}

export interface UpdateUserForm {
  username: string | null;
  email: string | null;
  password: string;
  imagePath: string | null;
}

export interface DeleteUserForm {
  email: string;
  password: string;
}
