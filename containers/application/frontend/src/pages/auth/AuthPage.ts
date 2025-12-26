import { Component } from '../../interface/Component'
import { LoginForm } from '../../components/auth/LoginForm';
import { SignupForm } from '../../components/auth/SignupForm';

export class AuthPage implements Component {
  private root: HTMLDivElement;
  private container: HTMLDivElement;
  private loginForm: LoginForm;
  private signupForm: SignupForm;

  constructor() {
    this.root = document.createElement('div');
    this.root.className = 'min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'

    this.container = document.createElement('div')
    this.container.className = 'bg-white/10 backdrop-blur rounded-xl p-8 w-[380px]'

    this.loginForm = new LoginForm();
    this.signupForm = new SignupForm();

    this.root.appendChild(this.container)
    this.initEventListeners()

		const params = new URLSearchParams(window.location.search)
    const viewParam = params.get('view')
    const initialView = viewParam === 'signup' ? 'signup' : 'login'
    this.switchView(initialView);
  }

  private initEventListeners() {
		this.loginForm.getElement().addEventListener('switchView', (e: any) => {
      this.switchView(e.detail?.view || 'signup');
      this.updateUrl(e.detail?.view || 'signup');
    })
    this.signupForm.getElement().addEventListener('switchView', (e: any) => {
      this.switchView(e.detail?.view || 'login');
      this.updateUrl(e.detail?.view || 'login');
    })
  }

	private updateUrl(view: 'login' | 'signup') {
    const url = new URL(window.location.href);
    url.searchParams.set('view', view);
    window.history.pushState({}, '', url);
  }

  private switchView(view: 'login' | 'signup') {
    this.container.replaceChildren(
      view === 'login'
        ? this.loginForm.getElement()
        : this.signupForm.getElement()
    );
  }

  getElement(): HTMLElement {
    return this.root;
  }
}
