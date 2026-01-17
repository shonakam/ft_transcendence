import { Component } from '../../interface/Component';
import { router } from '../../router/router';

import homeTemplate from './home.html?raw';

export class HomePage implements Component {
  private el: HTMLElement;

  constructor() {
    this.el = document.createElement('main');
    this.render();
    this.initEventListeners();
  }

  public destroy(): void {
    this.el.remove();
  }

  private render(): void {
    this.el.innerHTML = homeTemplate;
  }

  private initEventListeners(): void {
    const loginButton = this.el.querySelector<HTMLButtonElement>('#login-button');
    const signupButton = this.el.querySelector<HTMLButtonElement>('#signup-button');

    loginButton?.addEventListener('click', () => {
      router.navigateTo('/auth?view=login');
    });
    signupButton?.addEventListener('click', () => {
      router.navigateTo('/auth?view=signup');
    });
  }

  public getElement(): HTMLElement {
    return this.el;
  }
}
