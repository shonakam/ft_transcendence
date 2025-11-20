CREATE TABLE IF NOT EXISTS `user_idps` (
    id TEXT PRIMARY KEY, 
    user_id TEXT NOT NULL, 
    provider TEXT NOT NULL, 
    provider_user_id TEXT NOT NULL, 
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    UNIQUE (provider, provider_user_id) 
);

-- Rollback
-- DROP TABLE `user_idps`
