export const config = {
  auth :{
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'FQJH1Fh/yGZuqYyRkTK4pemzZF1pEX0hjbAnWcvxOLA=',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'lOhCGrbX6haACZZfzERYyia6conx7VhbNiphITO52GY=',
    jwtTmpAuthSecret: process.env.JWT_TMP_AUTH_SECRET || 'r2ke4j+PYjNzpcOHtO+As1kl1uHEDF/xE+zSo6HZL9k=',
    // accessTokenTtlMs: 1000, // 1sec
    // refreshTokenTtlMs: 5000, // 5sec
    accessTokenTtlMs: 900000, // 15min (15 * 60 * 1000)
    refreshTokenTtlMs: 86400000,  // 1day (24 * 60 * 60 * 1000)
    issure: process.env.JWT_ISSURE || 'https://api.transcendence.42.fr',
    audience: process.env.JWT_AUDIENCE || 'https://transcendence.42.fr',
    idp: {
      redirect_uri: process.env.REDIRECT_URI || 'https://transcendence.42.fr/auth/callback',
      providers: {
        ft: {
          endpoint: 'https://api.intra.42.fr',
          path: '/oauth/token',
          clientId: process.env.FT_CLIENT_ID || '',
          clientSecret: process.env.FT_CLIENT_SECRET || '',
        },
        // github: {
        //   endpoint: ,
        //   path: ,
        //   clientId: ,
        //   clientSecret: ,
        // }
      },
    }
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

export const cookieConfig = {
  secure: false,
  httpOnly: true,
  // domain: 'api.transcendence.42.fr',
  path: '/',
  maxAge: 60 * 60 * 24 * 7,
};
