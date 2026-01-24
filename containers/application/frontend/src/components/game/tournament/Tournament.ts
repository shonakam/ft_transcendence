type Player = {
  isUser: boolean; // 実際のユーザーかBYEか
  userId: string | null; // ログインユーザーのID（未ログインはnull）
  alias: string;
  score: number | null;
};

type MatchStatus = 'undefined' | 'pending' | 'playing' | 'completed';
type winner = 1 | 2 | 'bye' | null;

type Match = {
  status: MatchStatus;
  p1: Player | null;
  p2: Player | null;
  winner: winner;
};

type TournamentState = {
  rounds: Match[][];
};

// プレイヤー登録時の入力データ
export type PlayerInput = {
  alias: string;
  userId: string | null; // ログインユーザーの場合はユーザーID
};

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export class Tournament {
  private players: PlayerInput[] = [];
  private state: TournamentState | null = null;

  constructor() {}

  // 新しいaddMember（PlayerInput対応）
  addMember(alias: string, userId: string | null = null): void {
    this.players.push({ alias, userId });
  }

  // プレイヤー一覧をクリア
  clearMembers(): void {
    this.players = [];
  }

  // shuffle players and create tournament brackets
  createInitialState(): boolean {
    const slots: (PlayerInput | null)[] = [...this.players];

    // Shuffle including blanks
    const shuffled = shuffle(slots);

    // add byes to make the number of players a power of two
    const targetSize =
      shuffled.length <= 1 ? 1 : 2 ** Math.ceil(Math.log2(shuffled.length));
    while (shuffled.length < targetSize) {
      shuffled.push(null);
    }

    // Create first round
    const firstRound: Match[] = [];

    for (let i = 0; i < shuffled.length / 2; i += 1) {
      const input1: PlayerInput | null = shuffled[i] ?? null;
      const input2: PlayerInput | null =
        shuffled[i + shuffled.length / 2] ?? null;
      const status: MatchStatus = 'pending';
      const p1: Player | null =
        input1 !== null
          ? {
              isUser: true,
              userId: input1.userId,
              alias: input1.alias,
              score: 0,
            }
          : { isUser: false, userId: null, alias: '(bye)', score: null };
      const p2: Player | null =
        input2 !== null
          ? {
              isUser: true,
              userId: input2.userId,
              alias: input2.alias,
              score: 0,
            }
          : { isUser: false, userId: null, alias: '(bye)', score: null };

      let matchWinner: winner = null;
      let matchStatus: MatchStatus = 'pending';

      // BYE処理: 片方がBYEなら自動的に勝者決定
      if (!p1.isUser && p2.isUser) {
        matchWinner = 2;
        matchStatus = 'completed';
      } else if (p1.isUser && !p2.isUser) {
        matchWinner = 1;
        matchStatus = 'completed';
      } else if (!p1.isUser && !p2.isUser) {
        matchWinner = 'bye';
        matchStatus = 'completed';
      }

      firstRound.push({ status: matchStatus, p1, p2, winner: matchWinner });
    }

    // Create rounds array
    const rounds: Match[][] = [firstRound];

    let matches = firstRound.length;
    while (matches > 1) {
      matches = Math.ceil(matches / 2);
      rounds.push(
        Array.from({ length: matches }, () => ({
          p1: null,
          p2: null,
          winner: null,
          status: 'undefined' as MatchStatus,
        }))
      );
    }

    this.state = { rounds };

    // 初期のBYE勝者を次ラウンドに進める
    this.advanceAllCompletedMatches();

    return true;
  }

  // 次の対戦（pending状態の最初のマッチ）を取得
  getNextMatch(): {
    roundIndex: number;
    matchIndex: number;
    match: Match;
  } | null {
    if (!this.state) return null;

    for (
      let roundIndex = 0;
      roundIndex < this.state.rounds.length;
      roundIndex++
    ) {
      const round = this.state.rounds[roundIndex];
      for (let matchIndex = 0; matchIndex < round.length; matchIndex++) {
        const match = round[matchIndex];
        if (
          match.status === 'pending' &&
          match.p1?.isUser &&
          match.p2?.isUser
        ) {
          return { roundIndex, matchIndex, match };
        }
      }
    }
    return null;
  }

  // 試合結果を記録
  recordResult(
    roundIndex: number,
    matchIndex: number,
    p1Score: number,
    p2Score: number
  ): boolean {
    if (!this.state) return false;

    const match = this.state.rounds[roundIndex]?.[matchIndex];
    if (!match || match.status !== 'playing') return false;

    if (match.p1) match.p1.score = p1Score;
    if (match.p2) match.p2.score = p2Score;

    match.winner = p1Score > p2Score ? 1 : 2;
    match.status = 'completed';

    // 勝者を次ラウンドに進行
    this.advanceWinner(roundIndex, matchIndex);

    return true;
  }

  // 試合開始をマーク
  startMatch(roundIndex: number, matchIndex: number): boolean {
    if (!this.state) return false;

    const match = this.state.rounds[roundIndex]?.[matchIndex];
    if (!match || match.status !== 'pending') return false;

    match.status = 'playing';
    return true;
  }

  // 勝者を次ラウンドに進行
  private advanceWinner(roundIndex: number, matchIndex: number): void {
    if (!this.state) return;

    const match = this.state.rounds[roundIndex]?.[matchIndex];
    if (!match || match.status !== 'completed') return;

    // 最終ラウンドなら進行不要
    if (roundIndex >= this.state.rounds.length - 1) return;

    const nextRoundMatchIndex = Math.floor(matchIndex / 2);
    const nextMatch = this.state.rounds[roundIndex + 1][nextRoundMatchIndex];
    if (!nextMatch) return;

    // 勝者を取得
    let winnerPlayer: Player | null = null;
    if (match.winner === 1) {
      winnerPlayer = match.p1;
    } else if (match.winner === 2) {
      winnerPlayer = match.p2;
    } else if (match.winner === 'bye') {
      // 両方BYEの場合は進行しない
      return;
    }

    if (!winnerPlayer) return;

    // 次ラウンドの適切な位置に配置（奇数matchIndexならp2、偶数ならp1）
    const newPlayer: Player = { ...winnerPlayer, score: 0 };
    if (matchIndex % 2 === 0) {
      nextMatch.p1 = newPlayer;
    } else {
      nextMatch.p2 = newPlayer;
    }

    // 両者揃ったらpendingに
    if (nextMatch.p1 && nextMatch.p2) {
      // 片方がBYEなら自動決着
      if (!nextMatch.p1.isUser && nextMatch.p2.isUser) {
        nextMatch.winner = 2;
        nextMatch.status = 'completed';
        this.advanceWinner(roundIndex + 1, nextRoundMatchIndex);
      } else if (nextMatch.p1.isUser && !nextMatch.p2.isUser) {
        nextMatch.winner = 1;
        nextMatch.status = 'completed';
        this.advanceWinner(roundIndex + 1, nextRoundMatchIndex);
      } else if (nextMatch.p1.isUser && nextMatch.p2.isUser) {
        nextMatch.status = 'pending';
      }
    }
  }

  // 完了済みの全マッチについて勝者を進行させる
  private advanceAllCompletedMatches(): void {
    if (!this.state) return;

    for (
      let roundIndex = 0;
      roundIndex < this.state.rounds.length - 1;
      roundIndex++
    ) {
      const round = this.state.rounds[roundIndex];
      for (let matchIndex = 0; matchIndex < round.length; matchIndex++) {
        const match = round[matchIndex];
        if (match.status === 'completed') {
          this.advanceWinner(roundIndex, matchIndex);
        }
      }
    }
  }

  // トーナメント終了判定
  isFinished(): boolean {
    if (!this.state) return false;

    const finalRound = this.state.rounds[this.state.rounds.length - 1];
    return finalRound.length === 1 && finalRound[0].status === 'completed';
  }

  // 優勝者取得
  getWinner(): Player | null {
    if (!this.isFinished() || !this.state) return null;

    const finalMatch = this.state.rounds[this.state.rounds.length - 1][0];
    if (finalMatch.winner === 1) return finalMatch.p1;
    if (finalMatch.winner === 2) return finalMatch.p2;
    return null;
  }

  // BYEでない完了済み試合の結果を取得（バックエンド送信用）
  getCompletedMatchResults(): Array<{
    roundIndex: number;
    matchIndex: number;
    p1: Player;
    p2: Player;
    winner: 1 | 2;
  }> {
    if (!this.state) return [];

    const results: Array<{
      roundIndex: number;
      matchIndex: number;
      p1: Player;
      p2: Player;
      winner: 1 | 2;
    }> = [];

    for (
      let roundIndex = 0;
      roundIndex < this.state.rounds.length;
      roundIndex++
    ) {
      const round = this.state.rounds[roundIndex];
      for (let matchIndex = 0; matchIndex < round.length; matchIndex++) {
        const match = round[matchIndex];
        // BYEでない完了済み試合のみ
        if (
          match.status === 'completed' &&
          match.winner !== 'bye' &&
          match.winner !== null &&
          match.p1?.isUser &&
          match.p2?.isUser
        ) {
          results.push({
            roundIndex,
            matchIndex,
            p1: match.p1,
            p2: match.p2,
            winner: match.winner,
          });
        }
      }
    }

    return results;
  }

  getState(): TournamentState | null {
    return this.state;
  }
}
