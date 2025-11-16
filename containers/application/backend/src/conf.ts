export const config = {
  auth :{
      jwtSecret: process.env.JWT_SECRET || 'FQJH1Fh/yGZuqYyRkTK4pemzZF1pEX0hjbAnWcvxOLA='
    },
  api: {
    auth: {
      path: 'auth',
      version: 'v1',
    },
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
