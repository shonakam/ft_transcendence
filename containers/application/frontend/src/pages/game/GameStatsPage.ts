import { Component } from '../../interface/Component';
import { GameRecord, getGameStats } from '../../services/game/stats';
import { design } from '../../conf';
import { authStore } from '../../store/authStore';

export class GameStatsPage implements Component {
  private el: HTMLElement;
  private container: HTMLDivElement;
  private records: GameRecord[] = [];
  private isLoading = false;

  constructor() {
    this.el = document.createElement('main');
    this.el.className = design.bg;

    this.container = document.createElement('div');
    this.container.className = design.container;

    this.el.appendChild(this.container);
    this.init();
  }

  public destroy(): void {
    this.el.remove();
  }

  private async init() {
    this.isLoading = true;
    this.renderLoading();

    try {
      this.records = await getGameStats({ limit: 50 });
      this.render();
    } catch (error) {
      console.error('Failed to load game stats:', error);
      this.renderError();
    } finally {
      this.isLoading = false;
    }
  }

  private renderLoading() {
    this.container.innerHTML = `
      <div class="text-center text-slate-300">
        <p>Loading game history...</p>
      </div>
    `;
  }

  private renderError() {
    this.container.innerHTML = `
      <div class="text-center">
        <h2 class="text-2xl font-bold text-white mb-4">Game Stats</h2>
        <p class="text-red-400">Failed to load game history. Please try again later.</p>
      </div>
    `;
  }

  private render() {
    this.container.innerHTML = '';

    const title = document.createElement('h2');
    title.className = 'text-3xl font-bold text-white mb-8 text-center';
    title.textContent = '🎮 Game History';

    this.container.appendChild(title);

    if (this.records.length === 0) {
      const emptyMsg = document.createElement('p');
      emptyMsg.className = 'text-center text-slate-400 text-lg';
      emptyMsg.textContent = 'No games played yet. Start your first match!';
      this.container.appendChild(emptyMsg);
      return;
    }

    const table = this.createTable();
    this.container.appendChild(table);
  }

  private createTable(): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = 'overflow-x-auto rounded-lg border border-white/10';

    const table = document.createElement('table');
    table.className = 'w-full text-left text-sm';

    // Table header
    const thead = document.createElement('thead');
    thead.className = 'bg-white/5 text-slate-300 border-b border-white/10';
    thead.innerHTML = `
      <tr>
        <th class="px-6 py-3">Date</th>
        <th class="px-6 py-3">Opponent</th>
        <th class="px-6 py-3">Side</th>
        <th class="px-6 py-3">Score (Me - Op)</th>
        <th class="px-6 py-3">Result</th>
      </tr>
    `;
    table.appendChild(thead);

    // Table body
    const tbody = document.createElement('tbody');
    tbody.className = 'divide-y divide-white/5';

    this.records.forEach((record) => {
      const row = document.createElement('tr');
      row.className = 'hover:bg-white/5 transition-colors';

      const date = new Date(record.endedAt).toLocaleString();

      const loggedInUserId = authStore.getUserId();
      const isLeft = record.leftUserId === loggedInUserId;
      const myScore = isLeft ? record.leftPoint : record.rightPoint;
      const opponentScore = isLeft ? record.rightPoint : record.leftPoint;
      const opponentAlias = isLeft ? record.rightAlias : record.leftAlias;
      const isWinner = record.winnerId === loggedInUserId;
      const side = isLeft ? 'Left' : 'Right';

      const resultText = isWinner ? 'Win' : 'Loss';
      const resultClass = isWinner
        ? 'text-green-400 font-bold'
        : 'text-red-400';

      row.innerHTML = `
        <td class="px-6 py-4 text-slate-300">${date}</td>
        <td class="px-6 py-4 text-white">${opponentAlias || 'Anonymous'}</td>
        <td class="px-6 py-4 text-slate-300 uppercase">${side}</td>
        <td class="px-6 py-4 text-white font-mono">${myScore} - ${opponentScore}</td>
        <td class="px-6 py-4 ${resultClass}">${resultText}</td>
      `;

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    wrapper.appendChild(table);

    return wrapper;
  }

  public getElement(): HTMLElement {
    return this.el;
  }
}
