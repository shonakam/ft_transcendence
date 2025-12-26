import { NavLink } from '../atoms/NavLink'
import { Component } from '../../interface/Component'

export class HeaderNav implements Component {
  private el: HTMLElement

  constructor() {
    this.el = document.createElement('nav')
    this.el.className = 'space-x-4'

    this.el.appendChild(new NavLink('Home', '/home').getElement())
    this.el.appendChild(new NavLink('About', '/about').getElement())
    this.el.appendChild(new NavLink('Dashboard', '/dashboard').getElement())
    this.el.appendChild(new NavLink('Auth', '/auth').getElement())
  }

  public getElement(): HTMLElement {
    return this.el
  }
}
