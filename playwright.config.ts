/**
 * Playwright Configuration for AEMFlow Visual Regression Testing
 *
 * This configuration sets up visual regression testing for the AEMFlow
 * workflow builder application. It captures screenshots of critical UI
 * components and compares them against baseline images to detect
 * unintended visual changes.
 *
 * @see https://playwright.dev/docs/test-configuration
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Directory containing test files
  testDir: './tests/e2e',

  // Directory for test artifacts (screenshots, videos, traces)
  outputDir: './tests/e2e/test-results',

  // Run tests in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry failed tests on CI
  retries: process.env.CI ? 2 : 0,

  // Number of parallel workers
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: './tests/e2e/playwright-report' }],
    ['list'],
  ],

  // Shared settings for all projects
  use: {
    // Base URL for navigation
    baseURL: 'http://localhost:5173',

    // Capture screenshot on failure
    screenshot: 'only-on-failure',

    // Record video on failure
    video: 'retain-on-failure',

    // Capture trace on first retry
    trace: 'on-first-retry',

    // Viewport size
    viewport: { width: 1920, height: 1080 },
  },

  // Visual comparison settings
  expect: {
    // Snapshot directory for visual regression tests
    toHaveScreenshot: {
      // Maximum allowed pixel difference
      maxDiffPixels: 100,
      // Maximum allowed difference ratio
      maxDiffPixelRatio: 0.01,
      // Animation tolerance
      animations: 'disabled',
      // Screenshot comparison threshold
      threshold: 0.2,
    },
    toMatchSnapshot: {
      maxDiffPixels: 100,
      maxDiffPixelRatio: 0.01,
    },
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile viewports for responsive testing
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Web server configuration - start dev server before running tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
