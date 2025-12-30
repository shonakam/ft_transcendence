import { api } from '../lib/httpClient';
import { Component } from '../interface/Component';
import { UserResponse } from '../services/user/dashboard';
import { design } from '../conf';
import { MfaForm } from '../components/auth/MfaForm';
import Chart from 'chart.js/auto';

export type DashboardView = 'user' | 'sessions' | 'mfa';

interface GameHistoryItem {
  date: string;
  opponent: string;
  result: 'Win' | 'Loss';
  score: string;
  duration: string;
  details: string;
  userScore: number;
  opponentScore: number;
  tournament: string;
  type: string;
}

export class DashboardPage implements Component {
  private el: HTMLElement;
  private container: HTMLDivElement;
  private mfaForm: MfaForm;
  private currentView: DashboardView = 'user';
  private page: number = 1;
  private pageSize: number = 5;
  private sortKey: string = 'date';
  private sortOrder: 'asc' | 'desc' = 'desc';
  private filterResult: 'All' | 'Win' | 'Loss' = 'All';
  private filterTournament: string = 'All';
  private modal: HTMLDivElement | null = null;

  constructor() {
    this.el = document.createElement('main');
    this.el.className = design.bg;
    this.container = document.createElement('div');
    this.container.className = design.container;
    this.mfaForm = new MfaForm();
    this.mfaForm.getElement().addEventListener('cancel', () => {
      this.init();
    });
    this.el.appendChild(this.container);
    this.init();
  }

  private async init() {
    try {
      // Mock user data
      const user: UserResponse = {
        id: '1',
        username: 'demo_user',
        email: 'demo@example.com',
        password: null,
        imagePath: null,
        is2faEnabled: 1,
        createdAt: Date.now() - 10000000,
        updatedAt: Date.now(),
        withdrawnAt: null,
      };
      // Mock stats and all game sessions
      const tournaments = ['Spring Cup', 'Summer Open', 'Autumn League'];
      const allGames: GameHistoryItem[] = Array.from({ length: 22 }, (_, i) => ({
        date: `2025-12-${(i % 30 + 1).toString().padStart(2, '0')}`,
        opponent: `Opponent${i + 1}`,
        result: i % 2 === 0 ? 'Win' : 'Loss',
        score: `${11 - (i % 5)}-${7 + (i % 5)}`,
        duration: `${4 + (i % 3)}m`,
        details: `Game ${i + 1} details: a ${i % 2 === 0 ? 'victory' : 'defeat'} with some highlights...`,
        userScore: 11 - (i % 5),
        opponentScore: 7 + (i % 5),
        tournament: tournaments[i % tournaments.length],
        type: i % 3 === 0 ? 'Tournament' : 'Friendly',
      }));
      const stats = {
        totalGames: allGames.length,
        wins: allGames.filter(g => g.result === 'Win').length,
        losses: allGames.filter(g => g.result === 'Loss').length,
        winStreak: 3,
        maxScore: Math.max(...allGames.map(g => g.userScore)),
        avgScore: (allGames.reduce((a, b) => a + b.userScore, 0) / allGames.length).toFixed(2),
        tournamentsPlayed: new Set(allGames.map(g => g.tournament)).size,
        bestTournament: 'Spring Cup',
        history: allGames.slice(0, 10),
        scoreTrend: allGames.slice(0, 10).map(g => g.userScore),
        winRateTrend: allGames.map((g, i, arr) => {
          const played = arr.slice(0, i + 1);
          return Math.round((played.filter(x => x.result === 'Win').length / played.length) * 100);
        }),
        allGames,
        tournaments,
      };
      this.render(user, stats);
    } catch (error) {
      console.error('Failed to load dashboard data', error);
    }
  }

  private switchView(view: DashboardView) {
    this.currentView = view;
    this.page = 1;
    this.init();
  }

  private render(user: UserResponse, stats: any) {
    this.container.innerHTML = '';
    // View switcher
    const nav = document.createElement('div');
    nav.className = 'flex gap-4 mb-6';
    const userTab = this.createTabButton('User Stats', this.currentView === 'user', () => this.switchView('user'));
    const sessionsTab = this.createTabButton('Game Sessions', this.currentView === 'sessions', () => this.switchView('sessions'));
    nav.append(userTab, sessionsTab);
    this.container.appendChild(nav);
    if (this.currentView === 'user') {
      this.renderUserStats(user, stats);
    } else if (this.currentView === 'sessions') {
      this.renderGameSessions(stats);
    } else if (this.currentView === 'mfa') {
      this.container.appendChild(this.mfaForm.getElement());
    }
    if (this.modal) {
      this.container.appendChild(this.modal);
    }
  }

