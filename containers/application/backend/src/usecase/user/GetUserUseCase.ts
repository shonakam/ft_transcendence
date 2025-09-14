import type { UserRepository } from '../../domain/user/repository/UserRepository.ts';
import type { User } from '../../domain/user/entity/User.ts';
import UserId from '../../domain/user/vo/UserId.ts';

export class GetUserUseCase {
  constructor(private repo: UserRepository) {}

  async execute(id: UserId): Promise<User | null> {
    return this.repo.findById(id.get());
  }
}
