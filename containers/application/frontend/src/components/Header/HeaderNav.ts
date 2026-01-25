import { NavLink } from './NavLink';
import { Component } from '../../interface/Component';
import { router } from '../../router/router';
import { logout } from '../../services/auth/logout';
import { to } from '../../lib/to';
import { toaster } from '../common/Toaster';
import { authStore, AuthState } from '../../store/authStore';

export class HeaderNav implements Component {
  private el: HTMLElement;
  private unsubscribe: (() => void) | null = null;
  private protectedLinks: Map<string, HTMLAnchorElement> = new Map();
  private loginLink: HTMLAnchorElement;
  private userMenuContainer: HTMLDivElement;
  private usernameBtn: HTMLButtonElement;
  private dropdownMenu: HTMLDivElement;

  constructor() {
    this.el = document.createElement('nav');
    this.el.className = 'flex items-center space-x-4';

    // 公開リンク
    this.el.appendChild(new NavLink('Home', '/home').getElement());
    this.el.appendChild(new NavLink('About', '/about').getElement());
    this.el.appendChild(new NavLink('LocalGame', '/game/local').getElement());

    // 認証必須リンク（グレーアウト対象）
    const dashboardLink = this.createProtectedLink('Dashboard', '/dashboard');
    const remoteLink = this.createProtectedLink('RemoteGame', '/game/remote');
    const chatLink = this.createProtectedLink('Chat', '/chat');
    this.el.appendChild(remoteLink);
    this.el.appendChild(chatLink);
    this.el.appendChild(dashboardLink);

    // Login リンク（未ログイン時のみ表示）
    this.loginLink = new NavLink('Signup / Login', '/auth').getElement();
    this.el.appendChild(this.loginLink);

    // ユーザーメニュー（ログイン時のみ表示）
    this.userMenuContainer = document.createElement('div');
    this.userMenuContainer.className = 'relative';
    this.userMenuContainer.style.display = 'none';

    // ユーザー名ボタン
    this.usernameBtn = document.createElement('button');
    this.usernameBtn.className =
      'text-indigo-400 hover:text-indigo-300 font-bold text-sm flex items-center gap-1 transition-colors';
    this.usernameBtn.innerHTML = `
      <span class="username-text"></span>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    `;

    // ドロップダウンメニュー
    this.dropdownMenu = document.createElement('div');
    this.dropdownMenu.className =
      'absolute right-0 top-full mt-2 w-32 bg-slate-800 border border-slate-700 rounded-lg shadow-lg py-1 hidden z-50';

    const logoutBtn = document.createElement('button');
    logoutBtn.textContent = 'Logout';
    logoutBtn.className =
      'w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors';

    logoutBtn.addEventListener('click', async () => {
      if (confirm('ログアウトしますか？')) {
        await logout().catch(() => {});
        authStore.setLoggedOut();
        window.sessionStorage.clear();
        router.navigateTo('/auth?view=login');
      }
    });

    this.dropdownMenu.appendChild(logoutBtn);
    this.userMenuContainer.appendChild(this.usernameBtn);
    this.userMenuContainer.appendChild(this.dropdownMenu);
    this.el.appendChild(this.userMenuContainer);

    // クリックでメニュー表示/非表示
    this.usernameBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.dropdownMenu.classList.toggle('hidden');
    });

    // 外側クリックでメニューを閉じる
    document.addEventListener('click', () => {
      this.dropdownMenu.classList.add('hidden');
    });

    // 認証状態を購読
    this.unsubscribe = authStore.subscribe((state) =>
      this.updateAuthState(state)
    );

    // 初期状態チェック
    authStore.checkAuthStatus();
  }

  private createProtectedLink(text: string, href: string): HTMLAnchorElement {
    const link = document.createElement('a');
    link.href = href;
    link.textContent = text;
    link.className =
      'text-slate-300 hover:text-white transition-colors font-medium text-sm';
    this.protectedLinks.set(href, link);
    return link;
  }

  private updateAuthState(state: AuthState): void {
    const isLoggedIn = state.isLoggedIn;

    // プロテクトされたリンクのスタイルを更新
    this.protectedLinks.forEach((link) => {
      if (isLoggedIn) {
        link.className =
          'text-slate-300 hover:text-white transition-colors font-medium text-sm';
        link.style.pointerEvents = 'auto';
      } else {
        link.className =
          'text-slate-500 cursor-not-allowed font-medium text-sm';
        link.style.pointerEvents = 'none';
      }
    });

    // ログイン時: Loginを非表示、ユーザーメニューを表示
    // 未ログイン時: Loginを表示、ユーザーメニューを非表示
    this.loginLink.style.display = isLoggedIn ? 'none' : '';
    this.userMenuContainer.style.display = isLoggedIn ? '' : 'none';

    // ユーザー名表示
    const usernameText = this.usernameBtn.querySelector('.username-text');
    if (usernameText) {
      usernameText.textContent = state.username || '';
    }
  }

  destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    this.el.remove();
  }

  public getElement(): HTMLElement {
    return this.el;
  }
}
