import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';

export default defineConfig({
  plugins: [uni()],
  // H5 开发时把 /api 代理到后端(mp-weixin 不走代理,直接请求完整地址,见 utils/request.js)
  server: {
    host: true, // 监听所有网卡:localhost / 127.0.0.1 / 局域网 IP 都能访问(避免 IPv6-only 打不开)
    port: 5174,
    strictPort: true, // 端口被占就直接报错,不偷偷换端口(否则照旧端口访问会打不开)
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
      '/uploads': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
});
