import type { UserIdp } from '../entity/UserIdp.ts'

export interface UserIdpRepository {
  save(userIdp: UserIdp): Promise<void>
  findById(id: string, provider: string): Promise<UserIdp | null>
  providerUserId(providerUserId:string, provider: string): Promise<UserIdp | null>
}
