import { Component } from '../../../interface/Component';

export class SignupForm implements Component {
  private rootElement: HTMLDivElement;

  constructor() {
    this.rootElement = document.createElement('div');
    this.render();
    this.initEventListeners();
  }

  private render(): void {
    this.rootElement.innerHTML = `
      <h2 class="text-2xl font-bold mb-6 text-center">新規登録</h2>
      <form>
        <div class="mb-4">
          <label for="signup-email" class="block text-left text-gray-700">メールアドレス</label>
          <input type="email" id="signup-email" class="w-full px-3 py-2 border rounded-lg" placeholder="email@example.com">
        </div>
        <div class="mb-4">
          <label for="signup-password" class="block text-left text-gray-700">パスワード</label>
          <input type="password" id="signup-password" class="w-full px-3 py-2 border rounded-lg">
        </div>
        <div class="mb-6">
          <label for="signup-password-confirm" class="block text-left text-gray-700">パスワード (確認用)</label>
          <input type="password" id="signup-password-confirm" class="w-full px-3 py-2 border rounded-lg">
        </div>
        <button type="submit" class="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
          登録する
        </button>
      </form>
      <p class="mt-4 text-sm text-center">すでにアカウントをお持ちですか？ <button data-switch-view="login" class="font-medium text-blue-600 hover:underline">ログイン</button></p>
    `;
  }

  private initEventListeners(): void {
    const switchToLoginButton = this.rootElement.querySelector<HTMLButtonElement>('[data-switch-view="login"]');
    switchToLoginButton?.addEventListener('click', () => {
      // 親コンポーネントにビューの切り替えを依頼するためのカスタムイベントを発行
      const event = new CustomEvent('switchView', { detail: { view: 'login' } });
      this.rootElement.dispatchEvent(event);
    });
  }

  public getElement(): HTMLElement {
    return this.rootElement;
  }
}
