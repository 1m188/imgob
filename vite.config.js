import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Vite 配置文件 — Vue 3 图片浏览器
// https://vitejs.dev/config/
export default defineConfig({
  // GitHub Pages 部署到 https://<user>.github.io/<repo>/
  // 本地开发时 / 即可正常工作
  base: process.env.NODE_ENV === 'production' ? '/imgob/' : '/',
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
})
