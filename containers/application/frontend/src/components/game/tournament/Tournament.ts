type Player = {
  isUser: boolean;
  alias: string;
  score: number | null;
};

type MatchStatus = 'undefined' | 'pending' | 'completed';
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

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export class Tournament {
  private players: string[] = [];
  private state: TournamentState | null = null;

  constructor() {}

  addMember(alias: string): void {
    this.players.push(alias);
  }

  // shuffle players and create tournament brackets
  createInitialState(): boolean {
    const slots: (string | null)[] = [...this.players];

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
      const alias1: string | null = shuffled[i] ?? null;
      const alias2: string | null = shuffled[i + shuffled.length / 2] ?? null;
      const status: MatchStatus = 'pending';
      const p1: Player | null =
        alias1 !== null
          ? { isUser: true, alias: alias1, score: 0 }
          : { isUser: false, alias: '(bye)', score: null };
      const p2: Player | null =
        alias2 !== null
          ? { isUser: true, alias: alias2, score: 0 }
          : { isUser: false, alias: '(bye)', score: null };
      let winner: winner = null;
      if (alias1 === null || alias2 === null) winner = 'bye';
      firstRound.push({ status, p1, p2, winner });
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
          status: 'undefined',
        }))
      );
    }

    this.state = { rounds };
    return true;
  }

  getState(): TournamentState | null {
    return this.state;
  }
}
