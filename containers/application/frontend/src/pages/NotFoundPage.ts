import { Component } from '../interface/Component';

export class NotFoundPage implements Component {
  private el: HTMLElement;

  constructor() {
    this.el = document.createElement('main');
    this.el.className = '';

    this.el.innerHTML = `
			<div class="text-center">
        <div class="mb-6"> </div>
        <h1 class="text-4xl font-bold mb-4">Not Found Page</h1>
				<p class="text-4xl font-bold mb-4">404</p>
				<p class="text-lg text-gray-700">The page you are looking for does not exist.</p>
			</div>
		`;
  }

  public getElement(): HTMLElement {
    return this.el;
  }
}
