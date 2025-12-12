import { Component } from '../../../interface/Component';
import signupTemplate from './html/signup.html?raw';
import { createUser, userCreateRequestForm } from '../../../services/user/create';

export class SignupForm implements Component {
  private rootElement: HTMLDivElement;

  constructor() {
    this.rootElement = document.createElement('div');
    this.render();
    this.initEventListeners();
  }

  private render(): void {
    this.rootElement.innerHTML = signupTemplate;
  }

  private initEventListeners(): void {
    const switchToLoginButton = this.rootElement.querySelector<HTMLButtonElement>('[data-switch-view="login"]');
    switchToLoginButton?.addEventListener('click', () => {
      // 親コンポーネントにビューの切り替えを依頼するためのカスタムイベントを発行
      const event = new CustomEvent('switchView', { detail: { view: 'login' } });
      this.rootElement.dispatchEvent(event);
    });

    const form = this.rootElement.querySelector('form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    const uploadButton = this.rootElement.querySelector<HTMLButtonElement>('#upload-button');
    const fileInput = this.rootElement.querySelector<HTMLInputElement>('#avatar-upload-input');
    const previewImg = this.rootElement.querySelector<HTMLImageElement>('#avatar-preview');
    const previewText = this.rootElement.querySelector<HTMLSpanElement>('#preview-text');

    uploadButton?.addEventListener('click', () => fileInput?.click());

    fileInput?.addEventListener('change', (event) => {
        const target = event.target as HTMLInputElement;
        if (target.files && target.files[0]) {
            const file = target.files[0];
            const reader = new FileReader();

            reader.onload = (e) => {
                previewImg!.src = e.target!.result as string;
                previewImg!.classList.remove('hidden');
                previewText!.classList.add('hidden');
            };
            reader.readAsDataURL(file); // プレビュー用のデータURLとして読み込む
        }
    });
  }

  private async handleSubmit(): Promise<void> {
    const form = this.rootElement.querySelector<HTMLFormElement>('form');
    const emailInput = this.rootElement.querySelector<HTMLInputElement>('#signup-email');
    const passwordInput = this.rootElement.querySelector<HTMLInputElement>('#signup-password');
    const confirmPasswordInput = this.rootElement.querySelector<HTMLInputElement>('#signup-password-confirm');
    const usernameInput = this.rootElement.querySelector<HTMLInputElement>('#signup-username');
    const fileInput = this.rootElement.querySelector<HTMLInputElement>('#avatar-upload-input');
    const is2faInput = this.rootElement.querySelector<HTMLInputElement>('#signup-2fa-enabled');
    if (!form || !emailInput || !passwordInput || !confirmPasswordInput || !usernameInput) {
      console.error("必須フォーム要素が見つかりません。");
      return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const username = usernameInput.value.trim();

    if (!email || !password || !confirmPassword || !username) {
      alert('すべての項目を入力してください');
      return;
    }

    if (password !== confirmPassword) {
      alert('パスワードが一致しません');
      return;
    }

    try {
      const formData = new FormData(form);
      formData.delete('signup-password-confirm');

      if (is2faInput) {
        const isEnabled = is2faInput.checked ? 'true' : 'false';
        formData.set('is2faEnabled', isEnabled);
      }

      // TODO: 画像のアップロードとパスの取得
      const imageFile = fileInput!.files ? fileInput!.files[0] : null;
      if (imageFile) {
          formData.append('avatar', imageFile, imageFile.name);
      } else {
        // TODO: デフォルトアバターを設定
      }

      let isEnabled = is2faInput?.checked ? true : false;
      const req = userCreateRequestForm(email, username, password, null, isEnabled);
      const response = await createUser(req)

      console.log('サインアップ成功:', response);
      alert('アカウントが作成されました。ログインしてください。');

      const event = new CustomEvent('switchView', { detail: { view: 'login' } });
      this.rootElement.dispatchEvent(event);
    } catch (error) {
      console.error('サインアップエラー:', error);
      alert('登録に失敗しました。もう一度お試しください。');
    }
  }

  public getElement(): HTMLElement {
    return this.rootElement;
  }
}
