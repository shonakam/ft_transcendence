-- ユーザーテーブル
DROP TABLE IF EXISTS users;
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    password TEXT,
    image_path TEXT,
    is_2fa_enabled INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    withdrawn_at INTEGER
);

-- OIDCログイン用ユーザーテーブル
DROP TABLE IF EXISTS user_idps;
CREATE TABLE IF NOT EXISTS user_idps (
    id TEXT PRIMARY KEY, 
    user_id TEXT NOT NULL, 
    provider TEXT NOT NULL, 
    provider_user_id TEXT NOT NULL,
    image_path TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    withdrawn_at INTEGER,
    UNIQUE (provider, provider_user_id) 
);

-- 2FA管理用テーブル
DROP TABLE IF EXISTS user_2fa;
CREATE TABLE IF NOT EXISTS user_2fa (
    user_id TEXT PRIMARY KEY,
    totp_secret TEXT,
    is_totp_enabled INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);
