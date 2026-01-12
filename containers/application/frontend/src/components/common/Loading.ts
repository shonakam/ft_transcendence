import { Component } from '../../interface/Component';

class Loading implements Component {
  private root: HTMLDivElement;

  constructor(private message: string = 'Now Loading...') {
    this.root = document.createElement('div');
    this.root.className =
      'hidden fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm';
    this.root.innerHTML = `
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
      <p class="text-white font-medium">${this.message}</p>
    `;
  }

  public show(parent: HTMLElement = document.body) {
    parent.appendChild(this.root);
    this.root.classList.remove('hidden');
  }

  public hide() {
    this.root.classList.add('hidden');
    this.root.remove();
  }

  getElement(): HTMLElement {
    return this.root;
  }
}

export const loading = new Loading();
