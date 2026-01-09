import { Component } from '../../interface/Component';
import { AuthModal } from '../../components/organisms/user/AuthModal';

import homeTemplate from './home.html?raw';

export class HomePage implements Component {
  private rootElement: HTMLElement;
  private el: HTMLElement;
  private authModal: AuthModal;

  constructor() {
    this.rootElement = document.getElementById('app-root') as HTMLElement;
    this.el = document.createElement('main');
    this.authModal = new AuthModal();

    this.el.innerHTML = homeTemplate;
    this.initEventListeners();
  }

  public destroy(): void {
    this.el.remove();
  }

  private initEventListeners(): void {
    const loginButton = this.rootElement.querySelector<HTMLButtonElement>('#login-button');
    const signupButton = this.rootElement.querySelector<HTMLButtonElement>('#signup-button');

    loginButton?.addEventListener('click', () => this.authModal.open('login'));
    signupButton?.addEventListener('click', () => this.authModal.open('signup'));
  }

  public getElement(): HTMLElement {
    return this.el;
  }
}
