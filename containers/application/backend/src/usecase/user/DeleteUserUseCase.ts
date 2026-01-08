import type { UserRepository } from '../../domain/user/repository/UserRepository.ts';
import type { DeleteUserForm } from '../../domain/user/form/request/UserForm.ts';
import { getUnixTimeMs } from '../../utils/unixtime.ts';
import UserId from '../../domain/user/vo/UserId.ts';
import Password from '../../domain/user/vo/Password.ts';

export class DeleteUserUseCase {
  constructor(private repo: UserRepository) {}

  async execute(id: UserId, form: DeleteUserForm): Promise<void> {
    const user = await this.repo.findById(id.get());
    if (!user) {
      throw new Error('user not found');
    }

    if (!Password.compare(form.password, user.password!)) {
      console.warn('LoginUseCase: Password compare is failed.');
      throw new Error('Invalid email or password.');
    }

    const now = getUnixTimeMs();
    const deletedEmail = `${form.email}_${now}`;
    await this.repo.delete(user.id, deletedEmail, now);
  }
}
