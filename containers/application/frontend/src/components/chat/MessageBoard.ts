import { Component } from '../../interface/Component';
import { ChatMessage } from '../../types/chat';
import { chatService } from '../../services/chat/ChatService';
import { api } from '../../lib/httpClient';
import { UserMenu } from './UserMenu';

interface UserInfo {
  id: string;
  username: string;
}

export class MessageBoard implements Component {
  private el: HTMLElement;
  private myUserInfo: UserInfo | null = null;
  private messages: ChatMessage[] = [];
  private currentRoomId: string | null = null;

  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'flex-1 overflow-y-auto p-6 space-y-4 bg-slate-900/50';
    this.init();
  }

  public async init() {
    try {
      this.myUserInfo = await api.get<UserInfo>('users/me');
    } catch (error) {
      console.error('Failed to get user info', error);
    }
  }

  public async loadMessages(roomId: string) {
    this.currentRoomId = roomId;
    try {
      this.messages = await chatService.getMessages(roomId);
      this.render();
      this.scrollToBottom();
    } catch (error) {
      console.error('Failed to load messages', error);
    }
  }

  private render() {
    this.el.innerHTML = '';
    if (this.messages.length === 0) {
      this.el.innerHTML = `
        <div class="h-full flex items-center justify-center text-slate-500 italic">
          No messages yet.
        </div>
      `;
      return;
    }

    this.messages.forEach((msg) => {
      const isMe = msg.senderId === this.myUserInfo?.id;
      const bubble = document.createElement('div');
      bubble.className = `flex ${isMe ? 'justify-end' : 'justify-start'} items-end space-x-2`;

      const time = new Date(msg.createdAt * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      const content = `
        ${
          !isMe
            ? `
          <button class="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold border border-white/10 hover:bg-indigo-500/30 transition-colors avatar-btn" data-user-id="${msg.senderId}" data-username="User-${msg.senderId.slice(0, 4)}">
            ${msg.senderId.slice(0, 2).toUpperCase()}
          </button>
        `
            : ''
        }
        <div class="max-w-[70%]">
          <div class="px-4 py-2 rounded-2xl text-sm ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none'} break-words">
            ${msg.content}
          </div>
          <div class="text-[10px] text-slate-500 mt-1 ${isMe ? 'text-right' : 'text-left'}">${time}</div>
        </div>
      `;

      bubble.innerHTML = content;

      const avatarBtn = bubble.querySelector(
        '.avatar-btn'
      ) as HTMLButtonElement;
      if (avatarBtn) {
        avatarBtn.onclick = (e: MouseEvent) => {
          e.stopPropagation();
          const rect = avatarBtn.getBoundingClientRect();
          UserMenu.getInstance().show(
            avatarBtn.dataset.userId!,
            avatarBtn.dataset.username!,
            rect.left,
            rect.top - 10 // Show slightly above
          );
        };
      }

      this.el.appendChild(bubble);
    });
  }

  private scrollToBottom() {
    this.el.scrollTop = this.el.scrollHeight;
  }

  public destroy(): void {
    this.el.remove();
  }

  public getElement(): HTMLElement {
    return this.el;
  }
}
