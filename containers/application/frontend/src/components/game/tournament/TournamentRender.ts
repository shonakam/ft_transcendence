import { Tournament } from './Tournament';
import { Component } from '../../../interface/Component';
import tournamentTemplate from './tournament.html?raw';
import './tournament.css';
import { authStore } from '../../../store/authStore';

export type TournamentCallbacks = {
  onTournamentStart?: () => void;
  onMatchReady?: (match: {
    roundIndex: number;
    matchIndex: number;
    p1Alias: string;
    p2Alias: string;
  }) => void;
};

export class TournamentRender implements Component {
  el: HTMLElement = document.createElement('div');
  logic: Tournament = new Tournament();
  private callbacks: TournamentCallbacks = {};
  private loggedInUserId: string | null = null;
  private unsubscribeAuth: (() => void) | null = null;

  constructor(callbacks?: TournamentCallbacks) {
    this.callbacks = callbacks || {};
    this.loggedInUserId = authStore.getUsername();
    this.initForm();

    // 認証状態の変更を監視
    this.unsubscribeAuth = authStore.subscribe((state) => {
      this.loggedInUserId = state.username;
      this.updateCheckboxVisibility(state.isLoggedIn);
    });
  }

  private updateCheckboxVisibility(isLoggedIn: boolean): void {
    // 各プレイヤーの「This is me」ラベル
    this.el.querySelectorAll('.is-me-label').forEach((label) => {
      if (isLoggedIn) {
        label.classList.remove('hidden');
        label.classList.add('flex');
      } else {
        label.classList.add('hidden');
        label.classList.remove('flex');
      }
    });

    // 「ログインユーザーとしてプレイしない」オプション
    const notPlayingOption = this.el.querySelector('#not-playing-option');
    if (notPlayingOption) {
      if (isLoggedIn) {
        notPlayingOption.classList.remove('hidden');
      } else {
        notPlayingOption.classList.add('hidden');
      }
    }
  }

