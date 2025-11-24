import type { UserRepository } from '../../domain/user/repository/UserRepository.ts';
import type { User } from '../../domain/user/entity/User.ts';
import { UserForm } from '../../domain/user/form/UserForm.ts';
import type { CreateUserForm } from '../../domain/user/form/request/UserForm.ts';
import { transaction } from '../../infra/sqlite/db.ts';
import { User2faRepository } from '../../domain/user/repository/User2faRepository.ts';

export class CreateUserUseCase {
  constructor(
    private repo: UserRepository,
    private user2faRepo: User2faRepository
  ) {}

  async execute(form: CreateUserForm): Promise<User> {
    const user = UserForm.create(form)

    await transaction(async (db) => {
      await this.repo.save(user);
      await this.user2faRepo.save({
        userId: user.id,
        totpSeceret: null,
        isTotpEnabled: 0,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    })
    
    return user;
  }
}
