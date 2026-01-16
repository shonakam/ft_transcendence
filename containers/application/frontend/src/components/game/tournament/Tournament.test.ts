import { Tournament } from './Tournament';

describe('Tournament Class', () => {
  let tournament: Tournament;

  beforeEach(() => {
    tournament = new Tournament();
  });

  it('should add members correctly', () => {
    tournament.addMember('Player1');
    tournament.addMember('Player2');
    expect(tournament.players.length).toBe(2);
    expect(tournament.players[0].alias).toBe('Player1');
    expect(tournament.players[1].alias).toBe('Player2');
  });

  it('should delete members correctly', () => {
    tournament.addMember('Player1');
    tournament.addMember('Player2');
    tournament.deleteMember('Player1');
    expect(tournament.players.length).toBe(1);
    expect(tournament.players[0].alias).toBe('Player2');
  });

  it('should update status correctly', () => {
    tournament.updateStatus('in_progress');
    expect(tournament.status).toBe('in_progress');
    tournament.updateStatus('completed');
    expect(tournament.status).toBe('completed');
  });
});

describe('Tournament.buildTournament', () => {
  it('should build a tournament bracket correctly', () => {
    const tournament = new Tournament();
    const playerAliases = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    playerAliases.forEach((alias) => tournament.addMember(alias));

    const matches = tournament.buildTournament();

    // 8 players, so 4 matches in round 0
    const firstRoundMatches = matches.filter((m) => m.round === 0);
    expect(firstRoundMatches.length).toBe(4);

    const playersInFirstRound = firstRoundMatches
      .flatMap((m) => m.players)
      .filter((p) => p !== null);
    expect(playersInFirstRound.length).toBe(8);

    // No byes
    const byes = firstRoundMatches
      .flatMap((m) => m.players)
      .filter((p) => p === null);
    expect(byes.length).toBe(0);

    // Check upper rounds
    const secondRoundMatches = matches.filter((m) => m.round === 1);
    expect(secondRoundMatches.length).toBe(2);

    const finalRoundMatches = matches.filter((m) => m.round === 2);
    expect(finalRoundMatches.length).toBe(1);
  });

  it('should handle non-power of two players by adding byes', () => {
    const tournament = new Tournament();
    const playerAliases = ['A', 'B', 'C', 'D', 'E'];
    playerAliases.forEach((alias) => tournament.addMember(alias));

    const matches = tournament.buildTournament();

    // There should be 8 players in the first round (3 byes)
    const firstRoundMatches = matches.filter((m) => m.round === 0);
    expect(firstRoundMatches.length).toBe(4);
    const playersInFirstRound = firstRoundMatches
      .flatMap((m) => m.players)
      .filter((p) => p !== null);
    expect(playersInFirstRound.length).toBe(5); // 5 actual players

    // Check that the byes are represented as nulls
    const byes = firstRoundMatches
      .flatMap((m) => m.players)
      .filter((p) => p === null);
    expect(byes.length).toBe(3);
  });

  it('should return an empty array if there are no players', () => {
    const tournament = new Tournament();
    const matches = tournament.buildTournament();
    expect(matches.length).toBe(0);
  });

  it('should create a single match if there are only two players', () => {
    const tournament = new Tournament();
    tournament.addMember('A');
    tournament.addMember('B');
    const matches = tournament.buildTournament();
    expect(matches.length).toBe(1);
    expect(matches[0].players.filter((p) => p !== null).length).toBe(2);
    expect(matches[0].round).toBe(0);
  });

  it('should allow deleting a member and reflect in the bracket', () => {
    const tournament = new Tournament();
    tournament.addMember('A');
    tournament.addMember('B');
    tournament.addMember('C');
    tournament.deleteMember('B');
    const matches = tournament.buildTournament();
    const firstRoundMatches = matches.filter((m) => m.round === 0);
    const playersInFirstRound = firstRoundMatches
      .flatMap((m) => m.players)
      .filter((p) => p !== null);
    expect(playersInFirstRound.length).toBe(2);
    expect(playersInFirstRound.some((p) => p && p.alias === 'B')).toBe(false);
  });

  it('should print all matches for visual inspection', () => {
    const tournament = new Tournament();
    const playerAliases = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    playerAliases.forEach((alias) => tournament.addMember(alias));
    const matches = tournament.buildTournament();
    matches.forEach((match, idx) => {
      const playerNames = match.players
        .map((p) => (p ? p.alias : 'BYE'))
        .join(' vs ');

      console.log(`Match ${idx}: Round ${match.round} - ${playerNames}`);
    });
    expect(matches.length).toBeGreaterThan(0);
  });
});
