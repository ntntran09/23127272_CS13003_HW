const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

function readArg(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

function parseFeatures(value) {
  return value.split(',').map((item) => {
    const separator = item.indexOf('=');
    if (separator < 1) throw new Error(`Invalid feature mapping: ${item}`);
    return { id: item.slice(0, separator), spec: item.slice(separator + 1) };
  });
}

const root = path.resolve(readArg('root') || '.');
const studentId = readArg('student-id');
const browsers = (readArg('browsers') || '').split(',').filter(Boolean);
const features = parseFeatures(readArg('features') || '');

if (!studentId || browsers.length < 3 || features.length === 0) {
  console.error('Required: --student-id, at least three --browsers, and --features id=spec,...');
  process.exit(2);
}

const playwrightCli = require.resolve('@playwright/test/cli', { paths: [root] });
let failedRuns = 0;

for (const feature of features) {
  for (const browser of browsers) {
    const timestamp = new Date().toISOString();
    const reportDir = path.join(root, 'reports', feature.id, browser);
    const outputDir = path.join(root, 'test-results', feature.id, browser);
    fs.mkdirSync(reportDir, { recursive: true });

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

    if (result.error || result.status !== 0) failedRuns += 1;
  }
}

console.log(`Matrix complete: ${features.length * browsers.length} runs; ${failedRuns} non-passing run(s).`);
process.exitCode = failedRuns > 0 ? 1 : 0;
