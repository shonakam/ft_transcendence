import type { UserRepository } from '../../domain/user/repository/UserRepository.ts';
import type { User } from '../../domain/user/entity/User.ts';

export class ListUserUseCase {
  constructor(private repo: UserRepository) {}

  async execute(offset: number, limit: number): Promise<User[] | null> {
    return this.repo.list(offset, limit);
  }
}
