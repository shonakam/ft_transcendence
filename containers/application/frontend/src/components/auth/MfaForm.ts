import { Component } from '../../interface/Component'
import { api } from '../../lib/httpClient'
import { to } from '../../lib/to'
import { router } from '../../router/router'
import { toaster } from '../common/Toaster'

export type MfaMode = 'setup' | 'verify'

export class MfaForm implements Component {
	private root: HTMLFormElement
  private qrSection: HTMLDivElement
  private qrImage: HTMLImageElement
  private codeInput: HTMLInputElement
  private submitButton: HTMLButtonElement
  private mode: MfaMode = 'verify'

	constructor() {
		this.root = document.createElement('form')
    this.root.className = 'flex flex-col space-y-6 w-full'

		this.qrSection = document.createElement('div')
    this.qrSection.className = 'hidden flex flex-col items-center space-y-3 p-4 bg-white/5 rounded-lg border border-white/10'

    this.qrImage = document.createElement('img')
    this.qrImage.className = 'w-40 h-40 bg-white p-2 rounded'

    const qrText = document.createElement('p')
    qrText.className = 'text-xs text-slate-400 text-center'
    qrText.textContent = '認証アプリでQRコードをスキャンしてください'
    this.qrSection.append(this.qrImage, qrText)

    this.codeInput = document.createElement('input')
    this.codeInput.type = 'text'
    this.codeInput.maxLength = 6
    this.codeInput.placeholder = '000000'
    this.codeInput.className = 'w-full px-4 py-3 rounded-lg bg-white/5 text-white text-center text-2xl font-mono tracking-widest border border-white/10 focus:border-indigo-500 outline-none'

    this.submitButton = document.createElement('button')
    this.submitButton.type = 'submit'
    this.submitButton.className = 'w-full py-3 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-colors'
    this.submitButton.textContent = '認証する'

    this.root.append(this.qrSection, this.codeInput, this.submitButton)
    this.initEvents()
	}

	async activate(mode: MfaMode) {
    this.mode = mode
    this.codeInput.value = ''

    if (mode === 'setup') {
      this.qrSection.classList.remove('hidden')
      this.submitButton.textContent = '設定を完了する'
      await this.fetchQrCode()
    } else {
      this.qrSection.classList.add('hidden')
      this.submitButton.textContent = 'ログイン'
    }
  }

	private async fetchQrCode() {
    const [res, err] = await to(api.post<{ qrCodeUrl: string }>('auth/setup-mfa/totp', {}))
    if (err) return toaster.show('QRコードの取得に失敗しました', 'error')
    if (res) this.qrImage.src = res.qrCodeUrl
  }

  private initEvents() {
    this.root.addEventListener('submit', async (e) => {
      e.preventDefault()
      const code = this.codeInput.value
      if (code.length !== 6) return toaster.show('6桁のコードを入力してください', 'error')

      const [_, err] = await to(api.post('auth/verify-mfa/totp', { code }))

      if (err) return toaster.show('認証コードが正しくありません', 'error')

      toaster.show('認証に成功しました', 'success')
      router.navigateTo('/dashboard')
    })
  }

	getElement(): HTMLElement {
		return this.root
	}
}