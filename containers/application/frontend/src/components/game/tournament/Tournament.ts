type matchStatus = 'waiting' | 'in_progress' | 'completed';

type Player = {
  alias: string;
  // id: string;
  // name: string;
};

type Match = {
  id: string;
  round: number; // 0 = 1回戦
  index: number; // そのラウンド内の順序
  players: [Player | null, Player | null];
  winner?: Player;
  nextMatchId?: string; // 勝者が進む先
};

export class Tournament {
  status: matchStatus = 'waiting';
  players: Player[] = [];

  constructor() {}

  addMember(alias: string): void {
    this.players.push({ alias });
  }

  deleteMember(alias: string): void {
    this.players = this.players.filter((player) => player.alias !== alias);
  }

  updateStatus(newStatus: matchStatus): void {
    this.status = newStatus;
  }

  private nextPowerOfTwo(n: number): number {
    return 1 << Math.ceil(Math.log2(n));
  }

  buildTournament(): Match[] {
    if (this.players.length < 2) {
      return [];
    }
    const size = this.nextPowerOfTwo(this.players.length);
    const rounds = Math.log2(size);

    const matches: Match[] = [];
    let matchId = 0;

    // 1回戦
    for (let i = 0; i < size / 2; i++) {
      matches.push({
        id: `m${matchId++}`,
        round: 0,
        index: i,
        players: [this.players[i * 2] ?? null, this.players[i * 2 + 1] ?? null],
      });
    }

    // 上位ラウンド
    for (let r = 1; r < rounds; r++) {
      const prev = matches.filter((m) => m.round === r - 1);
      for (let i = 0; i < prev.length / 2; i++) {
        matches.push({
          id: `m${matchId++}`,
          round: r,
          index: i,
          players: [null, null],
        });
      }
    }

    return matches;
  }
}
