import { User2fa } from "../entity/User2fa.ts";

export interface User2faRepository {
  save(user2fa: User2fa): Promise<void>
  findById(userId: string): Promise<User2fa | null>
}
