export interface UserIdp {
  id: string;
  user_id: string;
  provider: string;
  provider_user_id: string;
  createdAt: number;
  updatedAt: number;
  imagePath: string | null;
  withdrawnAt: null | number;
}
