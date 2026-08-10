const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const playwrightCli = require.resolve('@playwright/test/cli');
const studentId = process.env.STUDENT_ID || '23127272';
const browsers = (process.env.BROWSERS || 'chromium,firefox,webkit,chrome,edge').split(',');
const features = [
  { id: 'fr03', spec: 'tests/fr03-password-reset.spec.js' },
  { id: 'fr11', spec: 'tests/fr11-order-history.spec.js' },
  { id: 'fr14', spec: 'tests/fr14-category-management.spec.js' },
];

let failedRuns = 0;

for (const feature of features) {
  for (const browser of browsers) {
    const timestamp = new Date().toISOString();
    const reportDir = path.join(root, 'reports', feature.id, browser);
    const outputDir = path.join(root, 'test-results', feature.id, browser);
    fs.mkdirSync(reportDir, { recursive: true });

    process.stdout.write(`\nRunning ${feature.id} on ${browser}\n`);
    const result = spawnSync(
      process.execPath,
      [playwrightCli, 'test', feature.spec, `--project=${browser}`],
      {
        cwd: root,
        stdio: 'inherit',
        env: {
          ...process.env,
          STUDENT_ID: studentId,
          RUN_TIMESTAMP: timestamp,
          FEATURE: feature.id,
          BROWSER: browser,
          PLAYWRIGHT_HTML_OUTPUT_DIR: reportDir,
          PLAYWRIGHT_OUTPUT_DIR: outputDir,
        },
      },
    );

    if (result.error) {
      console.error(`Could not start ${feature.id}/${browser}: ${result.error.message}`);
      failedRuns += 1;
    } else if (result.status !== 0) {
      failedRuns += 1;
    }
  }
}

process.stdout.write(`\nBrowser matrix complete: ${features.length * browsers.length} runs, ${failedRuns} run(s) with failing tests.\n`);
process.exitCode = failedRuns > 0 ? 1 : 0;
