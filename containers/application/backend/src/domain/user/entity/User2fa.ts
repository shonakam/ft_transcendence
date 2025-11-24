export interface User2fa {
  userId: string;
  totpSeceret: string | null;
  totp: number;
  createdAt: number;
  updatedAt: number;
}
