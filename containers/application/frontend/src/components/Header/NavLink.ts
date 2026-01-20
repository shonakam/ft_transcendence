import { Component } from '../../interface/Component';

export class NavLink implements Component {
  private el: HTMLAnchorElement;

  constructor(text: string, href: string) {
    this.el = document.createElement('a');
    this.el.href = href;
    this.el.textContent = text;
    this.el.className = 'text-slate-300 hover:text-white transition-colors font-medium text-sm';
  }

  public destroy(): void {
    this.el.remove();
  }

  public getElement(): HTMLAnchorElement {
    return this.el;
  }
}
