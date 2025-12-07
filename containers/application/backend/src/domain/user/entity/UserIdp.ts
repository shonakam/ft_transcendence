export interface UserIdp {
  id: string;
  userId: string;
  provider: string;
  providerUserId: string;
  imagePath: string | null;
  createdAt: number;
  updatedAt: number;
  withdrawnAt: null | number;
}
