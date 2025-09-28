export class Logo {
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
