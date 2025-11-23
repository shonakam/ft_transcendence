-- ユーザーテーブル
DROP TABLE users;
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL,
    password TEXT,
    image_path TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    withdrawn_at INTEGER
);

-- OIDCログイン用ユーザーテーブル
DROP TABLE user_idps;
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
