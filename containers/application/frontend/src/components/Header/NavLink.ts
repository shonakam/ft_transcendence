import { Component } from "../../interface/Component";

export class NavLink implements Component {
  private el: HTMLAnchorElement;

  constructor(text: string, href: string) {
    this.el = document.createElement('a');
    this.el.href = href;
    this.el.textContent = text;
    this.el.className = 'hover:text-blue-500';
  }

  public getElement(): HTMLAnchorElement {
    return this.el;
  }
}
