import { defineConfig, devices } from '@playwright/test'

const PORT = 4322
const BASE_URL = `http://localhost:${PORT}`
const CI = !!process.env.CI

export default defineConfig({
  testDir: 'tests/e2e',
  forbidOnly: CI,
  retries: CI ? 2 : 0,
  reporter: CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: BASE_URL,
    launchOptions: { args: ['--enable-unsafe-swiftshader'] },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: `bun run build && bun run astro preview --port ${PORT} --ignore-lock`,
    url: BASE_URL,
  },
  projects: [
    {
      name: 'desktop',
      use: devices['Desktop Chrome'],
      testIgnore: /phone/,
    },
    {
      name: 'phone',
      use: devices['Pixel 7'],
      testMatch: /phone/,
    },
  ],
})
