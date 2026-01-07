import { Component } from '../../interface/Component';
import { LoginForm } from '../../components/auth/LoginForm';
import { SignupForm } from '../../components/auth/SignupForm';
import { MfaForm } from '../../components/auth/MfaForm';
import { router } from '../../router/router';
import { design } from '../../conf';

export type AuthView = 'login' | 'signup' | 'mfa';

export class AuthPage implements Component {
  private root: HTMLDivElement;
  private container: HTMLDivElement;
  private loginForm: LoginForm;
  private signupForm: SignupForm;
  private mfaForm: MfaForm;

  constructor() {
    this.root = document.createElement('div');
    this.root.className = design.bg;

    this.container = document.createElement('div');
    this.container.className = design.container;

    this.loginForm = new LoginForm();
    this.signupForm = new SignupForm();
    this.mfaForm = new MfaForm();

    this.root.appendChild(this.container);
    this.initEventListeners();
    this.determineInitialView();
  }

  private determineInitialView() {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view') as AuthView;
    const initialView = viewParam === 'signup' ? 'signup' : 'login';
    this.switchView(initialView);
  }

  private initEventListeners() {
    const handleSwitch = (e: any) => {
      const view = e.detail?.view;
      this.switchView(view);
      this.updateUrl(view);
    };

    this.signupForm
      .getElement()
      .addEventListener('signupSuccess', (e: Event) => {
        this.switchView('login');
        this.updateUrl('login');
      });

    this.loginForm.getElement().addEventListener('loginSuccess', (e: Event) => {
      const customEvent = e as CustomEvent;
      const data = customEvent.detail.data;
      if (data.tmpAuthToken) {
        this.switchView('mfa');
        this.updateUrl('mfa');
      } else {
        router.navigateTo('/dashboard');
      }
    });

    this.signupForm.getElement().addEventListener('switchView', handleSwitch);
    this.loginForm.getElement().addEventListener('switchView', handleSwitch);
    this.mfaForm.getElement().addEventListener('switchView', handleSwitch);
  }

  private updateUrl(view: AuthView) {
    const url = new URL(window.location.href);
    url.searchParams.set('view', view);
    window.history.pushState({}, '', url.pathname + url.search);
  }

  private async switchView(view: AuthView) {
    let element: HTMLElement;
    switch (view) {
      case 'mfa':
        await this.mfaForm.activate('verify');
        element = this.mfaForm.getElement();
        break;
      case 'signup':
        element = this.signupForm.getElement();
        break;
      default:
        element = this.loginForm.getElement();
        break;
    }

    this.container.replaceChildren(element);
  }

  getElement(): HTMLElement {
    return this.root;
  }
}
