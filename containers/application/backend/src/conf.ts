export const config = {
  db: {
    path:
      process.env.NODE_ENV === 'test'
        ? 'file:memdb1?mode=memory&cache=shared'
        : process.env.DB_PATH || '/var/lib/sqlite/transcendence.sqlite',
  },
};
