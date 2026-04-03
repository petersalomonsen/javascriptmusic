import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 600000,
  use: {
    baseURL: 'http://localhost:8080',
    video: 'on',
    permissions: ['midi'],
    launchOptions: {
      args: ['--autoplay-policy=no-user-gesture-required']
    }
  },
  webServer: {
    command: 'node devserver.js',
    port: 8080,
    reuseExistingServer: true
  }
});
