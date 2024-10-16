import { fileURLToPath, URL } from 'node:url'
import dotenv from 'dotenv'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

dotenv.config()
const publicPath = process.env.VITE_PUBLIC_PATH ? `/${process.env.VITE_PUBLIC_PATH}/` : '/'

export default defineConfig({
  server: {
    port: process.env.VITE_PORT,
    host: true
  },
  base: publicPath,
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
