export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  imagePath: string | null;
  createdAt: number;
  updatedAt: number;
  withdrawnAt: null | number;
}
