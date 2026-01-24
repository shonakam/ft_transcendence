import type { UserRepository } from '../../domain/user/repository/UserRepository.ts';
import type { User } from '../../domain/user/entity/User.ts';
import UserId from '../../domain/user/vo/UserId.ts';
import { transaction } from '../../infra/sqlite/db.ts';
import { User2faRepository } from '../../domain/user/repository/User2faRepository.ts';

export class GetUserUseCase {
  constructor(
    private repo: UserRepository,
    private user2faRepo: User2faRepository,
  ) {}

  async execute(id: UserId): Promise<User | null> {
    return await transaction(async (db) => {
      let user = await this.repo.findById(id.get());
      const state = await this.user2faRepo.findById(id.get())
      user!.is2faEnabled = state?.isTotpEnabled ?? 0
      return user
    })
  }
}
