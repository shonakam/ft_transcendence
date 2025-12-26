import { Component } from '../../../interface/Component';
import { LoginForm } from '../../auth/LoginForm';
import { SignupForm } from '../../auth/SignupForm';

type AuthView = 'login' | 'signup';

export class AuthModal implements Component {
  private rootElement: HTMLDivElement;
  private formContainer: HTMLDivElement;
  private loginForm: LoginForm;
  private signupForm: SignupForm;

  constructor() {
    this.rootElement = document.createElement('div');
    this.rootElement.id = 'auth-modal';
    this.rootElement.className = 'hidden fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-20';

    this.loginForm = new LoginForm();
    this.signupForm = new SignupForm();

    this.render();
    this.formContainer = this.rootElement.querySelector('#auth-form-container') as HTMLDivElement;
    this.initEventListeners();
  }

  private render(): void {
    this.rootElement.innerHTML = `
      <div class="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-black"></div>
      <div class="absolute inset-0 opacity-20 bg-[url('/noise.png')]"></div>

      <div class="relative z-10 w-full max-w-md">
        <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-10">
          <div id="auth-form-container"></div>
        </div>
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
