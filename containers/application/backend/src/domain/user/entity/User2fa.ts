export interface User2fa {
  userId: string;
  totpSeceret: string | null;
  isTotpEnabled: number;
  createdAt: number;
  updatedAt: number;
}
