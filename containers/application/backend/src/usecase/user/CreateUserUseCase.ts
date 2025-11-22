import type { UserRepository } from '../../domain/user/repository/UserRepository.ts';
import type { User } from '../../domain/user/entity/User.ts';
import { UserForm } from '../../domain/user/form/UserForm.ts';
import type { CreateUserForm } from '../../domain/user/form/request/UserForm.ts';

export class CreateUserUseCase {
  constructor(private repo: UserRepository) {}

  async execute(form: CreateUserForm): Promise<User> {
    const user = UserForm.create(form)
    await this.repo.save(user);
    return user;
  }
}
