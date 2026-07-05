import { defineConfig } from 'vite'

export default defineConfig({
  base: '/forlove/',
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