  private renderUserStats(user: UserResponse, stats: any) {
    const title = document.createElement('h2');
    title.className = 'text-2xl font-bold text-white mb-6 text-center';
    title.textContent = 'User Dashboard';
    const info = document.createElement('div');
    info.className = 'mb-8 text-slate-300 text-sm';
    info.innerHTML = `
      <p>User: <span class="text-white font-medium">${user.username}</span></p>
      <p>Email: <span class="text-white font-medium">${user.email}</span></p>
      <p>MFA Status: <span class="${user.is2faEnabled ? 'text-green-400' : 'text-red-400'} font-bold">
        ${user.is2faEnabled ? 'Enabled' : 'Disabled'}
      </span></p>
      <p>Total Games: <span class="text-white font-medium">${stats.totalGames}</span></p>
      <p>Wins: <span class="text-green-400 font-bold">${stats.wins}</span></p>
      <p>Losses: <span class="text-red-400 font-bold">${stats.losses}</span></p>
      <p>Current Win Streak: <span class="text-blue-400 font-bold">${stats.winStreak}</span></p>
      <p>Max Score: <span class="text-yellow-400 font-bold">${stats.maxScore}</span></p>
      <p>Average Score: <span class="text-white font-bold">${stats.avgScore}</span></p>
      <p>Tournaments Played: <span class="text-white font-bold">${stats.tournamentsPlayed}</span></p>
      <p>Best Tournament: <span class="text-green-400 font-bold">${stats.bestTournament}</span></p>
    `;
    const chartPanel = document.createElement('div');
    chartPanel.className = 'mb-8 flex flex-col md:flex-row gap-8';
    // Win/Loss chart
    const chartCanvas = document.createElement('canvas');
    chartCanvas.id = 'winLossChart';
    chartCanvas.width = 200;
    chartCanvas.height = 200;
    chartPanel.appendChild(chartCanvas);
    // Score trend chart
    const trendCanvas = document.createElement('canvas');
    trendCanvas.id = 'scoreTrendChart';
    trendCanvas.width = 300;
    trendCanvas.height = 200;
    chartPanel.appendChild(trendCanvas);
    // Win rate trend chart
    const winRateCanvas = document.createElement('canvas');
    winRateCanvas.id = 'winRateTrendChart';
    winRateCanvas.width = 300;
    winRateCanvas.height = 200;
    chartPanel.appendChild(winRateCanvas);
    setTimeout(() => {
      new Chart(chartCanvas, {
        type: 'doughnut',
        data: {
          labels: ['Wins', 'Losses'],
          datasets: [{
            data: [stats.wins, stats.losses],
            backgroundColor: ['#22c55e', '#ef4444'],
          }],
        },
        options: {
          plugins: { legend: { labels: { color: '#fff' } } },
        },
      });
      new Chart(trendCanvas, {
        type: 'line',
        data: {
          labels: stats.scoreTrend.map((_: any, i: number) => `Game ${i + 1}`),
          datasets: [{
            label: 'Score',
            data: stats.scoreTrend,
            borderColor: '#38bdf8',
            backgroundColor: 'rgba(56,189,248,0.2)',
            tension: 0.3,
          }],
        },
        options: {
          plugins: { legend: { labels: { color: '#fff' } } },
          scales: { x: { ticks: { color: '#fff' } }, y: { ticks: { color: '#fff' } } },
        },
      });
      new Chart(winRateCanvas, {
        type: 'line',
        data: {
          labels: stats.winRateTrend.map((_: any, i: number) => `Game ${i + 1}`),
          datasets: [{
            label: 'Win Rate (%)',
            data: stats.winRateTrend,
            borderColor: '#22d3ee',
            backgroundColor: 'rgba(34,211,238,0.2)',
            tension: 0.3,
          }],
        },
        options: {
          plugins: { legend: { labels: { color: '#fff' } } },
          scales: { x: { ticks: { color: '#fff' } }, y: { ticks: { color: '#fff' } } },
        },
      });
    }, 0);
    // History
    const historyPanel = this.createHistoryPanel(stats.allGames.filter((g: GameHistoryItem) => true), false, true);
    // MFA button
    const mfaBtn = this.createMenuButton('🔒 Security Settings', () => this.switchView('mfa'));
    this.container.append(title, info, chartPanel, historyPanel, mfaBtn);
  }

