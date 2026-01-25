import { Component } from '../../interface/Component';
import { createUser, userCreateRequestForm } from '../../services/user/create';
import { login, loginRequestForm } from '../../services/auth/login';
import { api, NetworkError } from '../../lib/httpClient';
import { toaster } from '../common/Toaster';
import { to } from '../../lib/to';
import { router } from '../../router/router';
import { authStore } from '../../store/authStore';

export class SignupForm implements Component {
  private root: HTMLFormElement;
  private usernameInput: HTMLInputElement;
  private emailInput: HTMLInputElement;
  private passwordInput: HTMLInputElement;
  private confirmPasswordInput: HTMLInputElement;
  private submitButton: HTMLButtonElement;
  private switchButton: HTMLButtonElement;
  private validationHint: HTMLDivElement;
  private readonly DEFAULT_IMAGE = '/assets/default-profile.png';

  constructor() {
    this.root = document.createElement('form');
    this.root.className = 'flex flex-col space-y-4 w-full';

    // 各入力フィールドの生成
    this.usernameInput = this.createInput('text', 'ユーザー名');
    this.emailInput = this.createInput('email', 'email@example.com');
    this.passwordInput = this.createInput('password', 'パスワード');
    this.confirmPasswordInput = this.createInput(
      'password',
      'パスワード（確認）'
    );

    // バリデーション条件表示
    this.validationHint = document.createElement('div');
    this.validationHint.className = 'text-xs text-slate-400 space-y-1';
    this.validationHint.innerHTML = `
      <p class="font-semibold text-slate-300">入力条件:</p>
      <ul class="list-disc list-inside space-y-0.5">
        <li>ユーザー名: 1〜20文字の英数字のみ</li>
        <li>パスワード: 12文字以上、英字・数字・記号を含む</li>
      </ul>
    `;

    // 登録ボタン
    this.submitButton = document.createElement('button');
    this.submitButton.type = 'submit';
    this.submitButton.textContent = '新規登録';
    this.submitButton.className =
      'w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all disabled:opacity-50';

    // 切り替えボタン
    this.switchButton = document.createElement('button');
    this.switchButton.type = 'button';
    this.switchButton.textContent = 'ログイン';
    this.switchButton.className =
      'text-indigo-400 hover:text-indigo-300 hover:underline text-sm block w-full text-center transition-colors';

    this.root.append(
      this.usernameInput,
      this.emailInput,
      this.passwordInput,
      this.confirmPasswordInput,
      this.validationHint,
      this.submitButton,
      this.switchButton
    );

    this.initEvents();
  }

  destroy(): void {
    this.root.remove();
  }

  private createInput(type: string, placeholder: string): HTMLInputElement {
    const input = document.createElement('input');
    input.type = type;
    input.placeholder = placeholder;
    input.className =
      'w-full px-4 py-2 rounded-lg bg-white/5 text-white border border-white/10 focus:border-indigo-500 focus:outline-none transition-colors';
    return input;
  }

  private initEvents() {
    this.root.addEventListener('submit', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.handleSubmit();
    });

    this.switchButton.addEventListener('click', () => {
      this.root.dispatchEvent(
        new CustomEvent('switchView', { detail: { view: 'login' } })
      );
    });
  }

  /*
    STEP
     - フォームバリデーション
     - 画像が選択された場合アップロード（パスを取得）
     - ユーザー作成APIリクエスト
     - 成功後に自動ログインしてHomeに遷移
   */
  private async handleSubmit() {
    const username = this.usernameInput.value;
    const email = this.emailInput.value;
    const password = this.passwordInput.value;
    const confirmPassword = this.confirmPasswordInput.value;

    if (!username || !email || !password || !confirmPassword) {
      return toaster.show('すべての項目を入力してください', 'error');
    }

    if (password !== confirmPassword) {
      return toaster.show('パスワードが一致しません', 'error');
    }

    try {
      this.setLoading(true);

      const requestData = userCreateRequestForm(
        email,
        username,
        password,
        this.DEFAULT_IMAGE
      );

      // ユーザー作成
      const [response, err] = await to(createUser(requestData));
      if (err) {
        if (err instanceof NetworkError) {
          return toaster.show(
            'サーバーに接続できません。ネットワーク接続を確認してください。',
            'error'
          );
        }
        const message =
          (err as any).error ||
          (err as any).message ||
          '予期せぬエラーが発生しました';
        return toaster.show(`${message}`, 'error');
      }

      // 登録成功後、自動ログイン
      const loginData = loginRequestForm(email, password);
      const [loginResponse, loginErr] = await to(login(loginData));
      if (loginErr) {
        // ログイン失敗時はログイン画面へ遷移
        toaster.show(
          'アカウントを作成しました。ログインしてください。',
          'success'
        );
        this.root.dispatchEvent(
          new CustomEvent('signupSuccess', { detail: { data: response } })
        );
        return;
      }

      // MFAが必要な場合
      if (loginResponse.tmpAuthToken) {
        toaster.show(
          'アカウントを作成しました。MFA認証を完了してください。',
          'success'
        );
        this.root.dispatchEvent(
          new CustomEvent('signupSuccess', {
            detail: { data: loginResponse, needMfa: true },
          })
        );
        return;
      }

      // ログイン成功、Homeへ遷移
      await authStore.checkAuthStatus();
      toaster.show('アカウントを作成しました！', 'success');
      router.navigateTo('/home');
    } catch (error: unknown) {
      if (error instanceof NetworkError) {
        toaster.show(
          'サーバーに接続できません。ネットワーク接続を確認してください。',
          'error'
        );
      } else {
        toaster.show(
          (error as Error).message ||
            '登録に失敗しました。サーバーの状態を確認してください。',
          'error'
        );
      }
    } finally {
      this.setLoading(false);
    }
  }

  private setLoading(isLoading: boolean) {
    this.submitButton.disabled = isLoading;
    this.submitButton.textContent = isLoading ? '登録中...' : '新規登録';
  }

  getElement(): HTMLElement {
    return this.root;
  }
}
