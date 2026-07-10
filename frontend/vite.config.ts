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
})
