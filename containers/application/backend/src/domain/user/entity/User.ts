export interface User {
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
