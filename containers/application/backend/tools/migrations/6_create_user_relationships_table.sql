CREATE TABLE IF NOT EXISTS user_relationships (
    user_id TEXT NOT NULL,
    target_id TEXT NOT NULL,
    type TEXT NOT NULL, -- 'friend'
    status TEXT NOT NULL, -- 'pending', 'accepted'
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    PRIMARY KEY(user_id, target_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (target_id) REFERENCES users(id) ON DELETE CASCADE,
    CHECK (user_id != target_id)
);
