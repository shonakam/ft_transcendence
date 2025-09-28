import { Logo } from '../atoms/Logo';
import { HeaderNav } from '../molecules/HeaderNav';

export class Header {
  private el: HTMLElement;

  constructor() {
    this.el = document.createElement('header');
    this.el.className = 'flex justify-between items-center p-4 bg-gray-100';

    const logo = new Logo('My SPA', '/').getElement();
    const nav = new HeaderNav().getElement();
    
    this.el.appendChild(logo);
    this.el.appendChild(nav);
  }

  public getElement(): HTMLElement {
    return this.el;
  }
}
