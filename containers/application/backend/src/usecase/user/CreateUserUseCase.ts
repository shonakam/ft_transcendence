import type { UserRepository } from '../../domain/user/repository/UserRepository.ts';
import type { User } from '../../domain/user/entity/User.ts';
import type { CreateUserForm } from '../../domain/user/form/UserForm.ts';
import { getUnixTimeMs } from '../../utils/unixtime.ts';
import UserId from '../../domain/user/vo/UserId.ts';
import Email from '../../domain/user/vo/Email.ts';
import UserName from '../../domain/user/vo/UserName.ts';
import Password from '../../domain/user/vo/Password.ts';

export class CreateUserUseCase {
  constructor(private repo: UserRepository) {}

  async execute(form: CreateUserForm): Promise<User> {
    const now = getUnixTimeMs();

    const user: User = {
      id: UserId.create().get(),
      username: UserName.create(form.username).get(),
      email: Email.create(form.email).get(),
      password: Password.create(form.password).getHash(),
      imagePath: form.imagePath,
      createdAt: now,
      updatedAt: now,
      withdrawnAt: null,
    };
    await this.repo.save(user);
    return user;
  }
}
