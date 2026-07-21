import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// 로컬 개발 전용 JavaScript 플러그인입니다. 프로덕션 Worker에는 포함되지 않습니다.
import codexBridge from './dev/codex-bridge.mjs'

export default defineConfig({
  plugins: [react(), codexBridge()],
})
