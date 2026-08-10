// Verify the report contract without trusting directory names: decode the
// report each HTML file actually embeds and read its own metadata.
// Dependency-free so the skill runs anywhere Node runs, not just on Windows.
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

function readArg(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

// Minimal ZIP reader: locate the central directory, then inflate one entry.
// The Playwright HTML report embeds its report.json in a base64 zip.
function readZipEntry(buffer, wanted) {
  const EOCD_SIGNATURE = 0x06054b50;
  let eocd = -1;
  for (let i = buffer.length - 22; i >= 0 && i > buffer.length - 22 - 65536; i -= 1) {
    if (buffer.readUInt32LE(i) === EOCD_SIGNATURE) { eocd = i; break; }
  }
  if (eocd === -1) throw new Error('zip end-of-central-directory not found');

  const entryCount = buffer.readUInt16LE(eocd + 10);
  let offset = buffer.readUInt32LE(eocd + 16);

  for (let i = 0; i < entryCount; i += 1) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) throw new Error('bad central directory entry');
    const method = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localOffset = buffer.readUInt32LE(offset + 42);
    const name = buffer.toString('utf8', offset + 46, offset + 46 + nameLength);

    if (name === wanted) {
      const localNameLength = buffer.readUInt16LE(localOffset + 26);
      const localExtraLength = buffer.readUInt16LE(localOffset + 28);
      const start = localOffset + 30 + localNameLength + localExtraLength;
      const raw = buffer.subarray(start, start + compressedSize);
      return method === 0 ? raw : zlib.inflateRawSync(raw);
    }
    offset += 46 + nameLength + extraLength + commentLength;
  }
  throw new Error(`zip entry not found: ${wanted}`);
}

function loadReport(indexHtmlPath) {
  const html = fs.readFileSync(indexHtmlPath, 'utf8');
  const match = html.match(/<template id="playwrightReportBase64">data:application\/zip;base64,(.*?)<\/template>/s);
  if (!match) throw new Error('no embedded Playwright report found');
  return JSON.parse(readZipEntry(Buffer.from(match[1], 'base64'), 'report.json').toString('utf8'));
}

const root = path.resolve(readArg('root') || '.');
const runnerId = readArg('runner-id');
const browsers = (readArg('browsers') || '').split(',').filter(Boolean);
const features = (readArg('features') || '').split(',').filter(Boolean);
const summaryPath = readArg('summary');

if (!runnerId || browsers.length === 0 || features.length === 0) {
  console.error('Required: --runner-id, --browsers a,b,c, --features id1,id2 [--root .] [--summary out.json]');
  process.exit(2);
}

const problems = [];
const summary = [];

for (const feature of features) {
  for (const browser of browsers) {
    const where = `${feature}/${browser}`;
    const indexHtml = path.join(root, 'reports', feature, browser, 'index.html');

    if (!fs.existsSync(indexHtml)) {
      problems.push(`${where}: missing report at ${indexHtml}`);
      continue;
    }

    let report;
    try {
      report = loadReport(indexHtml);
    } catch (error) {
      problems.push(`${where}: ${error.message}`);
      continue;
    }

    const metadata = report.metadata || {};
    const title = (report.options && report.options.title) || '';
    const stats = report.stats || {};

    if (metadata['Run by'] !== runnerId) {
      problems.push(`${where}: metadata "Run by" is ${JSON.stringify(metadata['Run by'])}, expected ${runnerId}`);
    }
    if (!metadata['Run timestamp'] || Number.isNaN(Date.parse(metadata['Run timestamp']))) {
      problems.push(`${where}: metadata "Run timestamp" is not an ISO timestamp`);
    }
    if (metadata.Feature !== feature || metadata.Browser !== browser) {
      problems.push(`${where}: metadata says ${metadata.Feature}/${metadata.Browser}; the path claims ${where}`);
    }
    if (!title.startsWith(`Run by: ${runnerId}`)) {
      problems.push(`${where}: visible title does not start with "Run by: ${runnerId}"`);
    }

    const total = stats.total || 0;
    const parts = (stats.expected || 0) + (stats.unexpected || 0) + (stats.flaky || 0) + (stats.skipped || 0);
    if (total !== parts) {
      problems.push(`${where}: total ${total} does not equal passed+failed+flaky+skipped (${parts})`);
    }
    // A run that produced a report but executed nothing is an orchestration
    // failure that otherwise looks like a clean pass.
    if (total === 0) {
      problems.push(`${where}: report contains zero tests; the run did not execute`);
    }

    summary.push({
      feature,
      browser,
      timestamp: metadata['Run timestamp'],
      total,
      passed: stats.expected || 0,
      failed: stats.unexpected || 0,
      flaky: stats.flaky || 0,
      skipped: stats.skipped || 0,
      title,
    });
  }
}

const totals = summary.reduce((acc, row) => ({
  total: acc.total + row.total,
  passed: acc.passed + row.passed,
  failed: acc.failed + row.failed,
  flaky: acc.flaky + row.flaky,
  skipped: acc.skipped + row.skipped,
}), { total: 0, passed: 0, failed: 0, flaky: 0, skipped: 0 });

if (summaryPath) {
  fs.mkdirSync(path.dirname(path.resolve(root, summaryPath)), { recursive: true });
  fs.writeFileSync(path.resolve(root, summaryPath), `${JSON.stringify(summary, null, 2)}\n`);
}

console.log(`Verified ${summary.length}/${features.length * browsers.length} reports for Run by: ${runnerId}`);
console.log(`Executed: ${totals.total}; Passed: ${totals.passed}; Failed: ${totals.failed}; Flaky: ${totals.flaky}; Skipped: ${totals.skipped}`);
if (summaryPath) console.log(`Summary: ${path.resolve(root, summaryPath)}`);

if (problems.length) {
  console.error(`\n${problems.length} contract violation(s):`);
  problems.forEach((problem) => console.error(`  - ${problem}`));
  process.exitCode = 1;
}
