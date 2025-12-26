import { Component } from '../../interface/Component'

export class LoginForm implements Component {
  private root: HTMLFormElement
  private emailInput: HTMLInputElement
  private passwordInput: HTMLInputElement
  private submitButton: HTMLButtonElement
  private switchButton: HTMLButtonElement

  constructor() {
    this.root = document.createElement('form')
    this.root.className = 'space-y-4'

    this.emailInput = document.createElement('input')
    this.emailInput.type = 'email'
    this.emailInput.placeholder = 'email@example.com'
    this.emailInput.className =
      'w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20'

    this.passwordInput = document.createElement('input')
    this.passwordInput.type = 'password'
    this.passwordInput.placeholder = 'パスワード'
    this.passwordInput.className =
      'w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20'

    this.submitButton = document.createElement('button')
    this.submitButton.type = 'submit'
    this.submitButton.textContent = 'ログイン'
    this.submitButton.className =
      'w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold'

    this.switchButton = document.createElement('button')
    this.switchButton.type = 'button'
    this.switchButton.textContent = '新規登録'
    this.switchButton.className = 'w-full text-indigo-400 hover:underline text-sm'

    this.root.append(
      this.emailInput,
      this.passwordInput,
      this.submitButton,
      this.switchButton
    )

    this.initEvents()
  }

  private initEvents() {
    this.root.addEventListener('submit', e => {
      e.preventDefault()
      this.handleSubmit()
    })

    this.switchButton.addEventListener('click', () => {
      this.root.dispatchEvent(
        new CustomEvent('switchView', { detail: { view: 'signup' } })
      )
    })
  }

  private handleSubmit() {
    const email = this.emailInput.value
    const password = this.passwordInput.value

    if (!email || !password) {
      alert('すべての項目を入力してください')
      return
    }

    // login ロジック
  }

  getElement(): HTMLElement {
    return this.root
  }
}
