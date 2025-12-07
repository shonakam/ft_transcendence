import { User } from "../entity/User.ts";
import type { 
  CreateUserForm,
  UpdateUserForm 
} from "./request/UserForm.ts";
import { getUnixTimeMs } from '../../../utils/unixtime.ts';
import UserId from '../vo/UserId.ts';
import Email from '../vo/Email.ts';
import UserName from '../vo/UserName.ts';
import Password from '../vo/Password.ts';

export class UserForm {
  static create(form: CreateUserForm): User {
    const now = getUnixTimeMs();

    return {
      id: UserId.create().get(),
      username: UserName.create(form.username).get(),
      email: Email.create(form.email).get(),
      password: Password.create(form.password).getHash(),
      imagePath: form.imagePath,
      is2faEnabled: (form.is2faEnabled) ? 1 : 0,
      createdAt: now,
      updatedAt: now,
      withdrawnAt: null,
    };
  }

  static update(user: User, form: UpdateUserForm): User {
    const now = getUnixTimeMs();
  
    user.username = form.username ?? user.username;
    user.email = form.email ?? user.email;
    user.password = (form.newPassword && Password.create(form.newPassword).getHash()) ?? user.password; 
    user.imagePath = form.imagePath ?? user.imagePath; 
    user.updatedAt = now;
    return user
  }
}
