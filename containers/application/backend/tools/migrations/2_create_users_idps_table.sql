CREATE TABLE IF NOT EXISTS `user_idps` (
    id TEXT PRIMARY KEY, 
    user_id TEXT NOT NULL, 
    provider TEXT NOT NULL, 
    provider_user_id TEXT NOT NULL, 
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    withdrawn_at INTEGER,
    UNIQUE (provider, provider_user_id) 
);

-- Rollback
-- DROP TABLE `user_idps`
