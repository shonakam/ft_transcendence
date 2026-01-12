import { api } from '../lib/httpClient';
import { Component } from '../interface/Component';
import { UserResponse } from '../services/user/dashboard';
import { design } from '../conf';
import { MfaForm } from '../components/auth/MfaForm';
import { router } from '../router/router'; // Ensure this path is correct
import Chart from 'chart.js/auto';

// Added 'game' and 'chat' back to the types
export type DashboardView = 'user' | 'sessions' | 'mfa' | 'game' | 'chat';

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
    // 1. Authentication Check
    const token = localStorage.getItem('accessToken');
    if (!token) {
      // Redirect to login if no token found
      window.location.href = '/login';
      return;
    }

    this.el = document.createElement('main');
    this.el.className = design.bg;
    this.container = document.createElement('div');
    this.container.className = design.container;
    this.mfaForm = new MfaForm();
    this.mfaForm.getElement().addEventListener('cancel', () => {
      this.switchView('user');
    });
    this.el.appendChild(this.container);
    this.init();
  }

  public destroy(): void {
    this.el.remove();
  }

  private async init() {
    try {
      // Mock user data (In production, replace with real API call)
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

      const tournaments = ['Spring Cup', 'Summer Open', 'Autumn League'];
      const allGames: GameHistoryItem[] = Array.from({ length: 22 }, (_, i) => ({
        date: `2025-12-${(i % 30 + 1).toString().padStart(2, '0')}`,
        opponent: `Opponent${i + 1}`,
        result: i % 2 === 0 ? 'Win' : 'Loss',
        score: `${11 - (i % 5)}-${7 + (i % 5)}`,
        duration: `${4 + (i % 3)}m`,
        details: `Game ${i + 1} details...`,
        userScore: 11 - (i % 5),
        opponentScore: 7 + (i % 5),
        tournament: tournaments[i % tournaments.length],
        type: i % 3 === 0 ? 'Tournament' : 'Friendly',
      }));

      const stats = {
        totalGames: allGames.length,
        wins: allGames.filter(g => g.result === 'Win').length,
        losses: allGames.filter(g => g.result === 'Loss').length,
        allGames,
      };
      this.render(user, stats);
    } catch (error) {
      console.error('Failed to load dashboard data', error);
    }
  }

  private switchView(view: DashboardView) {
    this.currentView = view;
    this.page = 1;
    if (view === 'mfa') {
      this.mfaForm.activate('setup');
    } else if (view === 'game') {
        window.location.href = '/game'; // Or router.navigate('/game')
        return;
    } else if (view === 'chat') {
        window.location.href = '/chat'; // Or router.navigate('/chat')
        return;
    }
    this.init();
  }

  private render(user: UserResponse, stats: any) {
    this.container.innerHTML = '';

    // Navigation bar with all buttons restored
    const nav = document.createElement('div');
    nav.className = 'flex flex-wrap gap-2 mb-6';

    const userTab = this.createTabButton('User Stats', this.currentView === 'user', () => this.switchView('user'));
    const sessionsTab = this.createTabButton('Game Sessions', this.currentView === 'sessions', () => this.switchView('sessions'));
    const gameTab = this.createTabButton('Play Game', this.currentView === 'game', () => this.switchView('game'));
    const chatTab = this.createTabButton('Chat Room', this.currentView === 'chat', () => this.switchView('chat'));

    nav.append(userTab, sessionsTab, gameTab, chatTab);
    this.container.appendChild(nav);

    if (this.currentView === 'user') {
      this.renderUserStats(user, stats);
    } else if (this.currentView === 'sessions') {
      this.renderGameSessions(stats);
    } else if (this.currentView === 'mfa') {
      this.container.appendChild(this.mfaForm.getElement());
    }
  }

  private renderUserStats(user: UserResponse, stats: any) {
    const title = document.createElement('h2');
    title.className = 'text-2xl font-bold text-white mb-6 text-center';
    title.textContent = 'User Dashboard';

    const info = document.createElement('div');
    info.className = 'mb-8 text-slate-300 text-sm grid grid-cols-2 gap-2';
    info.innerHTML = `
      <p>User: <span class="text-white">${user.username}</span></p>
      <p>MFA: <span class="${user.is2faEnabled ? 'text-green-400' : 'text-red-400'}">${user.is2faEnabled ? 'On' : 'Off'}</span></p>
      <p>Wins: <span class="text-green-400">${stats.wins}</span></p>
      <p>Losses: <span class="text-red-400">${stats.losses}</span></p>
    `;

    const chartPanel = document.createElement('div');
    chartPanel.className = 'mb-8 bg-white/5 p-4 rounded-xl';
    const chartCanvas = document.createElement('canvas');
    chartPanel.appendChild(chartCanvas);

    const mfaBtn = this.createMenuButton('🔒 Security Settings (MFA)', () => this.switchView('mfa'));
    this.container.append(title, info, chartPanel, mfaBtn);

    setTimeout(() => {
      new Chart(chartCanvas, {
        type: 'doughnut',
        data: {
          labels: ['Wins', 'Losses'],
          datasets: [{ data: [stats.wins, stats.losses], backgroundColor: ['#22c55e', '#ef4444'] }],
        },
        options: {
            responsive: true,
            plugins: { legend: { labels: { color: '#fff' } } }
        }
      });
    }, 0);
  }

  private renderGameSessions(stats: any) {
    const title = document.createElement('h2');
    title.className = 'text-2xl font-bold text-white mb-6 text-center';
    title.textContent = 'Game Sessions';

    let filtered = stats.allGames.slice((this.page - 1) * this.pageSize, this.page * this.pageSize);
    const historyPanel = this.createHistoryPanel(filtered);
    this.container.append(title, historyPanel);
  }

  private createHistoryPanel(history: GameHistoryItem[]): HTMLElement {
    const panel = document.createElement('div');
    panel.className = 'overflow-x-auto';
    const table = document.createElement('table');
    table.className = 'w-full text-sm text-slate-300';
    table.innerHTML = `
      <thead><tr class="text-left font-bold border-b border-white/10"><th>Date</th><th>Opponent</th><th>Result</th><th>Score</th></tr></thead>
      <tbody>${history.map(g => `
        <tr class="border-b border-white/5">
          <td>${g.date}</td><td>${g.opponent}</td>
          <td class="${g.result === 'Win' ? 'text-green-400' : 'text-red-400'}">${g.result}</td>
          <td>${g.score}</td>
        </tr>`).join('')}
      </tbody>`;
    panel.appendChild(table);
    return panel;
  }

  private createTabButton(text: string, active: boolean, onClick: () => void): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.className = `px-4 py-2 rounded transition-all ${active ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`;
    btn.textContent = text;
    btn.onclick = onClick;
    return btn;
  }

  private createMenuButton(text: string, onClick: () => void): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.className = 'w-full py-3 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all text-left px-4 flex justify-between items-center group mt-4';
    btn.innerHTML = `<span>${text}</span><span class="opacity-0 group-hover:opacity-100 transition-opacity">→</span>`;
    btn.onclick = onClick;
    return btn;
  }

  public getElement(): HTMLElement {
    return this.el;
  }
}
