// SPDX-License-Identifier: UNLICENSED

contract GameContract {
	struct Game {
    bytes16 player1Id;
    bytes16 player2Id;
    uint16 player1Score;
    uint16 player2Score;
		uint64 registedAt;
	}

	mapping (bytes16 => Game) public games;

	constructor() {}

	function regist(
		bytes16 gameId,
    bytes16 p1Id,
    bytes16 p2Id,
    uint16 p1Score,
    uint16 p2Score
	) external {
		require(games[gameId].registedAt == 0, "already exists");

		games[gameId] = Game({
    	player1Id: p1Id,
    	player2Id: p2Id,
			player1Score: p1Score,
			player2Score: p2Score,
			registedAt: uint64(block.timestamp)
		});
	}

	function winnerId(bytes16 gameId) public view returns (bytes16) {
    Game storage g = games[gameId];

    if (g.player1Score == g.player2Score) return bytes16(0);
    return g.player1Score > g.player2Score
      ? g.player1Id
      : g.player2Id;
	}

	function getGame(bytes16 gameId)
		external
		view
		returns (
				bytes16 player1Id,
				bytes16 player2Id,
				uint16 player1Score,
				uint16 player2Score,
				uint64 registedAt
		)
	{
		Game storage g = games[gameId];
		require(g.registedAt != 0, "game not found");

		return (
			g.player1Id,
			g.player2Id,
			g.player1Score,
			g.player2Score,
			g.registedAt
		);
	}
}