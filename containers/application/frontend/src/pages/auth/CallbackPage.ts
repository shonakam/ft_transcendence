import { loading } from '../../components/common/Loading';
import { toaster } from '../../components/common/Toaster';
import { design } from '../../conf';
import { Component } from '../../interface/Component';
import { router } from '../../router/router';
import { oidc, oidcRequestForm } from '../../services/auth/oidc';

export class CallbackPage implements Component {
  private root: HTMLDivElement;

  constructor() {
    this.root = document.createElement('div');
    this.root.className = design.bg;

    this.handleCallback();
  }

  destroy(): void {
    this.root.remove();
  }

  private async handleCallback() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (!code) {
      toaster.show('Authentication Failed', 'error');
      router.navigateTo('/auth');
      return;
    }

    toaster.show(`OAuth code received`, 'info');

    const provider = 'ft'; // TODO: sessionStorage 等から取得

    try {
      const data = oidcRequestForm(code);

      loading.show();
      const response = await oidc(provider, data);
      loading.hide();

      sessionStorage.setItem('pending_auth_data', JSON.stringify(response));
      router.navigateTo('/auth');
    } catch (err) {
      loading.hide();
      toaster.show('Login failed', 'error');
      router.navigateTo('/auth');
    }
  }

  getElement(): HTMLElement {
    return this.root;
  }
}
