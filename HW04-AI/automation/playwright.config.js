const { defineConfig, devices } = require('@playwright/test');

const studentId = process.env.STUDENT_ID || '23127272';
const runTimestamp = process.env.RUN_TIMESTAMP || new Date().toISOString();
const feature = process.env.FEATURE || 'all-features';
const browser = process.env.BROWSER || 'browser-matrix';
const reportDir = process.env.PLAYWRIGHT_HTML_OUTPUT_DIR || 'playwright-report';

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  timeout: 30_000,
  expect: { timeout: 3_000 },
  outputDir: process.env.PLAYWRIGHT_OUTPUT_DIR || 'test-results',
  metadata: {
    'Run by': studentId,
    'Run timestamp': runTimestamp,
    Feature: feature,
    Browser: browser,
  },
  reporter: [
    ['list'],
    ['html', {
      outputFolder: reportDir,
      open: 'never',
      title: `Run by: ${studentId} | ${runTimestamp} | ${feature} | ${browser}`,
    }],
  ],
  use: {
    baseURL: process.env.ESHOP_WEB_URL || 'http://127.0.0.1:5173',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    locale: 'vi-VN',
    timezoneId: 'Asia/Bangkok',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
    { name: 'edge', use: { ...devices['Desktop Edge'], channel: 'msedge' } },
  ],
});
