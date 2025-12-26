import { Component } from '../../../interface/Component'
import loginTemplate from './html/login.html?raw'
import { login, loginRequestForm } from '../../../services/auth/login'
import { router } from '../../../router/router'

export class LoginForm implements Component {
  private rootElement: HTMLDivElement;

  constructor() {
    this.rootElement = document.createElement('div');
    this.render();
    this.initEventListeners();
  }

  private render(): void {
    this.rootElement.innerHTML = loginTemplate;
  }

  private initEventListeners(): void {
    const switchToSignupButton = this.rootElement.querySelector<HTMLButtonElement>('[data-switch-view="signup"]');
    switchToSignupButton?.addEventListener('click', () => {
      const event = new CustomEvent('switchView', { detail: { view: 'signup' } });
      this.rootElement.dispatchEvent(event);
    });

    const form = this.rootElement.querySelector('form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  }

  private async handleSubmit() {
    const emailInput = this.rootElement.querySelector<HTMLInputElement>('#login-email');
    const passwordInput = this.rootElement.querySelector<HTMLInputElement>('#login-password');
    if (!emailInput || !passwordInput) {
      console.error("必須フォーム要素が見つかりません。");
      return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    if (!email || !password) {
      alert('すべての項目を入力してください');
      return;
    }

    try {
      const req = loginRequestForm(email, password);
      const response = await login(req)
      console.log(response)
      console.log('ログイン成功');
      alert('ログイン成功しました');

      const authModal = document.getElementById('auth-modal')
      if (authModal) {
        authModal.classList.add('hidden')
      }

      router.navigateTo('/')
    } catch (error) {
      console.error('ログインエラー:', error);
      alert('ログインに失敗しました。もう一度お試しください。');
    }
  }

  public getElement(): HTMLElement {
    return this.rootElement;
  }
}
