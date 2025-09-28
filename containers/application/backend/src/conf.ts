export const config = {
  api: {
    user: {
      path: 'users',
      version: 'v1',
      paginaiton: {
        offset: 0,
        limit: 20
      }
    },
    geme: {

    },
    chat: {

    },
    session: {

    },
  },
  db: {
    path:
      process.env.NODE_ENV === 'test'
        ? 'file:memdb1?mode=memory&cache=shared'
        : process.env.DB_PATH || '/var/lib/sqlite/transcendence.sqlite',
  },
};
