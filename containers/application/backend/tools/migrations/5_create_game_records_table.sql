
CREATE TABLE IF NOT EXISTS game_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id TEXT NOT NULL UNIQUE,
  left_user_id TEXT NOT NULL,
  right_user_id TEXT NOT NULL,
  left_alias TEXT,
  right_alias TEXT,
  left_point INTEGER NOT NULL DEFAULT 0,
  right_point INTEGER NOT NULL DEFAULT 0,
  winner_id TEXT,
  started_at INTEGER,
  ended_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_game_records_left_user_id ON game_records(left_user_id);
CREATE INDEX IF NOT EXISTS idx_game_records_right_user_id ON game_records(right_user_id);
CREATE INDEX IF NOT EXISTS idx_game_records_created_at ON game_records(created_at);
