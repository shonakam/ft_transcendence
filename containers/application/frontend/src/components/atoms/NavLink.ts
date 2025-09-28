export class NavLink {
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
