type Player = {
  alias: string;
  score: number;
};

type Match = {
  p1: Player | null;
  p2: Player | null;
  winner: 1 | 2 | null;
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

  createInitialState(): boolean {
    const slots: (string | null)[] = [...this.players];

    // add byes to make the number of players a power of two
    const targetSize =
      slots.length <= 1 ? 1 : 2 ** Math.ceil(Math.log2(slots.length));
    while (slots.length < targetSize) {
      slots.push(null);
    }

    // Shuffle including blanks
    const shuffled = shuffle(slots);

    // Create first round
    const firstRound: Match[] = [];

    for (let i = 0; i < shuffled.length; i += 2) {
      const alias1 = shuffled[i] ?? null;
      const alias2 = shuffled[i + 1] ?? null;
      firstRound.push({
        p1: alias1 !== null ? { alias: alias1, score: 0 } : null,
        p2: alias2 !== null ? { alias: alias2, score: 0 } : null,
        winner: null,
      });
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
