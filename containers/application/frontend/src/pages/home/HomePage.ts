import { Component } from '../../interface/Component';
import { router } from '../../router/router';
import { authStore } from '../../store/authStore';

import homeTemplate from './home.html?raw';

export class HomePage implements Component {
  private el: HTMLElement;
  private unsubscribeAuth: (() => void) | null = null;

  constructor() {
    this.el = document.createElement('main');
    this.render();
    this.initEventListeners();
    this.setupAuthSubscription();
  }

  public destroy(): void {
    if (this.unsubscribeAuth) {
      this.unsubscribeAuth();
    }
    this.el.remove();
  }

  private render(): void {
    this.el.innerHTML = homeTemplate;
  }

  private setupAuthSubscription(): void {
    this.unsubscribeAuth = authStore.subscribe((state) => {
      this.updateAuthButtons(state.isLoggedIn);
    });
  }

  private updateAuthButtons(isLoggedIn: boolean): void {
    const loginButton = this.el.querySelector<HTMLButtonElement>('#login-button');
    const signupButton = this.el.querySelector<HTMLButtonElement>('#signup-button');
    const loggedInMessage = this.el.querySelector<HTMLParagraphElement>('#logged-in-message');

    if (loginButton) {
      loginButton.disabled = isLoggedIn;
    }
    if (signupButton) {
      signupButton.disabled = isLoggedIn;
    }
    if (loggedInMessage) {
      loggedInMessage.classList.toggle('hidden', !isLoggedIn);
    }
  }

  private initEventListeners(): void {
    const loginButton =
      this.el.querySelector<HTMLButtonElement>('#login-button');
    const signupButton =
      this.el.querySelector<HTMLButtonElement>('#signup-button');

    loginButton?.addEventListener('click', () => {
      if (!authStore.isLoggedIn()) {
        router.navigateTo('/auth?view=login');
      }
    });
    signupButton?.addEventListener('click', () => {
      if (!authStore.isLoggedIn()) {
        router.navigateTo('/auth?view=signup');
      }
    });
  }

  public getElement(): HTMLElement {
    return this.el;
  }
}
