import { Component } from '../../interface/Component';
import { toaster } from '../common/Toaster';
import { login, loginRequestForm } from '../../services/auth/login';
import { to } from '../../lib/to';
import { loading } from '../common/Loading';

export class LoginForm implements Component {
  private root: HTMLFormElement;
  private emailInput: HTMLInputElement;
  private passwordInput: HTMLInputElement;
  private submitButton: HTMLButtonElement;
  private oidcButton: HTMLButtonElement;
  private switchButton: HTMLButtonElement;

  constructor() {
    this.root = document.createElement('form');
    this.root.className = 'space-y-4';

    this.emailInput = document.createElement('input');
    this.emailInput.type = 'email';
    this.emailInput.placeholder = 'email@example.com';
    this.emailInput.className =
      'w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20';

    this.passwordInput = document.createElement('input');
    this.passwordInput.type = 'password';
    this.passwordInput.placeholder = 'パスワード';
    this.passwordInput.className =
      'w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20';

    this.submitButton = document.createElement('button');
    this.submitButton.type = 'submit';
    this.submitButton.textContent = 'ログイン';
    this.submitButton.className =
      'w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold';

    const divider = document.createElement('div');
    divider.className = 'flex items-center gap-3 my-2 text-white/40 text-sm';

    const lineLeft = document.createElement('div');
    lineLeft.className = 'flex-1 h-px bg-white/20';

    const lineRight = document.createElement('div');
    lineRight.className = 'flex-1 h-px bg-white/20';

    const orText = document.createElement('span');
    orText.textContent = 'OR';

    divider.append(lineLeft, orText, lineRight);

    this.switchButton = document.createElement('button');
    this.switchButton.type = 'button';
    this.switchButton.textContent = '新規登録';
    this.switchButton.className =
      'w-full text-indigo-400 hover:underline text-sm';

    this.oidcButton = document.createElement('button');
    this.oidcButton.type = 'button';
    this.oidcButton.textContent = '42 LOGIN';
    this.oidcButton.className =
      'w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold';

    this.root.append(
      this.emailInput,
      this.passwordInput,
      this.submitButton,
      divider,
      this.oidcButton,
      this.switchButton
    );

    this.initEvents();
  }

  public destroy(): void {
    this.root.remove();
  }

  private initEvents() {
    this.root.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    this.switchButton.addEventListener('click', () => {
      this.root.dispatchEvent(
        new CustomEvent('switchView', { detail: { view: 'signup' } })
      );
    });

    this.oidcButton.addEventListener('click', () => {
      const params = new URLSearchParams({
        client_id: import.meta.env.VITE_42_CLIENT_ID,
        redirect_uri: import.meta.env.VITE_42_REDIRECT_URI,
        response_type: 'code',
      });

      window.location.href = `https://api.intra.42.fr/oauth/authorize?${params.toString()}`;
    });
  }

  private async handleSubmit() {
    const email = this.emailInput.value;
    const password = this.passwordInput.value;

    if (!email || !password) {
      return toaster.show('すべての項目を入力してください', 'error');
    }

    this.setLoading(true);
    const request = loginRequestForm(email, password);
    const [response, err] = await to(login(request));
    this.setLoading(false);

    if (err) {
      return toaster.show(
        'ログインに失敗しました。メールアドレスかパスワードが違います。',
        'error'
      );
    }

    this.root.dispatchEvent(
      new CustomEvent('loginSuccess', {
        detail: { data: response },
      })
    );
  }

  private setLoading(isLoading: boolean) {
    if (isLoading) loading.show();
    else loading.hide();
    this.submitButton.disabled = isLoading;
    this.submitButton.textContent = isLoading ? '認証中...' : 'ログイン';
  }

  getElement(): HTMLElement {
    return this.root;
  }
}
