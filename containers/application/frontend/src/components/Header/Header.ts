import { Component } from '../../interface/Component';
import { Logo } from './Logo';
import { HeaderNav } from './HeaderNav';

export class Header implements Component {
  private el: HTMLElement;

  constructor() {
    this.el = document.createElement('header');
    this.el.className =
      'fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-4 bg-slate-900/80 backdrop-blur-md border-b border-white/10';

    const logo = new Logo('ft_transcendence', '/').getElement();
    const nav = new HeaderNav().getElement();

    this.el.appendChild(logo);
    this.el.appendChild(nav);
  }

  destroy(): void {
    this.el.remove();
  }

  public getElement(): HTMLElement {
    return this.el;
  }
}
