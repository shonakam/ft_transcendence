import type { UserRepository } from '../../domain/user/repository/UserRepository.ts';
import type { User } from '../../domain/user/entity/User.ts';
import { UserForm } from '../../domain/user/form/UserForm.ts';
import type { UpdateUserForm } from '../../domain/user/form/request/UserForm.ts';
import UserId from '../../domain/user/vo/UserId.ts';
import { LocalFileStorage } from '../../infra/storage/LocalFileStorage.ts';
import { Readable } from 'stream';

export class UpdateUserUseCase {
  constructor(
    private repo: UserRepository,
    private lfs: LocalFileStorage
  ) {}

  async execute(id: UserId, form: UpdateUserForm): Promise<User> {
    const user = await this.repo.findById(id.get());
    if (!user) {
      throw new Error('user not found');
    }

    const fileName = `${user.id}.png`;
    await this.lfs.delete(fileName)
    let path = null;
    if (form.image) {
      path = await this.lfs.save(fileName, form.image);
    }
    const updateUser = UserForm.update(user, form, path);

    await this.repo.save(updateUser);
    return updateUser;
  }
}
