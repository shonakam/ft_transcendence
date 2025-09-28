// src/components/molecules/headerNav.ts

import { NavLink } from '../atoms/NavLink';

export class HeaderNav {
  private el: HTMLElement;

  constructor() {
    this.el = document.createElement('nav');
    this.el.className = 'space-x-4';

    const homeLink = new NavLink('Home', '/').getElement();
    const aboutLink = new NavLink('About', '/about').getElement();

    this.el.appendChild(homeLink);
    this.el.appendChild(aboutLink);
  }

  public getElement(): HTMLElement {
    return this.el;
  }
}
