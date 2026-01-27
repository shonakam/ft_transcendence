import { Component } from '../../interface/Component';
import { userRelationshipService } from '../../services/user/UserRelationshipService';
import { chatService } from '../../services/chat/ChatService';
import { userProfileService } from '../../services/user/UserProfileService';
import { toaster } from '../common/Toaster';

export class FriendList implements Component {
  private el: HTMLElement;
  private container: HTMLDivElement;
  private onlineStatuses: Record<string, boolean> = {};

  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'w-full max-w-md mx-auto space-y-4';

    this.container = document.createElement('div');
    this.container.className =
      'bg-slate-800/50 rounded-xl p-4 border border-white/10 space-y-4';
    this.el.appendChild(this.container);

    this.init();
  }

  private async init() {
    this.renderLoading();
    try {
      const [friends, pendingRequests, blockedUsers] = await Promise.all([
        userRelationshipService.getFriends(),
        userRelationshipService.getPendingRequests(),
        chatService.getBlockedUsers(),
      ]);

      // Fetch online statuses for friends
      if (friends.length > 0) {
        this.onlineStatuses =
          await userRelationshipService.getOnlineStatuses(friends);
      }

      this.render(friends, pendingRequests, blockedUsers);
    } catch (error) {
      toaster.show('Failed to load friend list', 'error');
    }
  }

  private renderLoading() {
    this.container.innerHTML =
      '<div class="text-center text-slate-400">Loading...</div>';
  }

  private async render(
    friends: string[],
    pendingRequests: string[],
    blockedUsers: string[]
  ) {
    this.container.innerHTML = '';

    // Header with back button
    const header = document.createElement('div');
    header.className = 'flex items-center gap-2 mb-4';
    const backBtn = document.createElement('button');
    backBtn.textContent = '← Back';
    backBtn.className =
      'text-sm text-slate-400 hover:text-white transition-colors';
    backBtn.onclick = () => this.el.dispatchEvent(new CustomEvent('back'));
    header.appendChild(backBtn);
    this.container.appendChild(header);

    // Pending Requests
    if (pendingRequests.length > 0) {
      const pendingSection = document.createElement('div');
      pendingSection.innerHTML =
        '<h3 class="text-sm font-bold text-slate-400 mb-2">Pending Requests</h3>';
      const pendingList = document.createElement('div');
      pendingList.className = 'space-y-2';

      for (const userId of pendingRequests) {
        const item = await this.createPendingItem(userId);
        pendingList.appendChild(item);
      }
      pendingSection.appendChild(pendingList);
      this.container.appendChild(pendingSection);
    }

    // Friends
    const friendSection = document.createElement('div');
    friendSection.innerHTML =
      '<h3 class="text-sm font-bold text-slate-400 mb-2 mt-4">Friends</h3>';
    if (friends.length === 0) {
      friendSection.innerHTML +=
        '<div class="text-slate-500 text-sm">No friends yet</div>';
    } else {
      const friendList = document.createElement('div');
      friendList.className = 'space-y-2';
      for (const userId of friends) {
        const item = await this.createFriendItem(userId);
        friendList.appendChild(item);
      }
      friendSection.appendChild(friendList);
    }
    this.container.appendChild(friendSection);

    // Blocked Users
    const blockedSection = document.createElement('div');
    blockedSection.innerHTML =
      '<h3 class="text-sm font-bold text-slate-400 mb-2 mt-4">Blocked Users</h3>';
    if (blockedUsers.length === 0) {
      blockedSection.innerHTML +=
        '<div class="text-slate-500 text-sm">No blocked users</div>';
    } else {
      const blockedList = document.createElement('div');
      blockedList.className = 'space-y-2';
      for (const userId of blockedUsers) {
        const item = await this.createBlockedItem(userId);
        blockedList.appendChild(item);
      }
      blockedSection.appendChild(blockedList);
    }
    this.container.appendChild(blockedSection);
  }

  private async createPendingItem(userId: string): Promise<HTMLElement> {
    const el = document.createElement('div');
    el.className =
      'flex items-center justify-between bg-white/5 p-2 rounded-lg';

    const profile = await userProfileService.getProfile(userId);
    const username = profile?.username || 'Unknown User';

    el.innerHTML = `
      <div class="flex items-center gap-2">
        <div class="font-medium text-white text-sm">${username}</div>
      </div>
    `;

    const acceptBtn = document.createElement('button');
    acceptBtn.textContent = 'Accept';
    acceptBtn.className =
      'px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors';
    acceptBtn.onclick = async () => {
      try {
        await userRelationshipService.acceptFriend(userId);
        toaster.show('Friend request accepted', 'success');
        this.init();
      } catch (e) {
        toaster.show('Failed to accept request', 'error');
      }
    };

    el.appendChild(acceptBtn);
    return el;
  }

  private async createFriendItem(userId: string): Promise<HTMLElement> {
    const el = document.createElement('div');
    el.className =
      'flex items-center justify-between bg-white/5 p-2 rounded-lg';

    const profile = await userProfileService.getProfile(userId);
    const username = profile?.username || 'Unknown User';
    let imagePath = '/assets/default-profile.png';
    if (profile?.imagePath) {
      if (profile.imagePath.startsWith('http')) {
        imagePath = profile.imagePath;
      } else if (profile.imagePath.startsWith('/assets/')) {
        imagePath = profile.imagePath;
      } else if (profile.imagePath.startsWith('/uploads/')) {
        imagePath = `/api${profile.imagePath}`;
      } else {
        imagePath = `/api/uploads/${profile.imagePath}`;
      }
    }

    const isOnline = this.onlineStatuses[userId] ?? false;
    const statusIndicator = isOnline
      ? '<span class="w-2.5 h-2.5 bg-green-500 rounded-full"></span>'
      : '<span class="w-2.5 h-2.5 bg-slate-500 rounded-full"></span>';
    const statusText = isOnline
      ? '<span class="text-xs text-green-400">Online</span>'
      : '<span class="text-xs text-slate-500">Offline</span>';

    el.innerHTML = `
        <div class="flex items-center gap-2">
          <div class="relative">
            <img src="${imagePath}" class="w-8 h-8 rounded-full object-cover" />
            <div class="absolute -bottom-0.5 -right-0.5 ${isOnline ? 'bg-green-500' : 'bg-slate-500'} w-3 h-3 rounded-full border-2 border-slate-800"></div>
          </div>
          <div>
            <div class="font-medium text-white text-sm">${username}</div>
            ${statusText}
          </div>
        </div>
      `;

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.className =
      'px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs rounded transition-colors';
    removeBtn.onclick = async () => {
      if (!confirm(`Remove ${username} from friends?`)) return;
      try {
        await userRelationshipService.removeFriend(userId);
        toaster.show('Friend removed', 'success');
        this.init();
      } catch (e) {
        toaster.show('Failed to remove friend', 'error');
      }
    };

    el.appendChild(removeBtn);
    return el;
  }

  private async createBlockedItem(userId: string): Promise<HTMLElement> {
    const el = document.createElement('div');
    el.className =
      'flex items-center justify-between bg-white/5 p-2 rounded-lg';

    const profile = await userProfileService.getProfile(userId);
    const username = profile?.username || 'Unknown User';

    el.innerHTML = `
        <div class="flex items-center gap-2">
          <div class="font-medium text-slate-400 text-sm">${username}</div>
        </div>
      `;

    const unblockBtn = document.createElement('button');
    unblockBtn.textContent = 'Unblock';
    unblockBtn.className =
      'px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded transition-colors';
    unblockBtn.onclick = async () => {
      try {
        await chatService.unblockUser(userId);
        toaster.show('User unblocked', 'success');
        this.init();
      } catch (e) {
        toaster.show('Failed to unblock user', 'error');
      }
    };

    el.appendChild(unblockBtn);
    return el;
  }

  public getElement(): HTMLElement {
    return this.el;
  }
}
