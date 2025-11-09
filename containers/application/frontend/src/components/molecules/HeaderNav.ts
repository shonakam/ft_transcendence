import { NavLink } from '../atoms/NavLink';
import { Component } from '../../interface/Component';

export class HeaderNav implements Component {
  private el: HTMLElement;

  constructor() {
    this.el = document.createElement('nav');
    this.el.className = 'space-x-4';

    const homeLink = new NavLink('Home', '/home').getElement();
    const aboutLink = new NavLink('About', '/about').getElement();

    this.el.appendChild(homeLink);
    this.el.appendChild(aboutLink);
  }

  public getElement(): HTMLElement {
    return this.el;
  }
}
