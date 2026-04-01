/*
 * @Author: ChiaEnKang
 * @Date: 2026-02-25 22:40:58
 * @LastEditors: ChiaEnKang
 * @LastEditTime: 2026-04-02 00:09:40
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
      '8d42-220-132-201-204.ngrok-free.app',
      '*.ngrok-free.app',  // 允許所有 ngrok 域名
      '*.ngrok.io'  // 如果升級到付費方案
    ]
  }
})