  private renderGameSessions(stats: any) {
    const title = document.createElement('h2');
    title.className = 'text-2xl font-bold text-white mb-6 text-center';
    title.textContent = 'Game Sessions';
    // Filtering and sorting controls
    const controls = document.createElement('div');
    controls.className = 'flex flex-wrap gap-4 mb-4';
    // Filter by result
    const filterSelect = document.createElement('select');
    filterSelect.className = 'bg-slate-800 text-white rounded px-2 py-1';
    ['All', 'Win', 'Loss'].forEach(opt => {
      const o = document.createElement('option');
      o.value = opt;
      o.textContent = opt;
      filterSelect.appendChild(o);
    });
    filterSelect.value = this.filterResult;
    filterSelect.onchange = () => {
      this.filterResult = filterSelect.value as any;
      this.page = 1;
      this.init();
    };
    controls.appendChild(filterSelect);
    // Filter by tournament
    const tournamentSelect = document.createElement('select');
    tournamentSelect.className = 'bg-slate-800 text-white rounded px-2 py-1';
    ['All', ...stats.tournaments].forEach(opt => {
      const o = document.createElement('option');
      o.value = opt;
      o.textContent = opt;
      tournamentSelect.appendChild(o);
    });
    tournamentSelect.value = this.filterTournament;
    tournamentSelect.onchange = () => {
      this.filterTournament = tournamentSelect.value;
      this.page = 1;
      this.init();
    };
    controls.appendChild(tournamentSelect);
    // Sort by key
    const sortSelect = document.createElement('select');
    sortSelect.className = 'bg-slate-800 text-white rounded px-2 py-1';
    [
      { key: 'date', label: 'Date' },
      { key: 'opponent', label: 'Opponent' },
      { key: 'result', label: 'Result' },
      { key: 'tournament', label: 'Tournament' },
    ].forEach(opt => {
      const o = document.createElement('option');
      o.value = opt.key;
      o.textContent = `Sort by ${opt.label}`;
      sortSelect.appendChild(o);
    });
    sortSelect.value = this.sortKey;
    sortSelect.onchange = () => {
      this.sortKey = sortSelect.value;
      this.page = 1;
      this.init();
    };
    controls.appendChild(sortSelect);
    // Sort order
    const orderBtn = document.createElement('button');
    orderBtn.className = 'bg-slate-800 text-white rounded px-2 py-1';
    orderBtn.textContent = this.sortOrder === 'asc' ? 'Asc' : 'Desc';
    orderBtn.onclick = () => {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      this.page = 1;
      this.init();
    };
    controls.appendChild(orderBtn);
    this.container.append(title, controls);
    // Filter, sort, paginate
    let filtered = stats.allGames as GameHistoryItem[];
    if (this.filterResult !== 'All') {
      filtered = filtered.filter(g => g.result === this.filterResult);
    }
    if (this.filterTournament !== 'All') {
      filtered = filtered.filter(g => g.tournament === this.filterTournament);
    }
    filtered = filtered.sort((a, b) => {
      let cmp = 0;
      if (this.sortKey === 'date') cmp = a.date.localeCompare(b.date);
      else if (this.sortKey === 'opponent') cmp = a.opponent.localeCompare(b.opponent);
      else if (this.sortKey === 'result') cmp = a.result.localeCompare(b.result);
      else if (this.sortKey === 'tournament') cmp = a.tournament.localeCompare(b.tournament);
      return this.sortOrder === 'asc' ? cmp : -cmp;
    });
    const totalPages = Math.ceil(filtered.length / this.pageSize);
    const pageGames = filtered.slice((this.page - 1) * this.pageSize, this.page * this.pageSize);
    const historyPanel = this.createHistoryPanel(pageGames, true, false);
    this.container.appendChild(historyPanel);
    // Pagination controls
    const pagination = document.createElement('div');
    pagination.className = 'flex gap-2 justify-center items-center mb-8';
    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'Prev';
    prevBtn.disabled = this.page === 1;
    prevBtn.className = 'px-2 py-1 rounded bg-slate-700 text-white disabled:opacity-50';
    prevBtn.onclick = () => {
      if (this.page > 1) {
        this.page--;
        this.init();
      }
    };
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next';
    nextBtn.disabled = this.page === totalPages;
    nextBtn.className = 'px-2 py-1 rounded bg-slate-700 text-white disabled:opacity-50';
    nextBtn.onclick = () => {
      if (this.page < totalPages) {
        this.page++;
        this.init();
      }
    };
    pagination.append(prevBtn, document.createTextNode(` Page ${this.page} / ${totalPages} `), nextBtn);
    this.container.appendChild(pagination);
  }

