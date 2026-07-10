import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

// Test config lives here (not in vite.config.ts) so the production build's
// type-check of vite.config.ts isn't affected by Vitest's bundled Vite types.
export default mergeConfig(
  viteConfig,
  defineConfig({
    esbuild: {
      jsx: 'automatic',
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      css: false,
    },
  }),
)
