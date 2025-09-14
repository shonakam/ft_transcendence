import type { UserRepository } from '../../domain/user/repository/UserRepository.ts';
import type { DeleteUserForm } from '../../domain/user/form/UserForm.ts';
import { getUnixTimeMs } from '../../utils/unixtime.ts';

export class DeleteUserUseCase {
  constructor(private repo: UserRepository) {}

  async execute(form: DeleteUserForm): Promise<void> {
    const now = getUnixTimeMs();
    // const deletedEmail = `${email.get()}_${now}`;
  }
}
