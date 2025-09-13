import { defineConfig, loadEnv } from 'vite'

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
  },
  }
})
