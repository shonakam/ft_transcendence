import { Component } from '../../interface/Component';
import { ChatRoom } from '../../types/chat';
import { chatService } from '../../services/chat/ChatService';

export class RoomList implements Component {
  private el: HTMLElement;
  private onRoomSelect: (room: ChatRoom) => void;
  private activeRoomId: string | null = null;
  private rooms: ChatRoom[] = [];

  constructor(onRoomSelect: (room: ChatRoom) => void) {
    this.el = document.createElement('div');
    this.el.className = 'flex flex-col h-full';
    this.onRoomSelect = onRoomSelect;
    this.render();
  }

  public async refresh() {
    try {
      this.rooms = await chatService.getRooms();
      this.render();
    } catch (error) {
      console.error('Failed to fetch rooms', error);
    }
  }

  public setActiveRoom(roomId: string) {
    this.activeRoomId = roomId;
    this.render();
  }

  private render() {
    this.el.innerHTML = `
      <div class="p-4 border-b border-white/10 font-bold text-lg">Chat Rooms</div>
      <div class="flex-1 overflow-y-auto" id="room-items"></div>
    `;

    const container = this.el.querySelector('#room-items')!;

    // Sort: Global first, then others
    const sortedRooms = [...this.rooms].sort((a, b) => {
      if (a.type === 'global') return -1;
      if (b.type === 'global') return 1;
      return 0;
    });

    sortedRooms.forEach((room) => {
      const item = document.createElement('button');
      const isActive = room.id === this.activeRoomId;
      item.className = `w-full text-left p-4 hover:bg-white/5 transition-colors border-b border-white/5 flex items-center space-x-3 ${isActive ? 'bg-indigo-600/20 border-r-2 border-r-indigo-500' : ''}`;

      const icon = room.type === 'global' ? '🌐' : '👤';
      item.innerHTML = `
        <span class="text-xl">${icon}</span>
        <span class="truncate pr-2">${room.name || 'Unknown Room'}</span>
      `;

      item.onclick = () => this.onRoomSelect(room);
      container.appendChild(item);
    });
  }

  public getElement(): HTMLElement {
    return this.el;
  }
}
