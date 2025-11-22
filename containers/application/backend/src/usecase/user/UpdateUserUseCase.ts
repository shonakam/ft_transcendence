import type { UserRepository } from '../../domain/user/repository/UserRepository.ts';
import type { User } from '../../domain/user/entity/User.ts';
import { UserForm } from '../../domain/user/form/UserForm.ts';
import type { UpdateUserForm } from '../../domain/user/form/request/UserForm.ts';
import UserId from '../../domain/user/vo/UserId.ts';
import Password from '../../domain/user/vo/Password.ts';
export class UpdateUserUseCase {
  constructor(private repo: UserRepository) {}

  async execute(id: UserId, form: UpdateUserForm): Promise<User> {
    const user = await this.repo.findById(id.get())
    if (!user) {
      throw new Error("user not found")
    }

    if (!Password.compare(form.currentPassword, user.password!)) {
      throw new Error("invalid password")
    }
    
    const updateUser = UserForm.update(user, form)

    await this.repo.save(updateUser);
    return updateUser;
  }
}
