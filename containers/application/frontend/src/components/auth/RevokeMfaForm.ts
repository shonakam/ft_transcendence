import { Component } from '../../interface/Component';
import { api } from '../../lib/httpClient';
import { to } from '../../lib/to';
import { toaster } from '../common/Toaster';

export class RevokeMfaForm implements Component {
  private root: HTMLFormElement;
  private codeInput: HTMLInputElement;
  private submitButton: HTMLButtonElement;

  constructor() {
    this.root = document.createElement('form');
    this.root.className =
      'flex flex-col space-y-4 p-6 bg-rose-500/5 border border-rose-500/20 rounded-xl';

    // 説明文
    const title = document.createElement('h3');
    title.className = 'text-lg font-bold text-rose-400';
    title.textContent = '2段階認証の解除';

    const description = document.createElement('p');
    description.className = 'text-sm text-slate-400';
    description.textContent =
      'セキュリティ保護のため、現在の認証コードを入力して解除を確定してください。';

    this.codeInput = document.createElement('input');
    this.codeInput.type = 'text';
    this.codeInput.maxLength = 6;
    this.codeInput.placeholder = '000000';
    this.codeInput.className =
      'w-full px-4 py-3 rounded-lg bg-white/5 text-white text-center text-2xl font-mono tracking-widest border border-white/10 focus:border-rose-500 outline-none transition-colors';

    this.submitButton = document.createElement('button');
    this.submitButton.type = 'submit';
    this.submitButton.className =
      'w-full py-3 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-500 transition-all active:scale-[0.98]';
    this.submitButton.textContent = '解除を実行する';

    this.root.append(title, description, this.codeInput, this.submitButton);
    this.initEvents();
  }

  private initEvents() {
    this.root.addEventListener('submit', async (e) => {
      e.preventDefault();

      const code = this.codeInput.value;
      if (code.length !== 6)
        return toaster.show('6桁のコードを入力してください', 'error');

      if (
        !confirm(
          '本当に2段階認証を解除しますか？セキュリティレベルが低下します。'
        )
      )
        return;

      this.setLoading(true);

      // バックエンドの DELETE /auth/revoke-mfa/totp を叩く
      // ボディに code を含める（Fastify側のスキーマに合わせて調整）
      const [_, err] = await to(
        api.delete('auth/revoke-mfa/totp', {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }), // deleteメソッドにbodyを含める場合の形式
        })
      );

      this.setLoading(false);

      if (err) {
        return toaster.show(err.message || '解除に失敗しました', 'error');
      }

      toaster.show('2段階認証を解除しました', 'success');

      // 親コンポーネント（SettingsPageなど）に通知してUIを更新させる
      this.root.dispatchEvent(new CustomEvent('revokeSuccess'));
    });
  }


  destroy(): void {
    this.root.remove();
  }

  private setLoading(isLoading: boolean) {
    this.submitButton.disabled = isLoading;
    this.submitButton.textContent = isLoading ? '解除中...' : '解除を実行する';
    this.codeInput.disabled = isLoading;
  }

  getElement(): HTMLElement {
    return this.root;
  }
}
