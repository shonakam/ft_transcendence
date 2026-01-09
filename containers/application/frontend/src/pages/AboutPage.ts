import { Component } from '../interface/Component';

export class AboutPage implements Component {
  private rootElement: HTMLElement;
  private el: HTMLElement;

  constructor() {
    this.rootElement = document.getElementById('app-root') as HTMLElement;
    this.el = document.createElement('main');
    this.el.className = 'fixed inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-black overflow-hidden';

    this.el.innerHTML = `
      <div class="relative z-10 text-center px-6">
        <h1 class="text-5xl font-extrabold mb-6 text-white">
          About
        </h1>
        <p class="text-lg max-w-xl mx-auto text-gray-400">
          これはAbout Pageです。
        </p>
      </div>
    `;
  }

  public destroy(): void {
    this.el.remove();
  }

  public getElement(): HTMLElement {
    return this.el;
  }
}
