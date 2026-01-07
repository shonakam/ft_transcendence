import { Component } from '../../interface/Component';

export class Logo implements Component {
  private el: HTMLAnchorElement;

  constructor(text: string, href: string) {
    this.el = document.createElement('a');
    this.el.href = href;
    this.el.textContent = text;
    this.el.className = 'text-2xl font-bold';
  }

  public getElement(): HTMLAnchorElement {
    return this.el;
  }
}
