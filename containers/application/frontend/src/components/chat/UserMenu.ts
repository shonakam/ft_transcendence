import { Component } from '../../interface/Component';
import { chatService } from '../../services/chat/ChatService';
import { router } from '../../router/router';
import { getUserById } from '../../services/user/dashboard';
import { getUserWinRate, UserWinRate } from '../../services/game/stats';
import { userRelationshipService } from '../../services/user/UserRelationshipService';
import { toaster } from '../common/Toaster';

export class UserMenu implements Component {
  private static instance: UserMenu | null = null;
  private el: HTMLElement;
  private currentUserId: string | null = null;
  private currentUsername: string | null = null;
  private currentWinRate: UserWinRate | null = null;

  private handleOutsideClick = (e: MouseEvent) => {
    if (this.el && !this.el.contains(e.target as Node)) {
      this.hide();
    }
  };

  constructor() {
    this.el = document.createElement('div');
    this.el.className =
      'fixed z-50 bg-slate-800 border border-white/10 rounded-lg shadow-2xl py-2 w-48 hidden animate-in fade-in zoom-in duration-200';
    document.body.appendChild(this.el);

    // Close on click outside
    document.addEventListener('click', this.handleOutsideClick);
  }

  public destroy(): void {
    document.removeEventListener('click', this.handleOutsideClick);
    this.el.remove();
    if (UserMenu.instance === this) {
      UserMenu.instance = null;
    }
  }

  public static getInstance(): UserMenu {
    if (!UserMenu.instance) {
      UserMenu.instance = new UserMenu();
    }
    return UserMenu.instance;
  }

  public async show(userId: string, username: string, x: number, y: number) {
    this.currentUserId = userId;
    this.currentUsername = username;
    this.currentWinRate = null;
    this.el.style.left = `${x}px`;
    this.el.style.top = `${y}px`;
    this.render();
    this.el.classList.remove('hidden');

    // Fetch user info and win rate in parallel
    try {
      const [user, winRate] = await Promise.all([
        getUserById(userId),
        getUserWinRate(userId),
      ]);
      if (this.currentUserId === userId) {
        this.currentUsername = user.username;
        this.currentWinRate = winRate;
        this.render();
      }
    } catch (error) {
      // Silently fail - username label already shown
    }
  }

  public hide() {
    this.el.classList.add('hidden');
  }

  private render() {
    this.el.innerHTML = '';

    const label = document.createElement('div');
    label.className =
      'px-4 py-2 text-xs text-slate-400 border-b border-white/5 mb-1';
    label.textContent = `@${this.currentUsername}`;

    // Win rate display
    const statsDiv = document.createElement('div');
    statsDiv.className = 'px-4 py-2 border-b border-white/5 mb-1';

    if (this.currentWinRate) {
      const { totalGames, wins, losses, winRate } = this.currentWinRate;
      statsDiv.innerHTML = `
        <div class="text-xs text-slate-400 mb-1">Game Stats</div>
        <div class="flex items-center gap-2">
          <span class="text-sm font-bold ${winRate >= 50 ? 'text-green-400' : 'text-red-400'}">${winRate}%</span>
          <span class="text-xs text-slate-500">${wins}W - ${losses}L (${totalGames} games)</span>
        </div>
      `;
    } else {
      statsDiv.innerHTML = `
        <div class="text-xs text-slate-400 mb-1">Game Stats</div>
        <div class="text-xs text-slate-500">Loading...</div>
      `;
    }

    const dmBtn = this.createOption('Go to DM', async () => {
      if (!this.currentUserId) return;
      try {
        const room = await chatService.getOrCreateDMRoom(this.currentUserId);

        if (window.location.pathname !== '/chat') {
          router.navigateTo('/chat');
        }
        // Dispatch custom event for ChatPage to listen
        window.dispatchEvent(new CustomEvent('switch-room', { detail: room }));
      } catch (error) {
        toaster.show('Failed to open DM', 'error');
      }
      this.hide();
    });

    const inviteBtn = this.createOption('Invite to Game', async () => {
      if (!this.currentUserId) return;
      // Don't invite yourself
      if (this.currentUserId === (window as any).currentUser?.id) return;

      // Create game and send invite without navigating
      await this.createGameAndInvite(this.currentUserId);
      this.hide();
    });

    const friendBtn = this.createOption('Add Friend', async () => {
      if (!this.currentUserId) return;
      try {
        await userRelationshipService.requestFriend(this.currentUserId);
        toaster.show('Friend request sent', 'success');
      } catch (error) {
        toaster.show('Failed to send friend request', 'error');
      }
      this.hide();
    });

    const blockBtn = this.createOption(
      'Block User',
      async () => {
        if (!this.currentUserId) return;
        if (
          confirm(`Are you sure you want to block ${this.currentUsername}?`)
        ) {
          try {
            await chatService.blockUser(this.currentUserId);
            window.dispatchEvent(
              new CustomEvent('user-blocked', { detail: this.currentUserId })
            );
          } catch (error) {
            toaster.show('Failed to block user', 'error');
          }
        }
        this.hide();
      },
      'text-red-400 hover:bg-red-500/10'
    );

    this.el.append(label, statsDiv, dmBtn, inviteBtn, friendBtn, blockBtn);
  }

  private createOption(
    text: string,
    onClick: () => void,
    className: string = 'text-white hover:bg-white/5'
  ): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.className = `w-full text-left px-4 py-2 text-sm transition-colors ${className}`;
    btn.textContent = text;
    btn.onclick = (e: MouseEvent) => {
      e.stopPropagation();
      onClick();
    };
    return btn;
  }

  public getElement(): HTMLElement {
    return this.el;
  }

  private async createGameAndInvite(targetUserId: string) {
    // ゲームページに遷移し、そこでゲームを作成して招待を送る
    // これによりWebSocket接続が維持される
    router.navigateTo(`/game/remote?inviteUserId=${targetUserId}`);
  }
}
