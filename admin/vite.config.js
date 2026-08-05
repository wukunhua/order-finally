import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
const publicBaseUrl = 'https://shbus.top';
const localhostBaseUrl = 'http://localhost:3000';
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    // 把 /api 请求代理到后端,避免跨域;前端代码里直接写 /api/xxx
    proxy: {
      '/api': {
        target: publicBaseUrl,
        changeOrigin: true,
      },
      '/uploads': {
        target: publicBaseUrl,
        changeOrigin: true,
      },
    },
  },
});