  private initForm(): void {
    this.el.innerHTML = tournamentTemplate;

    // ログイン状態に応じてチェックボックスを表示
    this.updateCheckboxVisibility(authStore.isLoggedIn());

    // フォームsubmitイベント
    const form = this.el.querySelector('#tournament-form') as HTMLFormElement;
    const submitBtn = form?.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement;

    // 入力監視でボタンの有効/無効を切り替え
    const updateSubmitButton = () => {
      const playerCount = this.countFilledPlayers(form);
      if (submitBtn) {
        submitBtn.disabled = playerCount < 2;
        if (playerCount < 2) {
          submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
          submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
      }
    };

    // 各入力フィールドにイベントリスナーを追加
    for (let i = 1; i <= 8; i++) {
      const input = form?.querySelector(`#player${i}`) as HTMLInputElement;
      input?.addEventListener('input', updateSubmitButton);
    }

    // 初期状態を設定
    updateSubmitButton();

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmit(form);
    });
  }

  private countFilledPlayers(form: HTMLFormElement): number {
    let count = 0;
    for (let i = 1; i <= 8; i++) {
      const alias = (form.querySelector(`#player${i}`) as HTMLInputElement)
        ?.value;
      if (alias && alias.trim()) {
        count++;
      }
    }
    return count;
  }

  private handleFormSubmit(form: HTMLFormElement): void {
    const formData = new FormData(form);

    // ラジオボタンで選択された「This is me」のプレイヤー番号を取得
    const selectedMeValue = formData.get('isMe') as string | null;
    const selectedMeIndex = selectedMeValue
      ? parseInt(selectedMeValue, 10)
      : null;

    // プレイヤーをクリアして再登録
    this.logic.clearMembers();

    for (let i = 1; i <= 8; i++) {
      const alias = formData.get(`player${i}`) as string;
      if (alias && alias.trim()) {
        const isMe = selectedMeIndex === i;
        const userId = isMe ? this.loggedInUserId : null;
        this.logic.addMember(alias.trim(), userId);
      }
    }

    // 最低2人必要
    const state = this.logic.getState();
    if (!state) {
      // プレイヤーが足りない場合はブラケット生成
      if (!this.logic.createInitialState()) {
        alert('At least 2 players are required.');
        return;
      }
    } else {
      this.logic.createInitialState();
    }

    // ブラケットを再描画
    this.renderBracket();

    // フォームを非表示
    form.classList.add('hidden');

    // コールバック呼び出し
    this.callbacks.onTournamentStart?.();

    // 最初の試合を通知
    this.notifyNextMatch();
  }

  private notifyNextMatch(): void {
    const next = this.logic.getNextMatch();
    if (next && next.match.p1 && next.match.p2) {
      this.callbacks.onMatchReady?.({
        roundIndex: next.roundIndex,
        matchIndex: next.matchIndex,
        p1Alias: next.match.p1.alias,
        p2Alias: next.match.p2.alias,
      });
    }
  }

  destroy(): void {
    if (this.unsubscribeAuth) {
      this.unsubscribeAuth();
      this.unsubscribeAuth = null;
    }
    this.el.remove();
  }

  render(): void {
    this.initForm();
  }

  renderBracket(): void {
    const state = this.logic.getState();
    const root = this.el.querySelector('#tournament')!;
    root.innerHTML = '';

    // トーナメント表を表示
    root.classList.remove('hidden');

    if (!state) {
      root.innerHTML =
        '<p class="text-sm text-gray-400">Add players to seed the bracket.</p>';
      return;
    }

    state.rounds.forEach((round, roundIndex) => {
      const col = document.createElement('div');
      col.className = 'flex flex-col gap-6 justify-around';

      round.forEach((match, matchIndex) => {
        const card = document.createElement('div');
        card.className =
          'match border border-white/30 rounded p-2 w-40 text-sm relative bg-white/10 text-white';
        card.dataset.round = String(roundIndex);
        card.dataset.match = String(matchIndex);

        // 現在の試合をハイライト
        if (match.status === 'playing') {
          card.classList.add('ring-2', 'ring-blue-400', 'bg-blue-900/50');
        } else if (match.status === 'completed') {
          card.classList.add('bg-white/5');
        }

        const p1Class =
          match.winner === 1 ? 'font-bold text-green-400' : 'text-gray-300';
        const p2Class =
          match.winner === 2 ? 'font-bold text-green-400' : 'text-gray-300';

        card.innerHTML = `
        <div class="flex justify-between ${p1Class}">
          <span>${match.p1?.alias ?? '-'}</span>
          <span>${match.p1?.score ?? '-'}</span>
        </div>
        <div class="flex justify-between ${p2Class}">
          <span>${match.p2?.alias ?? '-'}</span>
          <span>${match.p2?.score ?? '-'}</span>
        </div>
      `;
        col.appendChild(card);
      });

      root.appendChild(col);
    });
  }

  // 試合開始
  startCurrentMatch(): boolean {
    const next = this.logic.getNextMatch();
    if (!next) return false;

    return this.logic.startMatch(next.roundIndex, next.matchIndex);
  }

  // 試合結果を記録（外部から呼ばれる）
  recordMatchResult(p1Score: number, p2Score: number): boolean {
    const state = this.logic.getState();
    if (!state) return false;

    // playing状態の試合を探す
    for (let roundIndex = 0; roundIndex < state.rounds.length; roundIndex++) {
      const round = state.rounds[roundIndex];
      for (let matchIndex = 0; matchIndex < round.length; matchIndex++) {
        if (round[matchIndex].status === 'playing') {
          const result = this.logic.recordResult(
            roundIndex,
            matchIndex,
            p1Score,
            p2Score
          );
          if (result) {
            this.renderBracket();
            this.notifyNextMatch();
          }
          return result;
        }
      }
    }
    return false;
  }

  isFinished(): boolean {
    return this.logic.isFinished();
  }

  getWinner(): { alias: string; userId: string | null } | null {
    const winner = this.logic.getWinner();
    if (!winner) return null;
    return { alias: winner.alias, userId: winner.userId };
  }

  // バックエンド送信用の結果取得
  getCompletedResults() {
    return this.logic.getCompletedMatchResults();
  }

  public getElement(): HTMLElement {
    return this.el;
  }
}
