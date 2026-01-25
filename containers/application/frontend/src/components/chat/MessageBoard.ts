import { Component } from '../../interface/Component';
import { ChatMessage } from '../../types/chat';
import { chatService } from '../../services/chat/ChatService';
import { api } from '../../lib/httpClient';
import { UserMenu } from './UserMenu';
import { toaster } from '../common/Toaster';

import { UserResponse } from '../../types/user';

import { userProfileService } from '../../services/user/UserProfileService';

export class MessageBoard implements Component {
  private el: HTMLElement;
  private myUserInfo: UserResponse | null = null;
  private messages: ChatMessage[] = [];
  private currentRoomId: string | null = null;

  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'flex-1 overflow-y-auto p-6 space-y-4 bg-slate-900/50';
    this.init();
  }

  public async init() {
    try {
      this.myUserInfo = await api.get<UserResponse>('users/me');
    } catch (error) {
      toaster.show('Failed to get user info', 'error');
    }
  }

  public async loadMessages(roomId: string) {
    this.currentRoomId = roomId;
    try {
      this.messages = await chatService.getMessages(roomId);
      await this.fetchRequiredProfiles();
      this.render();
      this.scrollToBottom();
    } catch (error) {
      toaster.show('Failed to load messages', 'error');
    }
  }

  private async fetchRequiredProfiles() {
    const senderIds = [...new Set(this.messages.map((m) => m.senderId))];
    await Promise.all(
      senderIds.map((id) => userProfileService.getProfile(id).catch(() => null))
    );
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

      let innerContent = '';
      if (msg.messageType === 'invitation') {
        innerContent = `
          <div class="px-4 py-2 rounded-2xl text-sm ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none'} break-words">
             <div class="font-bold mb-1">🏓 Game Invitation</div>
             <div class="mb-2">Let's play Pong!</div>
             <a href="${msg.content}" class="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-xs transition-colors">
               Join Game
             </a>
          </div>
        `;
      } else {
        innerContent = `
          <div class="px-4 py-2 rounded-2xl text-sm ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none'} break-words">
            ${msg.content}
          </div>
        `;
      }

      // Use userProfileService to potentially get from cache synchronously
      // (since we fetched them in fetchRequiredProfiles)
      const sender = userProfileService.getCachedProfile(msg.senderId);
      const username = sender?.username || `User-${msg.senderId.slice(0, 4)}`;
      const imagePath = sender?.imagePath;
      const avatarSrc = imagePath
        ?  ((imagePath.startsWith('http')) ? imagePath : `/api/uploads/${imagePath}`)
        : '/assets/default-profile.png';
      const avatarContent = `<img src="${avatarSrc}" class="w-full h-full rounded-full object-cover" alt="${username}">`;

      const content = `
        ${
          !isMe
            ? `
          <button class="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold border border-white/10 hover:bg-indigo-500/30 transition-colors avatar-btn overflow-hidden" data-user-id="${msg.senderId}" data-username="${username}">
            ${avatarContent}
          </button>
        `
            : ''
        }
        <div class="max-w-[70%]">
          ${innerContent}
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
