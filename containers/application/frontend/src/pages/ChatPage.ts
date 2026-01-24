import { Component } from '../interface/Component';
// import { design } from '../conf';
import { ChatRoom } from '../types/chat';
import { RoomList } from '../components/chat/RoomList';
import { MessageBoard } from '../components/chat/MessageBoard';
import { MessageInput } from '../components/chat/MessageInput';
import { chatService } from '../services/chat/ChatService';
import { chatWebsocketService } from '../services/chat/ChatWebsocketService';
import { toaster } from '../components/common/Toaster';

export class ChatPage implements Component {
  private el: HTMLElement;
  private roomList: RoomList;
  private messageBoard: MessageBoard;
  private messageInput: MessageInput;
  private activeRoom: ChatRoom | null = null;
  private unsubscribeWs: (() => void) | null = null;

  constructor() {
    this.el = document.createElement('main');
    this.el.className =
      'h-screen w-full bg-slate-900 flex text-white pt-20 overflow-hidden';

    const sidebar = document.createElement('aside');
    sidebar.className =
      'w-64 border-r border-white/10 flex flex-col bg-slate-800/50 h-full';

    const mainArea = document.createElement('section');
    mainArea.className = 'flex-1 flex flex-col relative h-full';

    this.roomList = new RoomList((room) => this.switchRoom(room));
    this.messageBoard = new MessageBoard();
    this.messageInput = new MessageInput((content: string) =>
      this.handleSendMessage(content)
    );

    sidebar.appendChild(this.roomList.getElement());

    mainArea.appendChild(this.messageBoard.getElement());
    mainArea.appendChild(this.messageInput.getElement());

    this.el.appendChild(sidebar);
    this.el.appendChild(mainArea);

    window.addEventListener('switch-room', ((e: CustomEvent) => {
      this.switchRoom(e.detail);
    }) as EventListener);

    window.addEventListener('user-blocked', () => {
      if (this.activeRoom) {
        this.messageBoard.loadMessages(this.activeRoom.id);
      }
    });

    this.init();
  }

  public destroy(): void {
    if (this.unsubscribeWs) this.unsubscribeWs();
    chatWebsocketService.disconnect();
    this.el.remove();
  }

  private async init() {
    chatWebsocketService.connect();
    this.unsubscribeWs = chatWebsocketService.subscribe((msg) => {
      if (msg.type === 'NEW_MESSAGE') {
        const newMsg = msg.data;
        // Always refresh room list to show new DMs or update last message (if we had it)
        this.roomList.refresh();

        if (this.activeRoom && newMsg.roomId === this.activeRoom.id) {
          this.messageBoard.loadMessages(this.activeRoom.id);
        }
      }
    });

    await this.messageBoard.init();
    await this.roomList.refresh();
    // Default to Global Chat if available
    const rooms = await chatService.getRooms();
    const globalRoom = rooms.find((r) => r.type === 'global');
    if (globalRoom) {
      this.switchRoom(globalRoom);
    }
  }

  private async switchRoom(room: ChatRoom) {
    this.activeRoom = room;
    await this.roomList.refresh(); // Ensure the room exists in the sidebar
    this.roomList.setActiveRoom(room.id);
    await this.messageBoard.loadMessages(room.id);
  }

  private async handleSendMessage(content: string) {
    if (!this.activeRoom) return;
    try {
      await chatService.sendMessage(this.activeRoom.id, content);
      await this.messageBoard.loadMessages(this.activeRoom.id);
    } catch (error) {
      toaster.show('Failed to send message', 'error');
    }
  }

  public getElement(): HTMLElement {
    return this.el;
  }
}
