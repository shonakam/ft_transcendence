CREATE TABLE IF NOT EXISTS `users` (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    imagePath TEXT,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    withdrawnAt INTEGER
);

-- RollBack
-- DROP TABLE `users`
