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

// Counting browsers is not the same as covering engines: Chromium, Chrome, and
// Edge are three executables sharing one renderer, so a matrix built from them
// evidences nothing about cross-browser behaviour.
const ENGINE_BY_PROJECT = {
  chromium: 'Chromium',
  chrome: 'Chromium',
  'chrome-beta': 'Chromium',
  msedge: 'Chromium',
  edge: 'Chromium',
  'msedge-beta': 'Chromium',
  firefox: 'Gecko',
  webkit: 'WebKit',
  safari: 'WebKit',
};

function engineOf(project) {
  const key = project.toLowerCase();
  return ENGINE_BY_PROJECT[key]
    || Object.entries(ENGINE_BY_PROJECT).find(([name]) => key.includes(name))?.[1]
    || 'unknown';
}

const root = path.resolve(readArg('root') || '.');
const studentId = readArg('student-id');
const browsers = (readArg('browsers') || '').split(',').filter(Boolean);
const features = parseFeatures(readArg('features') || '');
const allowSingleEngine = process.argv.includes('--allow-single-engine');

if (!studentId || browsers.length < 3 || features.length === 0) {
  console.error('Required: --student-id, at least three --browsers, and --features id=spec,...');
  process.exit(2);
}

const engines = [...new Set(browsers.map(engineOf))];
if (engines.length === 1 && !allowSingleEngine) {
  console.error(
    `All requested projects (${browsers.join(', ')}) use the ${engines[0]} engine. `
    + 'A single-engine matrix cannot evidence cross-browser behaviour; add a Firefox or WebKit '
    + 'project, or pass --allow-single-engine and state the limitation in the report.',
  );
  process.exit(2);
}
console.log(`Engines covered: ${engines.join(', ')} (${browsers.length} project(s))`);

const playwrightCli = require.resolve('@playwright/test/cli', { paths: [root] });
let failedRuns = 0;
let brokenRuns = 0;

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

    // Distinguish "tests failed" from "the run never happened". A spawn that
    // dies instantly returns a nonzero status too, and summarising both as
    // "failed run" is how a broken matrix gets reported as a red test suite.
    const reportWritten = fs.existsSync(path.join(reportDir, 'index.html'));
    if (result.error) {
      console.error(`${feature.id}/${browser}: could not start Playwright: ${result.error.message}`);
      brokenRuns += 1;
    } else if (!reportWritten) {
      console.error(`${feature.id}/${browser}: exited ${result.status} without writing a report; treat as an orchestration failure, not a test result`);
      brokenRuns += 1;
    } else if (result.status !== 0) {
      failedRuns += 1;
    }
  }
}

const planned = features.length * browsers.length;
console.log(`Matrix complete: ${planned} run(s) planned; ${failedRuns} with failing tests; ${brokenRuns} that did not produce a report.`);
if (brokenRuns > 0) {
  console.error('At least one run produced no evidence. Fix the orchestration before reading any result as a product defect.');
}
process.exitCode = brokenRuns > 0 || failedRuns > 0 ? 1 : 0;
