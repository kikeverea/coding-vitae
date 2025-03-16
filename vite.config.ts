import {defineConfig, UserConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {configDefaults} from "vitest/config";


// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './testSetup.js',
    include: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: [...configDefaults.exclude, 'node_modules', 'dist']
  },
} as UserConfig)
