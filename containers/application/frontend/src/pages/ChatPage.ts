import { Component } from "../interface/Component";
import { ChatApi } from "../shared/api/ChatApi";
import { ChatSocket } from "../shared/lib/ChatSocket";
import { ChatRoom, ChatMessage } from "../entities/chat/model/types";

export class ChatPage implements Component {
  private rootElement: HTMLElement;
  private sidebarEl: HTMLElement;
  private chatMainEl: HTMLElement;
  private messageListEl: HTMLElement;
  private messageInputEl: HTMLInputElement;
  private sendButtonEl: HTMLButtonElement;

  private socket: ChatSocket;
  private rooms: ChatRoom[] = [];
  private currentRoomId: string | null = null;
  private currentUserId: string | null = null;
  private blockedUserIds: Set<string> = new Set();

  constructor() {
    this.rootElement = document.createElement('section');
    this.rootElement.className = 'flex h-screen bg-gray-100 overflow-hidden';

    this.sidebarEl = document.createElement('div');
    this.sidebarEl.className = 'w-64 bg-white border-r flex flex-col';

    this.chatMainEl = document.createElement('div');
    this.chatMainEl.className = 'flex-1 flex flex-col';

    this.messageListEl = document.createElement('div');
    this.messageListEl.className = 'flex-1 overflow-y-auto p-4 space-y-4';

    const inputArea = document.createElement('div');
    inputArea.className = 'p-4 bg-white border-t flex space-x-2';
    this.messageInputEl = document.createElement('input');
    this.messageInputEl.className = 'flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500';
    this.messageInputEl.placeholder = 'メッセージを入力...';
    this.sendButtonEl = document.createElement('button');
    this.sendButtonEl.className = 'bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition';
    this.sendButtonEl.textContent = '送信';
    inputArea.appendChild(this.messageInputEl);
    inputArea.appendChild(this.sendButtonEl);

    this.chatMainEl.appendChild(this.messageListEl);
    this.chatMainEl.appendChild(inputArea);

    this.rootElement.appendChild(this.sidebarEl);
    this.rootElement.appendChild(this.chatMainEl);

    this.socket = new ChatSocket('/chat/ws');
    this.init();
  }

  private async init() {
    try {
      this.currentUserId = localStorage.getItem('userId'); // Assuming userId is stored
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No access token');

      this.socket.connect(token);
      this.socket.onMessage((data) => this.handleSocketMessage(data));

      const [rooms, blocked] = await Promise.all([
        ChatApi.getRooms(),
        ChatApi.getBlockedUsers()
      ]);

      this.rooms = rooms;
      this.blockedUserIds = new Set(blocked);
      this.renderSidebar();

      if (this.rooms.length > 0) {
        this.selectRoom(this.rooms[0].id);
      }

      this.initEventListeners();
    } catch (err) {
      console.error('Chat init error:', err);
    }
  }

  private initEventListeners() {
    this.sendButtonEl.addEventListener('click', () => this.handleSendMessage());
    this.messageInputEl.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleSendMessage();
    });
  }

  private async selectRoom(roomId: string) {
    this.currentRoomId = roomId;
    this.renderSidebar(); // Update active state
    this.messageListEl.innerHTML = '<div class="text-center text-gray-500">履歴を読み込み中...</div>';

    try {
      const messages = await ChatApi.getMessages(roomId);
      this.renderMessages(messages);
    } catch (err) {
      this.messageListEl.innerHTML = '<div class="text-center text-red-500">履歴の取得に失敗しました</div>';
    }
  }

  private handleSendMessage() {
    const content = this.messageInputEl.value.trim();
    if (!content || !this.currentRoomId) return;

    this.socket.sendMessage(this.currentRoomId, content);
    this.messageInputEl.value = '';
  }

  private handleSocketMessage(data: any) {
    if (data.type === 'message') {
      const msg = data as ChatMessage;
      // Filter blocked users
      if (this.blockedUserIds.has(msg.senderId)) return;

      if (msg.roomId === this.currentRoomId) {
        this.appendMessage(msg);
      }
    }
  }

  private renderSidebar() {
    this.sidebarEl.innerHTML = `
      <div class="p-4 border-b">
        <h2 class="text-xl font-bold">チャット</h2>
      </div>
      <div class="flex-1 overflow-y-auto">
        <ul id="room-list"></ul>
      </div>
    `;
    const list = this.sidebarEl.querySelector('#room-list')!;
    this.rooms.forEach(room => {
      const li = document.createElement('li');
      const isActive = room.id === this.currentRoomId;
      li.className = `p-4 cursor-pointer hover:bg-gray-100 border-b transition ${isActive ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`;
      li.textContent = room.name || (room.type === 'dm' ? 'Direct Message' : 'Unnamed Room');
      li.onclick = () => this.selectRoom(room.id);
      list.appendChild(li);
    });
  }

  private renderMessages(messages: ChatMessage[]) {
    this.messageListEl.innerHTML = '';
    messages.forEach(msg => this.appendMessage(msg));
  }

  private appendMessage(msg: ChatMessage) {
    const isMine = msg.senderId === this.currentUserId;
    const msgEl = document.createElement('div');
    msgEl.className = `flex ${isMine ? 'justify-end' : 'justify-start'}`;

    const bubble = document.createElement('div');
    bubble.className = `max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${
      isMine
        ? 'bg-blue-600 text-white rounded-br-none'
        : 'bg-white text-gray-800 border rounded-bl-none'
    }`;

    const content = document.createElement('div');
    content.textContent = msg.content;

    const meta = document.createElement('div');
    meta.className = `text-[10px] mt-1 ${isMine ? 'text-blue-100 text-right' : 'text-gray-400'}`;
    meta.textContent = new Date(msg.createdAt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    bubble.appendChild(content);
    bubble.appendChild(meta);
    msgEl.appendChild(bubble);
    this.messageListEl.appendChild(msgEl);
    this.messageListEl.scrollTop = this.messageListEl.scrollHeight;
  }

  public getElement(): HTMLElement {
    return this.rootElement;
  }
}