  private createHistoryPanel(history: GameHistoryItem[], expandable = false, showAll = false): HTMLElement {
    const panel = document.createElement('div');
    panel.className = 'mb-8';
    panel.innerHTML = `<h3 class="text-lg font-semibold text-white mb-2">Game History</h3>`;
    const table = document.createElement('table');
    table.className = 'w-full text-sm text-slate-300';
    table.innerHTML = `
      <thead>
        <tr>
          <th class="text-left">Date</th>
          <th class="text-left">Opponent</th>
          <th class="text-left">Result</th>
          <th class="text-left">Score</th>
          <th class="text-left">Duration</th>
          <th class="text-left">Tournament</th>
          <th class="text-left">Type</th>
          ${expandable ? '<th class="text-left">Details</th>' : ''}
        </tr>
      </thead>
      <tbody>
        ${history.map((g, idx) => `
          <tr>
            <td>${g.date}</td>
            <td>${g.opponent}</td>
            <td class="${g.result === 'Win' ? 'text-green-400' : 'text-red-400'} font-bold">${g.result}</td>
            <td>${g.score}</td>
            <td>${g.duration}</td>
            <td>${g.tournament}</td>
            <td>${g.type}</td>
            ${expandable ? `<td><button class="text-blue-400 underline" data-idx="${idx}">View</button></td>` : ''}
          </tr>
        `).join('')}
      </tbody>
    `;
    panel.appendChild(table);
    if (expandable) {
      table.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'BUTTON' && target.dataset.idx) {
          const idx = Number(target.dataset.idx);
          this.showModal(history[idx]);
        }
      });
    }
    return panel;
  }

  private showModal(game: GameHistoryItem) {
    if (this.modal) {
      this.modal.remove();
    }
    this.modal = document.createElement('div');
    this.modal.className = 'fixed inset-0 bg-black/60 flex items-center justify-center z-50';
    const content = document.createElement('div');
    content.className = 'bg-slate-800 rounded-lg p-6 w-[90vw] max-w-md text-white relative';
    content.innerHTML = `
      <button class="absolute top-2 right-2 text-white text-xl" id="closeModal">×</button>
      <h4 class="text-lg font-bold mb-2">Game Details</h4>
      <p><b>Date:</b> ${game.date}</p>
      <p><b>Opponent:</b> ${game.opponent}</p>
      <p><b>Result:</b> <span class="${game.result === 'Win' ? 'text-green-400' : 'text-red-400'} font-bold">${game.result}</span></p>
      <p><b>Score:</b> ${game.score}</p>
      <p><b>Duration:</b> ${game.duration}</p>
      <p><b>Tournament:</b> ${game.tournament}</p>
      <p><b>Type:</b> ${game.type}</p>
      <p><b>Details:</b> ${game.details}</p>
    `;
    this.modal.appendChild(content);
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal || (e.target as HTMLElement).id === 'closeModal') {
        this.modal?.remove();
        this.modal = null;
        this.init();
      }
    });
    document.body.appendChild(this.modal);
  }

  private createTabButton(text: string, active: boolean, onClick: () => void): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.className = `px-4 py-2 rounded-t bg-white/10 text-white font-semibold ${active ? 'border-b-2 border-blue-400' : ''}`;
    btn.textContent = text;
    btn.onclick = onClick;
    return btn;
  }

  private createMenuButton(text: string, onClick: () => void): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.className = 'w-full py-3 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all text-left px-4 flex justify-between items-center group';
    btn.innerHTML = `
      <span>${text}</span>
      <span class="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
    `;
    btn.onclick = onClick;
    return btn;
  }

  public getElement(): HTMLElement {
    return this.el;
  }
}
