import { Tournament } from './Tournament';
import { Component } from '../../../interface/Component';
import tournamentTemplate from './tournament.html?raw';
import './tournament.css';

export class TournamentRender implements Component {
  el: HTMLElement = document.createElement('div');
  logic: Tournament = new Tournament();

  constructor() {
    this.render();
  }

  destroy(): void {
    this.el.remove();
  }

  render(): void {
    const state = this.logic.getState();
    this.el.innerHTML = tournamentTemplate;
    const root = this.el.querySelector('#tournament')!;
    root.innerHTML = '';

    if (!state) {
      root.innerHTML =
        '<p class="text-sm text-gray-500">Add players to seed the bracket.</p>';
      return;
    }

    state.rounds.forEach((round, roundIndex) => {
      const col = document.createElement('div');
      col.className = 'flex flex-col gap-6 justify-around';

      round.forEach((match) => {
        const card = document.createElement('div');
        card.className =
          'match border rounded p-2 w-36 text-sm relative bg-white';

        if (roundIndex > 0) {
          card.classList.add('has-connector', 'match-round-' + roundIndex);
        }

        card.innerHTML = `
        <div class="flex justify-between">
          <span>${match.p1?.alias ?? '—'}</span>
          <span>${match.p1?.score ?? ''}</span>
        </div>
        <div class="flex justify-between">
          <span>${match.p2?.alias ?? '—'}</span>
          <span>${match.p2?.score ?? ''}</span>
        </div>
      `;
        col.appendChild(card);
      });

      root.appendChild(col);
    });
  }

  public getElement(): HTMLElement {
    return this.el;
  }
}
