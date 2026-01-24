import { Component } from '../../interface/Component.ts';

export class MessageInput implements Component {
  private el: HTMLElement;
  private onSendMessage: (content: string) => void;

  constructor(onSendMessage: (content: string) => void) {
    this.el = document.createElement('div');
    this.el.className = 'p-4 bg-slate-800/80 border-t border-white/10';
    this.onSendMessage = onSendMessage;
    this.render();
  }

  private render() {
    this.el.innerHTML = `
      <form class="flex space-x-2" id="msg-form">
        <input
          type="text"
          id="msg-input"
          placeholder="Type a message..."
          class="flex-1 bg-slate-900 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 transition-colors text-white"
          autocomplete="off"
        />
        <button
          type="submit"
          class="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-semibold transition-all shadow-lg active:scale-95"
        >
          Send
        </button>
      </form>
    `;

    const form = this.el.querySelector('#msg-form') as HTMLFormElement;
    const input = this.el.querySelector('#msg-input') as HTMLInputElement;

    form.onsubmit = (e: SubmitEvent) => {
      e.preventDefault();
      const content = input.value.trim();
      if (content) {
        this.onSendMessage(content);
        input.value = '';
      }
    };
  }

  public destroy(): void {
    this.el.remove();
  }

  public getElement(): HTMLElement {
    return this.el;
  }
}
