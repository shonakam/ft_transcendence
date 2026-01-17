import { Component } from '../../interface/Component';
import { api } from '../../lib/httpClient';
import { to } from '../../lib/to';
import { router } from '../../router/router';
import { setupMfa } from '../../services/auth/setupMfa';
import { toaster } from '../common/Toaster';

// import QRCode from 'qrcode'

export type MfaMode = 'setup' | 'verify';

export class MfaForm implements Component {
  private root: HTMLFormElement;
  private qrSection: HTMLDivElement;
  private qrImage: HTMLImageElement;
  private codeInput: HTMLInputElement;
  private submitButton: HTMLButtonElement;
  private cancelButton: HTMLButtonElement;
  private mode: MfaMode = 'verify';

  constructor() {
    this.root = document.createElement('form');
    this.root.className = 'flex flex-col space-y-6 w-full';

    this.qrSection = document.createElement('div');
    this.qrSection.className =
      'hidden flex flex-col items-center space-y-3 p-4 bg-white/5 rounded-lg border border-white/10';

    this.qrImage = document.createElement('img');
    this.qrImage.className = 'w-40 h-40 bg-white p-2 rounded';

    const qrText = document.createElement('p');
    qrText.className = 'text-xs text-slate-400 text-center';
    qrText.textContent = '認証アプリでQRコードをスキャンしてください';
    this.qrSection.append(this.qrImage, qrText);

    const refreshBtn = document.createElement('button');
    refreshBtn.type = 'button';
    refreshBtn.className =
      'text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors';
    refreshBtn.innerHTML = '<span>🔄</span> 再読み込み';
    refreshBtn.onclick = () => this.fetchAndGenerateQrCode();
    this.qrSection.append(this.qrImage, refreshBtn);

    this.codeInput = document.createElement('input');
    this.codeInput.type = 'text';
    this.codeInput.maxLength = 6;
    this.codeInput.placeholder = '000000';
    this.codeInput.className =
      'w-full px-4 py-3 rounded-lg bg-white/5 text-white text-center text-2xl font-mono tracking-widest border border-white/10 focus:border-indigo-500 outline-none';

    this.submitButton = document.createElement('button');
    this.submitButton.type = 'submit';
    this.submitButton.className =
      'w-full py-3 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-colors';
    this.submitButton.textContent = '認証する';

    this.cancelButton = document.createElement('button');
    this.cancelButton.type = 'button';
    this.cancelButton.className =
      'w-full py-2 text-sm text-white hover:text-indigo-400 transition-colors mt-2 cursor-pointer';
    this.cancelButton.textContent = 'キャンセル';

    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'flex flex-col space-y-2 mt-4';

    this.submitButton.className =
      'w-full py-3 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-colors';
    this.cancelButton.className =
      'w-full py-2 text-sm text-slate-400 hover:text-white transition-colors';

    buttonGroup.append(this.submitButton, this.cancelButton);

    this.root.innerHTML = '';
    this.root.append(this.qrSection, this.codeInput, buttonGroup);
    this.initEvents();
  }

  destroy(): void {
    this.root.remove();
  }

  private async fetchAndGenerateQrCode() {
    this.qrImage.style.opacity = '0.5';
    const [res, err] = await to(setupMfa());

    if (err) {
      this.qrImage.style.opacity = '1';
      console.warn('MFA Setup Error:', err);
      return toaster.show('QRコードの取得に失敗しました', 'error');
    }

    if (res && res.uri) {
      try {
        const dataUrl = await QRCode.toDataURL(res.uri, {
          width: 200,
          margin: 2,
        });
        this.qrImage.src = dataUrl;
      } catch (qrErr) {
        console.error('QR Generation failed', qrErr);
        toaster.show('QRコードの生成に失敗しました', 'error');
      }
    }
  }

  async activate(mode: MfaMode) {
    this.mode = mode;
    this.codeInput.value = '';

    if (mode === 'setup') {
      this.qrSection.classList.remove('hidden');
      this.submitButton.textContent = '設定を完了する';
      await this.fetchAndGenerateQrCode();
    } else {
      this.qrSection.classList.add('hidden');
      this.submitButton.textContent = 'ログイン';
    }
  }

  private initEvents() {
    this.root.addEventListener('submit', async (e) => {
      e.preventDefault();
      const code = this.codeInput.value;
      if (code.length !== 6)
        return toaster.show('6桁のコードを入力してください', 'error');

      const [_, err] = await to(api.post('auth/verify-mfa/totp', { code }));

      if (err) return toaster.show('認証コードが正しくありません', 'error');

      toaster.show('認証に成功しました', 'success');
      router.navigateTo('/dashboard');
    });

    this.cancelButton.addEventListener('click', () => {
      this.root.dispatchEvent(new CustomEvent('cancel'));
    });
  }

  getElement(): HTMLElement {
    return this.root;
  }
}
