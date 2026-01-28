import { Component } from '../../interface/Component';
import { api } from '../../lib/httpClient';
import { design } from '../../conf';
import { UserResponse } from '../../types/user';
import { router } from '../../router/router';

export class UserProfilePage implements Component {
  private el: HTMLElement;
  private container: HTMLDivElement;
  private userId: string | null = null;
  private user: UserResponse | null = null;
  private isLoading = true;
  private readonly DEFAULT_IMAGE = '/assets/default-profile.png';

  constructor() {
    this.el = document.createElement('main');
    this.el.className = design.bg;

    this.container = document.createElement('div');
    this.container.className = design.container;

    this.el.appendChild(this.container);

    // URLからuserIdを取得
    const params = new URLSearchParams(window.location.search);
    this.userId = params.get('id');

    this.init();
  }

  public destroy(): void {
    this.el.remove();
  }

  private async init() {
    if (!this.userId) {
      this.renderError('User ID is required');
      return;
    }

    this.renderLoading();

    try {
      // ユーザー情報を取得
      this.user = await api.get<UserResponse>(`users/${this.userId}`);
      this.render();
    } catch (error) {
      console.error('Failed to load user profile:', error);
      this.renderError('User not found');
    } finally {
      this.isLoading = false;
    }
  }

  private renderLoading() {
    this.container.innerHTML = `
      <div class="text-center text-slate-300 py-20">
        <div class="animate-pulse">
          <div class="w-24 h-24 bg-slate-700 rounded-full mx-auto mb-4"></div>
          <div class="h-6 bg-slate-700 rounded w-32 mx-auto mb-2"></div>
          <div class="h-4 bg-slate-700 rounded w-48 mx-auto"></div>
        </div>
        <p class="mt-4">Loading profile...</p>
      </div>
    `;
  }

  private renderError(message: string) {
    this.container.innerHTML = `
      <div class="text-center py-20">
        <div class="text-6xl mb-4">😢</div>
        <h2 class="text-2xl font-bold text-white mb-2">Error</h2>
        <p class="text-slate-400 mb-6">${message}</p>
        <button id="back-btn" class="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors">
          Go Back
        </button>
      </div>
    `;

    this.container.querySelector('#back-btn')?.addEventListener('click', () => {
      router.navigateTo('/home');
    });
  }

  private render() {
    if (!this.user) return;

    let imageSrc = this.DEFAULT_IMAGE;
    if (this.user.imagePath) {
      if (this.user.imagePath.startsWith('/assets/')) {
        imageSrc = this.user.imagePath;
      } else if (this.user.imagePath.startsWith('http')) {
        imageSrc = this.user.imagePath;
      } else if (this.user.imagePath.startsWith('/uploads/')) {
        imageSrc = `/api${this.user.imagePath}`;
      } else {
        imageSrc = `/api/uploads/${this.user.imagePath}`;
      }
    }

    const joinDate = new Date(this.user.createdAt).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    this.container.innerHTML = `
      <div class="max-w-2xl mx-auto">
        <!-- Back Button -->
        <button id="back-btn" class="mb-6 text-slate-400 hover:text-white transition-colors flex items-center gap-2">
          <span>←</span> Back
        </button>

        <!-- Profile Header -->
        <div class="bg-white/5 backdrop-blur rounded-2xl p-8 mb-6 border border-white/10">
          <div class="flex flex-col sm:flex-row items-center gap-6">
            <img 
              src="${imageSrc}" 
              alt="${this.user.username}'s avatar"
              class="w-28 h-28 rounded-full object-cover border-4 border-indigo-500/50"
              onerror="this.src='${this.DEFAULT_IMAGE}'"
            />
            <div class="text-center sm:text-left">
              <h1 class="text-3xl font-bold text-white mb-1">${this.user.username}</h1>
              <p class="text-slate-400">${this.user.email}</p>
              <p class="text-sm text-slate-500 mt-2">
                <span class="inline-flex items-center gap-1">
                  📅 Joined: ${joinDate}
                </span>
              </p>
              ${
                this.user.is2faEnabled
                  ? `
                <span class="inline-flex items-center gap-1 mt-2 text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded">
                  🔒 2FA Enabled
                </span>
              `
                  : ''
              }
            </div>
          </div>
        </div>

        <!-- User Info Card -->
        <div class="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
          <h2 class="text-xl font-bold text-white mb-4">User Information</h2>
          <div class="space-y-4">
            <div class="flex items-center justify-between py-2 border-b border-white/5">
              <span class="text-slate-400">User ID</span>
              <span class="text-white font-mono text-sm">${this.user.id}</span>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-white/5">
              <span class="text-slate-400">Username</span>
              <span class="text-white">${this.user.username}</span>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-white/5">
              <span class="text-slate-400">Email</span>
              <span class="text-white">${this.user.email}</span>
            </div>
            <div class="flex items-center justify-between py-2">
              <span class="text-slate-400">2FA Status</span>
              <span class="${this.user.is2faEnabled ? 'text-green-400' : 'text-slate-500'}">
                ${this.user.is2faEnabled ? '✓ Enabled' : '✗ Disabled'}
              </span>
            </div>
          </div>
        </div>
      </div>
    `;

    // Back button event
    this.container.querySelector('#back-btn')?.addEventListener('click', () => {
      window.history.back();
    });
  }

  public getElement(): HTMLElement {
    return this.el;
  }
}
