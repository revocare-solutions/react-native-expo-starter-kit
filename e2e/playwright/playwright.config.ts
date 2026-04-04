import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.ts',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:8090',
    headless: true,
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
  webServer: {
    command: 'cd apps/client && npx expo start --web --port 8090',
    url: 'http://localhost:8090',
    reuseExistingServer: true,
    timeout: 60000,
  },
});
