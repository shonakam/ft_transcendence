import { Component } from "../interface/Component";

export class AboutPage implements Component {
  private el: HTMLElement
  
  constructor() {
    this.el = document.createElement('main')
    this.el.className = ""

    this.el.innerHTML = `
      <div class="text-center">
        <h1 class="text-4xl font-bold mb-4">About Pages</h1>
      </div>
    `;
  }

  public getElement(): HTMLElement {
    return this.el
  }
}
