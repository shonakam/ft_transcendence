import { Tournament } from './Tournament';

const flattenSlots = (
  round: NonNullable<ReturnType<Tournament['getState']>>['rounds'][number]
) => round.flatMap((match) => [match.p1, match.p2]);

const sortedAliases = (
  players: Array<{ alias: string; score: number } | null>
) =>
  players
    .filter(
      (player): player is { alias: string; score: number } => player !== null
    )
    .map((player) => player.alias)
    .sort();

describe('Tournament', () => {
  it('returns null before any bracket is created', () => {
    const tournament = new Tournament();

    expect(tournament.getState()).toBeNull();
  });

  it('creates balanced rounds for a power-of-two roster', () => {
    const tournament = new Tournament();
    const players = Array.from(
      { length: 8 },
      (_, index) => `Player-${index + 1}`
    );

    players.forEach((alias) => tournament.addMember(alias));

    expect(tournament.createInitialState()).toBe(true);

    const state = tournament.getState();
    expect(state).not.toBeNull();

    const roundSizes = state!.rounds.map((round) => round.length);
    expect(roundSizes).toEqual([4, 2, 1]);

    const firstRoundAliases = sortedAliases(flattenSlots(state!.rounds[0]));
    expect(firstRoundAliases).toEqual([...players].sort());

    state!.rounds[0].forEach((match) => {
      if (match.p1) {
        expect(match.p1.score).toBe(0);
      }
      if (match.p2) {
        expect(match.p2.score).toBe(0);
      }
      expect(match.winner).toBeNull();
    });
  });

  it('pads entrants with byes up to the next power of two', () => {
    const tournament = new Tournament();
    const players = ['alpha', 'bravo', 'charlie'];
    players.forEach((alias) => tournament.addMember(alias));

    expect(tournament.createInitialState()).toBe(true);

    const state = tournament.getState();
    expect(state).not.toBeNull();

    const roundSizes = state!.rounds.map((round) => round.length);
    expect(roundSizes).toEqual([2, 1]);

    const slots = flattenSlots(state!.rounds[0]);
    const byeCount = slots.filter((player) => player === null).length;
    expect(byeCount).toBe(1);

    const aliases = sortedAliases(slots);
    expect(aliases).toEqual([...players].sort());
  });
});
