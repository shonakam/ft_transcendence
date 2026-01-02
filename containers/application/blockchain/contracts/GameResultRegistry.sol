// SPDX-License-Identifier: UNLICENSED

contract GameResultRegistry {
	struct Game {
    string player1Id;
    string player2Id;
    uint16 player1Score;
    uint16 player2Score;
		uint64 registedAt;
	}

	event GameRegistered(
		bytes32 indexed gameKey,
    string gameId,
    string player1Id,
    string player2Id,
    uint16 player1Score,
    uint16 player2Score,
    uint64 registedAt
	);

	mapping (bytes32 => Game) public games;

	constructor() {}

	function regist(
    string calldata gameId,
    string calldata p1Id,
    string calldata p2Id,
    uint16 p1Score,
    uint16 p2Score
	) external {
		bytes32 k = keccak256(bytes(gameId));
		require(games[k].registedAt == 0, "already exists");

		games[k] = Game({
    	player1Id: p1Id,
    	player2Id: p2Id,
			player1Score: p1Score,
			player2Score: p2Score,
			registedAt: uint64(block.timestamp)
		});

		emit GameRegistered(
			k,
    	gameId,
    	p1Id,
      p2Id,
      p1Score,
      p2Score,
      uint64(block.timestamp)
    );
	}

	function winnerId(bytes16 gameId) public view returns (string memory) {
    Game storage g = games[gameId];

    if (g.player1Score == g.player2Score) return "";
    return g.player1Score > g.player2Score
      ? g.player1Id
      : g.player2Id;
	}

	function getGame(bytes16 gameId)
		external
		view
		returns (
			string memory player1Id,
			string memory player2Id,
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

	function health() external pure returns (string memory) {
    return "OK";
	}
}
