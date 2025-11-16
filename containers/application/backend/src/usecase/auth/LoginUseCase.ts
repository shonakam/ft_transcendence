import { LoginSession } from "../../domain/auth/vo/LoginSession.ts";
import { LoginForm } from "../../domain/auth/form/LoginForm.ts";
import { UserRepository } from "../../domain/user/repository/UserRepository.ts";
import Password from "../../domain/user/vo/Password.ts";

export class LoginUseCase {
  constructor(
    private userRepo: UserRepository,
    // private authRepo: AuthRepository
  ) {} // using redis

  async execute(form: LoginForm): Promise<LoginSession[]> {
    const user = await this.userRepo.findByEmail(form.email.get())
    if (!user) {
      console.warn("LoginUseCase: findByEmail is failed.")
      throw new Error("Invalid email or password.")
    }

    if (!Password.compare(form.password, user.password)) {
      console.warn("LoginUseCase: Password compare is failed.")
      throw new Error("Invalid email or password.")
    }

    
  }
}
