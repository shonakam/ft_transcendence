import { Component } from '../../interface/Component'
import { LoginForm } from '../../components/auth/LoginForm'
import { SignupForm } from '../../components/auth/SignupForm'
import { MfaForm } from '../../components/auth/mfaForm'
import { getCookie } from '../../lib/getCookie'
import { router } from '../../router/router'

export type AuthView = 'login' | 'signup' | 'mfa'
export class AuthPage implements Component {
  private root: HTMLDivElement
  private container: HTMLDivElement
  private loginForm: LoginForm
  private signupForm: SignupForm
  private mfaForm: MfaForm

  constructor() {
    this.root = document.createElement('div')
    this.root.className = 'min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'

    this.container = document.createElement('div')
    this.container.className = 'bg-white/10 backdrop-blur rounded-xl p-8 w-[380px]'

    this.loginForm = new LoginForm()
    this.signupForm = new SignupForm()
    this.mfaForm = new MfaForm()

    this.root.appendChild(this.container)
    this.initEventListeners()
    this.determineInitialView()
  }

  private determineInitialView() {
    if (getCookie('tmpAuthToken')) {
      this.switchView('mfa')
      this.updateUrl('mfa')
      return
    }

    const params = new URLSearchParams(window.location.search)
    const viewParam = params.get('view') as AuthView
    const initialView = viewParam === 'signup' ? 'signup' : 'login'
    this.switchView(initialView)
  }

private initEventListeners() {
    const handleSwitch = (e: any) => {
      const view = e.detail?.view
      this.switchView(view)
      this.updateUrl(view)
    }

    this.signupForm.getElement().addEventListener('signupSuccess', () => {
      if (getCookie('tmpAuthToken')) {
        this.switchView('mfa', true)
        this.updateUrl('mfa')
      } else {
        this.switchView('login')
        this.updateUrl('login')
      }
    })

    this.loginForm.getElement().addEventListener('loginSuccess', () => {
      if (getCookie('tmpAuthToken')) {
        this.switchView('mfa', false)
        this.updateUrl('mfa')
      } else {
        router.navigateTo('/dashboard')
      }
    })

    this.signupForm.getElement().addEventListener('switchView', handleSwitch)
    this.loginForm.getElement().addEventListener('switchView', handleSwitch)
    this.mfaForm.getElement().addEventListener('switchView', handleSwitch)
  }

	private updateUrl(view: AuthView) {
    const url = new URL(window.location.href)
    url.searchParams.set('view', view)
    window.history.pushState({}, '', url.pathname + url.search)
  }

  private async switchView(view: AuthView, isSetup: boolean = false) {
    let element: HTMLElement
    switch (view) {
      case 'mfa':
        await this.mfaForm.activate(isSetup ? 'setup' : 'verify')
        element = this.mfaForm.getElement()
        break
      case 'signup':
        element = this.signupForm.getElement()
        break
      default:
        element = this.loginForm.getElement()
        break
    }

    this.container.replaceChildren(element)
  }

  getElement(): HTMLElement {
    return this.root
  }
}
