import { Component } from "../../interface/Component";
import { AuthModal } from '../../components/organisms/user/AuthModal';
import homeTemplate from './home.html?raw';

export class HomePage implements Component {
  private rootElement: HTMLElement;
  private authModal: AuthModal;

  constructor() {
    this.rootElement = document.createElement('section');
    this.authModal = new AuthModal();

    this.render();
    // this.initEventListeners();
  }

  private render(): void {
    this.rootElement.innerHTML = homeTemplate;
    // this.rootElement.appendChild(this.authModal.getElement());
  }

  // private initEventListeners(): void {
  //   const loginButton = this.rootElement.querySelector<HTMLButtonElement>('#login-button');
  //   const signupButton = this.rootElement.querySelector<HTMLButtonElement>('#signup-button');

  //   loginButton?.addEventListener('click', () => this.authModal.open('login'));
  //   signupButton?.addEventListener('click', () => this.authModal.open('signup'));
  // }

  public getElement(): HTMLElement {
    return this.rootElement;
  }
}
