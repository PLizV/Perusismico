import { fileURLToPath, URL } from 'node:url'
import { cwd } from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

function normalizePublicPath(value) {
  const path = String(value || '').trim().replace(/^\/+|\/+$/g, '')
  return path ? `/${path}/` : '/'
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, cwd(), '')
  const port = Number(env.VITE_PORT) || undefined

  return {
    server: {
      port,
      host: true
    },
    base: normalizePublicPath(env.VITE_PUBLIC_PATH),
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    }
  }
})
