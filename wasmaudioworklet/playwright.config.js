import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 600000,
  // Retry on CI — broadcast-signal and a couple of the wasm-git specs are
  // timing-sensitive and occasionally flake on slower runners. Locally,
  // failures should still surface immediately.
  retries: process.env.CI ? 2 : 0,
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
