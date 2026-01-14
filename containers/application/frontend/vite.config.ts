import { defineConfig, loadEnv } from 'vite'
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    // root: './',
    build: {
      outDir: 'dist'
    },
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
    server: {
      port: env.APP_PORT ? Number(env.APP_PORT) : 5173,
      host: "0.0.0.0",
      fs: {
        allow: ['..'],
      },
    },
    resolve: {
      alias: {
        '@shonakam/common': path.resolve(__dirname, '../common/src'),
      },
    }
  }
})
