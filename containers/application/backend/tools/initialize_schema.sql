-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    imagePath TEXT,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    withdrawnAt INTEGER
);

-- OIDCログイン用ユーザーテーブル
CREATE TABLE IF NOT EXISTS user_idps (
    id TEXT PRIMARY KEY, 
    user_id TEXT NOT NULL, 
    provider TEXT NOT NULL, 
    provider_user_id TEXT NOT NULL,
    imagePath TEXT,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    withdrawnAt INTEGER,
    UNIQUE (provider, provider_user_id) 
);
