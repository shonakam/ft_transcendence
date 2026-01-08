import { Component } from '../../interface/Component';
import { logout } from '../../services/auth/logout';
import { router } from '../../router/router';

export class LogoutConfirm implements Component {
  private root: HTMLElement;

  constructor(userName: string) {
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
      await logout();

      // localStorage.removeItem('user')
      // window.location.reload()
    });

    this.root.append(message, logoutButton);
  }

  getElement(): HTMLElement {
    return this.root;
  }
}
