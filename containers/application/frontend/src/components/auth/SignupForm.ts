import { Component } from '../../interface/Component'
import { createUser, userCreateRequestForm } from '../../services/user/create'
import { api } from '../../lib/httpClient'
import { toaster } from '../common/Toaster'
import { to } from '../../lib/to'
import { getCookie } from '../../lib/getCookie'

export class SignupForm implements Component {
  private root: HTMLFormElement
  private usernameInput: HTMLInputElement
  private emailInput: HTMLInputElement
  private passwordInput: HTMLInputElement
  private confirmPasswordInput: HTMLInputElement
  private imageInput: HTMLInputElement
  private previewImage: HTMLImageElement
  private mfaCheckbox: HTMLInputElement
  private submitButton: HTMLButtonElement
  private switchButton: HTMLButtonElement

  private selectedFile: File | null = null
  private readonly DEFAULT_IMAGE = '/assets/default-profile.png';

  constructor() {
    this.root = document.createElement('form')
    this.root.className = 'flex flex-col space-y-4 w-full'

    // プレビュー表示エリア
    this.previewImage = document.createElement('img')
    this.previewImage.src = this.DEFAULT_IMAGE;
    this.previewImage.className =
      'w-24 h-24 rounded-full mx-auto bg-white/10 object-cover border-2 border-white/10 mb-2'

    // 画像選択
    this.imageInput = document.createElement('input')
    this.imageInput.type = 'file'
    this.imageInput.accept = 'image/*'
    this.imageInput.className =
      'text-xs text-indigo-300 mx-auto block cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20'

    // 各入力フィールドの生成
    this.usernameInput = this.createInput('text', 'ユーザー名')
    this.emailInput = this.createInput('email', 'email@example.com')
    this.passwordInput = this.createInput('password', 'パスワード')
    this.confirmPasswordInput = this.createInput('password', 'パスワード（確認）')

    // mfa 有効化チェックボックス
    const mfaContainer = document.createElement('div')
    mfaContainer.className = 'flex items-center space-x-2 py-1 px-1'

    this.mfaCheckbox = document.createElement('input')
    this.mfaCheckbox.type = 'checkbox'
    this.mfaCheckbox.id = 'mfa-enable'
    this.mfaCheckbox.className = 'w-4 h-4 rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-indigo-500 cursor-pointer'

    const mfaLabel = document.createElement('label')
    mfaLabel.htmlFor = 'mfa-enable'
    mfaLabel.textContent = '2段階認証を有効にする'
    mfaLabel.className = 'text-sm text-slate-300 cursor-pointer select-none'

    mfaContainer.append(this.mfaCheckbox, mfaLabel)

    // 登録ボタン
    this.submitButton = document.createElement('button')
    this.submitButton.type = 'submit'
    this.submitButton.textContent = '新規登録'
    this.submitButton.className =
      'w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all disabled:opacity-50'

    // 切り替えボタン
    this.switchButton = document.createElement('button')
    this.switchButton.type = 'button'
    this.switchButton.textContent = 'ログイン'
    this.switchButton.className =
      'text-indigo-400 hover:text-indigo-300 hover:underline text-sm block w-full text-center transition-colors'

    this.root.append(
      this.previewImage,
      this.imageInput,
      this.usernameInput,
      this.emailInput,
      this.passwordInput,
      this.confirmPasswordInput,
      mfaContainer,
      this.submitButton,
      this.switchButton
    )

    this.initEvents()
  }

  private createInput(type: string, placeholder: string): HTMLInputElement {
    const input = document.createElement('input')
    input.type = type
    input.placeholder = placeholder
    input.className =
      'w-full px-4 py-2 rounded-lg bg-white/5 text-white border border-white/10 focus:border-indigo-500 focus:outline-none transition-colors'
    return input
  }

  private initEvents() {
    // 画像選択時のプレビュー処理
    this.imageInput.addEventListener('change', (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files[0]) {
        this.selectedFile = files[0]
        this.previewImage.src = URL.createObjectURL(this.selectedFile)
        this.previewImage.classList.remove('hidden')
      }
    })

    // フォーム送信処理
    this.root.addEventListener('submit', e => {
      e.preventDefault()
      e.stopPropagation()
      this.handleSubmit()
    })

    // ビュー切り替えイベント
    this.switchButton.addEventListener('click', () => {
      this.root.dispatchEvent(
        new CustomEvent('switchView', { detail: { view: 'login' } })
      )
    })
  }

  /*
    STEP
     - フォームバリデーション
     - 画像が選択された場合アップロード（パスを取得）
     - ユーザー作成APIリクエスト
     - 成功後にログインビューへ遷移
       - tmpAuthTokenがセットされる場合は MFA 設定へ
   */
  private async handleSubmit() {
    const username = this.usernameInput.value
    const email = this.emailInput.value
    const password = this.passwordInput.value
    const confirmPassword = this.confirmPasswordInput.value
    const mfaEnabled = this.mfaCheckbox.checked

    if (!username || !email || !password || !confirmPassword) {
      return toaster.show('すべての項目を入力してください', 'error')
    }

    if (password !== confirmPassword) {
      return toaster.show('パスワードが一致しません', 'error')
    }


    try {
      this.setLoading(true)

      let imagePath: string | null = null
      if (this.selectedFile && !this.previewImage.src.endsWith(this.DEFAULT_IMAGE)) {
        try {
          const formData = new FormData()
          formData.append('file', this.selectedFile)
          const uploadRes = await api.post<{ path: string }>('upload', formData)
          imagePath = uploadRes.path
        } catch (error: any) {
          toaster.show(error.message || '画像のアップロードに失敗しました。', 'error')
          throw new Error('画像のアップロードに失敗しました。')
        }
      }

      const requestData = userCreateRequestForm(
        email,
        username,
        password,
        imagePath,
        mfaEnabled
      )

      const [response, err] = await to(createUser(requestData))
      console.log('API Success:', response)

      toaster.show('アカウントを作成しました！ログインしてください。', 'success')
      const hasAuth = !!getCookie('tmpAuthToken')
      if (hasAuth) {
        alert("HI")
      }
      this.root.dispatchEvent(new CustomEvent('signupSuccess'))
    } catch (error: any) {
      console.error('Signup Error:', error)
      toaster.show(error.message || '登録に失敗しました。サーバーの状態を確認してください。', 'error')
    } finally {
      this.setLoading(false)
    }
  }

  private setLoading(isLoading: boolean) {
    this.submitButton.disabled = isLoading
    this.submitButton.textContent = isLoading ? '登録中...' : '新規登録'
  }

  getElement(): HTMLElement {
    return this.root
  }
}
