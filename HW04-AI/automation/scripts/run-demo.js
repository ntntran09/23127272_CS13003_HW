// Demo runner for the recorded video.
//
// This exists so a live demo can never touch the graded evidence. The browser
// matrix writes the submitted HTML reports into `reports/`, and those are
// committed; anything recorded on camera goes to `demo-run/` instead, which is
// gitignored. Same config, same "Run by" metadata, separate output tree.
//
//   node scripts/run-demo.js                          # fr14 on chromium,chrome,edge
//   node scripts/run-demo.js --feature fr11
//   node scripts/run-demo.js --feature fr03 --browsers chromium,firefox,webkit

const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const playwrightCli = require.resolve('@playwright/test/cli');

const specs = {
  fr03: 'tests/fr03-password-reset.spec.js',
  fr11: 'tests/fr11-order-history.spec.js',
  fr14: 'tests/fr14-category-management.spec.js',
};

function readFlag(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? fallback : process.argv[index + 1];
}

const feature = readFlag('feature', 'fr14');
const browsers = readFlag('browsers', 'chromium,chrome,edge').split(',').filter(Boolean);
const studentId = process.env.STUDENT_ID || '23127272';

if (!specs[feature]) {
  console.error(`Unknown feature "${feature}". Expected one of: ${Object.keys(specs).join(', ')}`);
  process.exit(2);
}

const demoRoot = path.join(root, 'demo-run');
let failedRuns = 0;

for (const browser of browsers) {
  const timestamp = new Date().toISOString();
  const reportDir = path.join(demoRoot, 'reports', feature, browser);
  const outputDir = path.join(demoRoot, 'test-results', feature, browser);
  fs.mkdirSync(reportDir, { recursive: true });

  process.stdout.write(`\nDemo run: ${feature} on ${browser}\n`);
  const result = spawnSync(
    process.execPath,
    [playwrightCli, 'test', specs[feature], `--project=${browser}`],
    {
      cwd: root,
      stdio: 'inherit',
      env: {
        ...process.env,
        STUDENT_ID: studentId,
        RUN_TIMESTAMP: timestamp,
        FEATURE: feature,
        BROWSER: browser,
        PLAYWRIGHT_HTML_OUTPUT_DIR: reportDir,
        PLAYWRIGHT_OUTPUT_DIR: outputDir,
      },
    },
  );

  if (result.error) {
    console.error(`Could not start ${feature}/${browser}: ${result.error.message}`);
    failedRuns += 1;
  } else if (result.status !== 0) {
    failedRuns += 1;
  }
}

process.stdout.write(`\nDemo complete: ${browsers.length} run(s), ${failedRuns} with failing tests.\n`);
process.stdout.write(`Reports: demo-run\\reports\\${feature}\\<browser>\\index.html\n`);
process.stdout.write('Open one with: npx playwright show-report demo-run\\reports\\' + feature + '\\chromium\n');
process.stdout.write('Nothing under reports\\ was modified.\n');

// A demo is expected to show failing requirement checks, so a nonzero Playwright
// status is not a runner error here. Only a launch failure is.
process.exitCode = 0;
