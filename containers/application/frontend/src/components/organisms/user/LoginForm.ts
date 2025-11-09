import { Component } from '../../../interface/Component';

export class LoginForm implements Component {
  private rootElement: HTMLDivElement;

  constructor() {
    this.rootElement = document.createElement('div');
    this.render();
    this.initEventListeners();
  }

  private render(): void {
    this.rootElement.innerHTML = `
      <h2 class="text-2xl font-bold mb-6 text-center">ログイン</h2>
      <form>
        <div class="mb-4">
          <label for="login-email" class="block text-left text-gray-700">メールアドレス</label>
          <input type="email" id="login-email" class="w-full px-3 py-2 border rounded-lg" placeholder="email@example.com">
        </div>
        <div class="mb-6">
          <label for="login-password" class="block text-left text-gray-700">パスワード</label>
          <input type="password" id="login-password" class="w-full px-3 py-2 border rounded-lg">
        </div>
        <button type="submit" class="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
          ログイン
        </button>
      </form>
      <p class="mt-4 text-sm text-center">アカウントをお持ちでないですか？ <button data-switch-view="signup" class="font-medium text-blue-600 hover:underline">新規登録</button></p>
    `;
  }

  private initEventListeners(): void {
    const switchToSignupButton = this.rootElement.querySelector<HTMLButtonElement>('[data-switch-view="signup"]');
    switchToSignupButton?.addEventListener('click', () => {
      // 親コンポーネントにビューの切り替えを依頼するためのカスタムイベントを発行
      const event = new CustomEvent('switchView', { detail: { view: 'signup' } });
      this.rootElement.dispatchEvent(event);
    });
  }

  public getElement(): HTMLElement {
    return this.rootElement;
  }
}
