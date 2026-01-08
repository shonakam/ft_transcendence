import { api } from '../lib/httpClient';
import { Component } from '../interface/Component';
import { UserResponse } from '../services/user/dashboard';
import { design } from '../conf';
import { MfaForm } from '../components/auth/MfaForm';
import { router } from '../router/router';

export type DashboardView = 'game' | 'chat' | 'mfa'

export class DashboardPage implements Component {
  private el: HTMLElement
  private container: HTMLDivElement
  private mfaForm: MfaForm

  constructor() {
    this.el = document.createElement('main')
    this.el.className = design.bg

    this.container = document.createElement('div')
    this.container.className = design.container

    this.mfaForm = new MfaForm()

    this.mfaForm.getElement().addEventListener('cancel', () => {
      this.init();
    });

    this.el.appendChild(this.container)
    this.init()
  }

  private async init() {
    try {
      const user = await api.get<UserResponse>('users/me')
      this.render(user)
    } catch (error) {
      console.error("ユーザー情報の取得に失敗しました", error)
    }
  }

  private async switchView(view: DashboardView) {
    let element: HTMLElement
    switch (view) {
      case 'mfa':
        await this.mfaForm.activate('setup')
        element = this.mfaForm.getElement()
        break
      case 'game': break
      case 'chat':
        router.navigateTo('/chat');
        return;
      default:
        element = this.el
        break
    }
    this.container.replaceChildren(element!)
  }

  private render(user: UserResponse) {
    this.container.innerHTML = ''

    const title = document.createElement('h2')
    title.className = 'text-2xl font-bold text-white mb-6 text-center'
    title.textContent = 'Dashboard'

    const info = document.createElement('div')
    info.className = 'mb-8 text-slate-300 text-sm'
    info.innerHTML = `
      <p>User: <span class="text-white font-medium">${user.username}</span></p>
      <p>MFA Status: <span class="${user.is2faEnabled ? 'text-green-400' : 'text-red-400'} font-bold">
        ${user.is2faEnabled ? 'Enabled' : 'Disabled'}
      </span></p>
    `

    const menu = document.createElement('div')
    menu.className = 'space-y-4'

    const mfaBtn = this.createMenuButton('🔒 Security Settings', () => this.switchView('mfa'))
    const chatBtn = this.createMenuButton('💬 Chat Management', () => this.switchView('chat'))
    const gameBtn = this.createMenuButton('🎮 Game Start', () => this.switchView('game'))

    menu.append(mfaBtn, chatBtn, gameBtn)
    this.container.append(title, info, menu)
  }

  private createMenuButton(text: string, onClick: () => void): HTMLButtonElement {
    const btn = document.createElement('button')

    btn.className = 'w-full py-3 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all text-left px-4 flex justify-between items-center group'
    btn.innerHTML = `
      <span>${text}</span>
      <span class="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
    `
    btn.onclick = onClick
    return btn
  }

  public getElement(): HTMLElement {
    return this.el
  }
}
