import { SessionStorage } from '../../lib/sessionStorage';
import { Component } from '../../interface/Component';
import { logout } from '../../services/auth/logout';
import { UserResponse } from '../../types/user';
import { config } from '../../conf';
import { to } from '../../lib/to';
import { toaster } from '../common/Toaster';
// import { router } from '../../router/router';

export class LogoutConfirm implements Component {
  private root: HTMLElement;
  private sessionStorage: SessionStorage<UserResponse>

  constructor(userName: string) {
    this.sessionStorage = new SessionStorage(config.user.sessionStorageKey)
    this.root = document.createElement('div');
    this.root.className = 'space-y-6 text-center';

    const message = document.createElement('p');
    message.textContent = `${userName} としてログインしています`;
    message.className = 'text-white text-lg';

    const logoutButton = document.createElement('button');
    logoutButton.textContent = 'ログアウト';
    logoutButton.className =
      'w-full py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold';

    logoutButton.addEventListener('click', async () => {
      alert()
      const [_, err] = await to(logout());
      if (err) {
        toaster.show(err.message, 'error')
      }
      this.sessionStorage.delete()
      window.location.reload()
    });

    this.root.append(message, logoutButton);
  }

  destroy(): void {
    this.root.remove();
  }

  getElement(): HTMLElement {
    return this.root;
  }
}
