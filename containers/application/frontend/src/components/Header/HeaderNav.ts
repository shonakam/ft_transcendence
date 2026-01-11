import { NavLink } from './NavLink';
import { Component } from '../../interface/Component';
import { router } from '../../router/router';
import { logout } from '../../services/auth/logout';

export class HeaderNav implements Component {
  private el: HTMLElement;

  constructor() {
    this.el = document.createElement('nav');
    this.el.className = 'space-x-4';

    this.el.appendChild(new NavLink('Home', '/home').getElement());
    this.el.appendChild(new NavLink('About', '/about').getElement());
    this.el.appendChild(new NavLink('LocalGame', '/game/local').getElement());
    this.el.appendChild(new NavLink('RemoteGame', '/game/remote').getElement());
    this.el.appendChild(new NavLink('Dashboard', '/dashboard').getElement());
    this.el.appendChild(new NavLink('Auth', '/auth').getElement());
    this.el.appendChild(new NavLink('Game', '/game').getElement());

    const logoutBtn = document.createElement('button');
    logoutBtn.textContent = 'Logout';
    logoutBtn.className = 'text-gray-300 hover:text-white transition-colors'; // NavLinkのスタイルに合わせる

    logoutBtn.addEventListener('click', async () => {
      if (confirm('ログアウトしますか？')) {
        await logout().catch(() => {});
        localStorage.clear();
        router.navigateTo('/auth?view=login');
      }
    });

    this.el.appendChild(logoutBtn);
  }

  public getElement(): HTMLElement {
    return this.el;
  }
}
