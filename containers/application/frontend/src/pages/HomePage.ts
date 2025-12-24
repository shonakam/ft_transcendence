import { Component } from "../interface/Component.js";
import { AuthModal } from '../components/organisms/user/AuthModal.js';

export class HomePage implements Component {
  private rootElement: HTMLElement;
  private authModal: AuthModal;

  constructor() {
    this.rootElement = document.createElement('section');
    this.authModal = new AuthModal();

    this.render();
    this.initEventListeners();
  }

  private render(): void {
    this.rootElement.innerHTML = `
      <div class="text-center pt-16">
        <div class="mb-6"> </div>
        <h1 class="text-4xl font-bold mb-4">Welcome</h1>
        <p class="text-lg text-gray-700">これはTypeScriptで構築されたシングルページアプリケーションのサンプルです。</p>
        <div class="mt-8 flex justify-center space-x-4">
          <button id="login-button" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg">
            ログイン
          </button>
          <button id="signup-button" class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg text-lg">
            新規登録
          </button>
        </div>
      </div>
    `;
    this.rootElement.appendChild(this.authModal.getElement());
  }

  private initEventListeners(): void {
    const loginButton = this.rootElement.querySelector<HTMLButtonElement>('#login-button');
    const signupButton = this.rootElement.querySelector<HTMLButtonElement>('#signup-button');

    loginButton?.addEventListener('click', () => this.authModal.open('login'));
    signupButton?.addEventListener('click', () => this.authModal.open('signup'));
  }

  public getElement(): HTMLElement {
    return this.rootElement;
  }
}
