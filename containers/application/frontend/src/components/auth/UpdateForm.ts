import { Component } from '../../interface/Component';
import { putMe, userUpdateRequestForm } from '../../services/user/update';
import { toaster } from '../common/Toaster';
import { to } from '../../lib/to';
import { SessionStorage } from '../../lib/sessionStorage';
import { UserResponse } from '../../types/user';
import { config } from '../../conf';

export class UpdateForm implements Component {
  private root: HTMLFormElement;
  private usernameInput: HTMLInputElement;
  private emailInput: HTMLInputElement;
  private passwordInput: HTMLInputElement;
  private confirmPasswordInput: HTMLInputElement;
  private imageInput: HTMLInputElement;
  private previewImage: HTMLImageElement;
  private cancelButton: HTMLButtonElement;
  private submitButton: HTMLButtonElement;
  private sessionStorage: SessionStorage<UserResponse>;

  private selectedFile: File | null = null;
  private readonly DEFAULT_IMAGE = '/assets/default-profile.png';

  constructor() {
    this.sessionStorage = new SessionStorage(config.user.sessionStorageKey);
    const user = this.sessionStorage.get();

    this.root = document.createElement('form');
    this.root.className = 'flex flex-col space-y-4 w-full';

    this.previewImage = document.createElement('img');
    this.previewImage.className =
      'w-24 h-24 rounded-full mx-auto bg-white/10 object-cover border-2 border-white/10 mb-2';

    // Set initial image from user data
    let imgSrc = this.DEFAULT_IMAGE;
    if (user?.imagePath) {
      if (user.imagePath.startsWith('/assets/')) {
        imgSrc = user.imagePath;
      } else if (user.imagePath.startsWith('http')) {
        imgSrc = user.imagePath;
      } else if (user.imagePath.startsWith('/uploads/')) {
        imgSrc = `/api${user.imagePath}?t=${Date.now()}`;
      } else {
        imgSrc = `/api/uploads/${user.imagePath}?t=${Date.now()}`;
      }
    }
    this.previewImage.src = imgSrc;

    this.imageInput = document.createElement('input');
    this.imageInput.type = 'file';
    this.imageInput.accept = 'image/png'; // .PNG ONLY!!
    this.imageInput.className =
      'text-xs text-indigo-300 mx-auto block cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20';

    this.usernameInput = this.createInput('text', 'ユーザー名');
    this.emailInput = this.createInput('email', 'email@example.com');
    this.passwordInput = this.createInput(
      'password',
      '新しいパスワード（変更しない場合は空欄）'
    );
    this.confirmPasswordInput = this.createInput(
      'password',
      '新しいパスワード（確認）'
    );

    this.submitButton = document.createElement('button');
    this.submitButton.type = 'submit';
    this.submitButton.textContent = '更新する';
    this.submitButton.className =
      'w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all disabled:opacity-50';

    this.cancelButton = document.createElement('button');
    this.cancelButton.type = 'button';
    this.cancelButton.className =
      'w-full py-2 text-sm text-white hover:text-indigo-400 transition-colors mt-2 cursor-pointer';
    this.cancelButton.textContent = 'キャンセル';
    this.cancelButton.className =
      'w-full py-2 text-sm text-slate-400 hover:text-white transition-colors';

    this.root.append(
      this.previewImage,
      this.imageInput,
      this.usernameInput,
      this.emailInput,
      this.passwordInput,
      this.confirmPasswordInput,
      this.submitButton,
      this.cancelButton
    );

    this.initEvents();
  }

  destroy(): void {
    this.root.remove();
  }

  private createInput(type: string, placeholder: string): HTMLInputElement {
    const input = document.createElement('input');
    input.type = type;
    input.placeholder = placeholder;
    input.className =
      'w-full px-4 py-2 rounded-lg bg-white/5 text-white border border-white/10 focus:border-indigo-500 focus:outline-none transition-colors';
    return input;
  }

  private initEvents() {
    this.imageInput.addEventListener('change', (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files[0]) {
        this.selectedFile = files[0];
        this.previewImage.src = URL.createObjectURL(this.selectedFile);
      }
    });

    this.root.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    this.cancelButton.addEventListener('click', () => {
      this.root.dispatchEvent(new CustomEvent('cancel'));
    });
  }

  private async handleSubmit() {
    const username = this.usernameInput.value || null;
    const email = this.emailInput.value || null;
    const password = this.passwordInput.value || null;
    const confirmPassword = this.confirmPasswordInput.value || null;

    if (password && password !== confirmPassword) {
      return toaster.show('パスワードが一致しません', 'error');
    }

    try {
      this.setLoading(true);

      this.sessionStorage.delete();

      const requestData = userUpdateRequestForm(
        email,
        username,
        password,
        this.selectedFile
      );

      console.log(requestData);

      const [_, err] = await to(putMe(requestData));
      if (err) {
        return toaster.show('更新に失敗しました', 'error');
      }

      toaster.show('ユーザー情報を更新しました！', 'success');

      this.root.dispatchEvent(
        new CustomEvent('updateSuccess', { detail: { user: requestData } })
      );
    } catch (error) {
      console.error(error);
      toaster.show('更新に失敗しました', 'error');
    } finally {
      this.setLoading(false);
    }
  }

  private setLoading(isLoading: boolean) {
    this.submitButton.disabled = isLoading;
    this.submitButton.textContent = isLoading ? '更新中...' : '更新する';
  }

  getElement(): HTMLElement {
    return this.root;
  }
}
