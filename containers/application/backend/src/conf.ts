export const config = {
  auth :{
      jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'FQJH1Fh/yGZuqYyRkTK4pemzZF1pEX0hjbAnWcvxOLA=',
      jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'lOhCGrbX6haACZZfzERYyia6conx7VhbNiphITO52GY=',
      accessTokenTtlMs: 900000, // 15min (15 * 60 * 1000)
      refreshTokenTtlMs: 86400000,  // 1day (24 * 60 * 60 * 1000)
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
  redis: {
    host: process.env.REDIS_HOST || 'ft-redis',
    port: process.env.REDIS_HOST || '6379',
    retries: process.env.REDIS_HOST || '3',
  },
};
