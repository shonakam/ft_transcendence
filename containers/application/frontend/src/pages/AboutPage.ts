import { Component } from '../interface/Component';

export class AboutPage implements Component {
  private el: HTMLElement;

  constructor() {
    this.el = document.createElement('main');
    this.el.className = '';

    this.el.innerHTML = `
      <div class="text-center">
        <div class="mb-6"> </div>
        <h1 class="text-4xl font-bold mb-4">About Page</h1>
      </div>
    `;
  }

  public getElement(): HTMLElement {
    return this.el;
  }
}
