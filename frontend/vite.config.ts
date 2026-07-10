/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    react(),
    // The React Compiler isn't needed to run tests and interferes with the
    // JSX transform under Vitest, so only apply it outside of tests.
    ...(process.env.VITEST ? [] : [babel({ presets: [reactCompilerPreset()] })]),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      // Exclude non-logic files: app bootstrap, type-only modules and tests.
      exclude: [
        'src/main.tsx',
        'src/App.tsx',
        'src/interfaces/**',
        'src/test/**',
        'src/**/*.test.{ts,tsx}',
      ],
    },
  },
})
