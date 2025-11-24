CREATE TABLE IF NOT EXISTS user_2fa (
    user_id TEXT PRIMARY,
    totp_secret TEXT,
    totp INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
);

-- Rollback
-- DROP TABLE user_2fa;
