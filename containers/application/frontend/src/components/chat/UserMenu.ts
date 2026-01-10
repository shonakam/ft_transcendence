import { Component } from '../../interface/Component';
import { chatService } from '../../services/chat/ChatService';
import { router } from '../../router/router';

export class UserMenu implements Component {
  private static instance: UserMenu | null = null;
  private el: HTMLElement;
  private currentUserId: string | null = null;
  private currentUsername: string | null = null;

  constructor() {
    this.el = document.createElement('div');
    this.el.className =
      'fixed z-50 bg-slate-800 border border-white/10 rounded-lg shadow-2xl py-2 w-48 hidden animate-in fade-in zoom-in duration-200';
    document.body.appendChild(this.el);

    // Close on click outside
    document.addEventListener('click', (e: MouseEvent) => {
      if (!this.el.contains(e.target as Node)) {
        this.hide();
      }
    });
  }

  public static getInstance(): UserMenu {
    if (!UserMenu.instance) {
      UserMenu.instance = new UserMenu();
    }
    return UserMenu.instance;
  }

  public show(userId: string, username: string, x: number, y: number) {
    this.currentUserId = userId;
    this.currentUsername = username;
    this.el.style.left = `${x}px`;
    this.el.style.top = `${y}px`;
    this.render();
    this.el.classList.remove('hidden');
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

    const dmBtn = this.createOption('💬 Go to DM', async () => {
      if (!this.currentUserId) return;
      try {
        const room = await chatService.getOrCreateDMRoom(this.currentUserId);
        // We might need a way to tell ChatPage to switch, but since they are on the same page,
        // maybe we can just use a location check or an event.
        // For now, let's navigate to /chat if not there, otherwise we might need an event system.
        if (window.location.pathname !== '/chat') {
          router.navigateTo('/chat');
        }
        // Dispatch custom event for ChatPage to listen
        window.dispatchEvent(new CustomEvent('switch-room', { detail: room }));
      } catch (error) {
        console.error('Failed to open DM', error);
      }
      this.hide();
    });

    const blockBtn = this.createOption(
      '🚫 Block User',
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
            console.error('Failed to block user', error);
          }
        }
        this.hide();
      },
      'text-red-400 hover:bg-red-500/10'
    );

    this.el.append(label, dmBtn, blockBtn);
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
}
