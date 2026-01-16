import { Tournament } from "./Tournament";
import { Component } from '../../../interface/Component';
import tournamentTemplete from './Tournament.html?raw';

export class TournamentRender implements Component{
  rootElement: HTMLElement = document.createElement('div');
  el: HTMLElement = document.createElement('div');
  baseTemplate = tournamentTemplete;
  logic: Tournament = new Tournament();

  constructor() {
    this.rootElement.className = 'tournament-div';
    this.el.className = 'tournament';
    this.el.innerHTML = this.baseTemplate;
  }

  destroy(): void {
    this.el.remove();
  }

  render(): string {
    return this.baseTemplate;
  }

  refresh(): void {
    this.el.innerHTML = '';
    this.el.innerHTML = this.render();
    this.rootElement.appendChild(this.el);
  }

  public getElement(): HTMLElement {
    return this.el;
  }
}
