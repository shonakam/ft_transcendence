import type { UserRepository } from '../../domain/user/repository/UserRepository.ts';
import type { User } from '../../domain/user/entity/User.ts';
import type { UpdateUserForm } from '../../domain/user/form/UserForm.ts';
import { getUnixTimeMs } from '../../utils/unixtime.ts';
import UserId from '../../domain/user/vo/UserId.ts';
import Password from '../../domain/user/vo/Password.ts';

export class UpdateUserUseCase {
  constructor(private repo: UserRepository) {}

  async execute(id: UserId, form: UpdateUserForm): Promise<User> {
    const user = await this.repo.findById(id.get())
    if (!user) {
      throw new Error("user not found")
    }

    if (!Password.compare(form.currentPassword, user.password)) {
      throw new Error("invalid password")
    }
    
    const now = getUnixTimeMs();
    user.username = form.username ?? user.username;
    user.email = form.email ?? user.email;
    user.password = (form.newPassword && Password.create(form.newPassword).getHash()) ?? user.password; 
    user.imagePath = form.imagePath ?? user.imagePath; 
    user.updatedAt = now;

    await this.repo.save(user);
    return user;
  }
}
