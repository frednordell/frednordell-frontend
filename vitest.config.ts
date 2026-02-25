import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.ts'

export default mergeConfig(viteConfig, defineConfig({
  optimizeDeps: {
    include: ['vue'],
  },
  test: {
    browser: {
        enabled: true,
        name: 'webkit',
        provider: 'playwright',
      },
  },
}))