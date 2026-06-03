import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.ts'
import { playwright } from '@vitest/browser-playwright'

export default mergeConfig(viteConfig, defineConfig({
  optimizeDeps: {
    include: ['vue'],
  },
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'webkit' }],
    },
  },
}))