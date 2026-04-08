/*
 * @Author: ChiaEnKang
 * @Date: 2026-02-25 22:40:58
 * @LastEditors: ChiaEnKang
 * @LastEditTime: 2026-04-07 00:29:48
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.ngrok-free.app',  // 允許所有 *.ngrok-free.app 子域名
      '.ngrok.io'  // 如果升級到付費方案
    ]
  }
})
