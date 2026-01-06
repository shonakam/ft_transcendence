CREATE TABLE IF NOT EXISTS user_2fa (
    user_id TEXT PRIMARY KEY,
    totp_secret TEXT,
    is_totp_enabled INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Rollback
-- DROP TABLE user_2fa;
