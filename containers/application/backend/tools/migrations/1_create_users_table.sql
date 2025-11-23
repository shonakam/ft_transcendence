CREATE TABLE IF NOT EXISTS `users` (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL,
    password TEXT,
    image_path TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    withdrawn_at INTEGER
);

-- RollBack
-- DROP TABLE `users`
