import { api } from '../lib/httpClient';
import { Component } from '../interface/Component';
import { UserResponse } from '../types/user';
import { config, design } from '../conf';
import { MfaForm } from '../components/auth/MfaForm';
import { UpdateForm } from '../components/auth/UpdateForm';
import { UserInfoComponent } from '../components/auth/UserInfoComponent';
import { router } from '../router/router';
import { toaster } from '../components/common/Toaster';
import { SessionStorage } from '../lib/sessionStorage';

export type DashboardView = 'user' | 'game' | 'chat' | 'mfa' | 'default';

export class DashboardPage implements Component {
  private el: HTMLElement;
  private container: HTMLDivElement;
  private mfaForm: MfaForm;
  private updateForm: UpdateForm;
  private sessionStorage: SessionStorage<UserResponse>;

  constructor() {
    this.el = document.createElement('main');
    this.el.className = design.bg;

    this.container = document.createElement('div');
    this.container.className = design.container;

    this.mfaForm = new MfaForm();
    this.updateForm = new UpdateForm();
    this.sessionStorage = new SessionStorage(config.user.sessionStorageKey);

    this.initEventListener();

    this.el.appendChild(this.container);
    this.init();
  }

  private initEventListener(): void {
    this.mfaForm.getElement().addEventListener('cancel', () => {
      this.init();
    });

    this.updateForm.getElement().addEventListener('cancel', () => {
      this.init();
    });

    this.updateForm.getElement().addEventListener('updateSuccess', () => {
      this.init();
      location.reload();
      this.switchView('default');
    });
  }

  public destroy(): void {
    this.el.remove();
  }

  private async init() {
    try {
      let user = this.sessionStorage.get();
      if (!user) {
        user = await api.get<UserResponse>('users/me');
        this.sessionStorage.save(user);
      }
      this.render(user);
    } catch (error) {
      toaster.show('ユーザー情報の取得に失敗しました', 'error');
    }
  }

  private async switchView(view: DashboardView) {
    let element: HTMLElement;
    switch (view) {
      case 'user':
        element = this.updateForm.getElement();
        break;
      case 'mfa':
        await this.mfaForm.activate('setup');
        element = this.mfaForm.getElement();
        break;
      // case 'game':
      //   break;
      // case 'chat':
      //   break;
      default:
        element = this.el;
        break;
    }
    this.container.replaceChildren(element!);
  }

  private render(user: UserResponse) {
    this.container.replaceChildren();

    const title = document.createElement('h2');
    title.className = 'text-2xl font-bold text-white mb-6 text-center';
    title.textContent = 'Dashboard';

    const userInfo = new UserInfoComponent(user);

    const menu = document.createElement('div');
    menu.className = 'space-y-4';

    const userBtn = this.createMenuButton('👤 User Settings', () =>
      this.switchView('user')
    );
    const mfaBtn = this.createMenuButton('🔒 Security Settings', () =>
      this.switchView('mfa')
    );
    const statsBtn = this.createMenuButton('📊 Game Stats', () =>
      router.navigateTo('/game/stats')
    );

    menu.append(userBtn, mfaBtn, statsBtn);
    this.container.append(title, userInfo.getElement(), menu);
  }

  private createMenuButton(
    text: string,
    onClick: () => void
  ): HTMLButtonElement {
    const btn = document.createElement('button');

    btn.className =
      'w-full py-3 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all text-left px-4 flex justify-between items-center group';
    btn.innerHTML = `
      <span>${text}</span>
      <span class="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
    `;
    btn.onclick = onClick;
    return btn;
  }

  public getElement(): HTMLElement {
    return this.el;
  }
}
