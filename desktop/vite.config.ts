import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@core': fileURLToPath(new URL('../core/src', import.meta.url)),
    },
  },
  optimizeDeps: {
    // 预打包 core 模块，避免 HMR 循环导入问题
    include: ['@core/engine/six-layer-engine', '@core/collection/holistic-collector', '@core/inference/ai-engine'],
  },
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      ignored: ['**/src-tauri/**'],
    },
    proxy: {
      // NVIDIA NIM API 代理（避免浏览器 CORS 限制）
      '/api/nvidia': {
        target: 'https://integrate.api.nvidia.com',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api\/nvidia/, ''),
        secure: true,
        timeout: 180000,       // 3分钟超时（推理模型需要更久）
        proxyTimeout: 180000,
      },
      // 通用 OpenAI 兼容 API 代理
      '/api/openai-compat': {
        target: 'https://integrate.api.nvidia.com',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api\/openai-compat/, ''),
        secure: true,
      },
    },
  },
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    target: 'es2020',
    minify: !process.env.TAURI_ENV_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
    rollupOptions: {
      external: ['@tauri-apps/api', '@tauri-apps/plugin-store'],
    },
  },
})
