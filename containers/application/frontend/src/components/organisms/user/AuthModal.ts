import { Component } from '../../../interface/Component';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';

type AuthView = 'login' | 'signup';

export class AuthModal implements Component {
  private rootElement: HTMLDivElement;
  private formContainer: HTMLDivElement;
  private loginForm: LoginForm;
  private signupForm: SignupForm;

  constructor() {
    this.rootElement = document.createElement('div');
    this.rootElement.id = 'auth-modal';
    this.rootElement.className = 'hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20';

    this.loginForm = new LoginForm();
    this.signupForm = new SignupForm();

    this.render();
    this.formContainer = this.rootElement.querySelector('#auth-form-container') as HTMLDivElement;
    this.initEventListeners();
  }

  private render(): void {
    this.rootElement.innerHTML = `
      <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm relative">
        <button id="close-modal-button" class="absolute top-4 right-4 text-gray-500 hover:text-gray-800">&times;</button>
        <div id="auth-form-container"></div>
      </div>
    `;
  }

  private initEventListeners(): void {
    const closeModalButton = this.rootElement.querySelector<HTMLButtonElement>('#close-modal-button');
    closeModalButton?.addEventListener('click', () => this.close());
    this.rootElement.addEventListener('click', (e) => {
      if (e.target === this.rootElement) {
        this.close();
      }
    });

    this.loginForm.getElement().addEventListener('switchView', () => this.switchView('signup'));
    this.signupForm.getElement().addEventListener('switchView', () => this.switchView('login'));
  }

  private switchView(view: AuthView): void {
    this.formContainer.innerHTML = '';
    if (view === 'login') {
      this.formContainer.appendChild(this.loginForm.getElement());
    } else {
      this.formContainer.appendChild(this.signupForm.getElement());
    }
  }

  public open(initialView: AuthView = 'login'): void {
    this.switchView(initialView);
    this.rootElement.classList.remove('hidden');
  }

  public close(): void {
    this.rootElement.classList.add('hidden');
  }

  public getElement(): HTMLElement {
    return this.rootElement;
  }
}
