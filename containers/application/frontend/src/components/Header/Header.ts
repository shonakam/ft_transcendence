import { Component } from '../../interface/Component';
import { Logo } from './Logo';
import { HeaderNav } from './HeaderNav';

export class Header implements Component {
  private el: HTMLElement;

  constructor() {
    this.el = document.createElement('header');
    this.el.className =
      'fixed top-0 left-0 right-0 z-10 flex justify-between items-center p-4 bg-gray-100';

    const logo = new Logo('ft_transcendence', '/').getElement();
    const nav = new HeaderNav().getElement();

    this.el.appendChild(logo);
    this.el.appendChild(nav);
  }

  public getElement(): HTMLElement {
    return this.el;
  }
}
