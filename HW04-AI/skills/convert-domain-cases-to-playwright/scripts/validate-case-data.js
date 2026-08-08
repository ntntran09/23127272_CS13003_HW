const fs = require('node:fs');
const path = require('node:path');

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error('Usage: node validate-case-data.js <data-file.json> [more-data-files.json]');
  process.exit(2);
}

let failed = false;
for (const input of files) {
  const filePath = path.resolve(input);
  let rows;
  try {
    rows = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.error(`${filePath}: ${error.message}`);
    failed = true;
    continue;
  }

  if (!Array.isArray(rows)) {
    console.error(`${filePath}: root value must be an array`);
    failed = true;
    continue;
  }

  const ids = new Set();
  rows.forEach((row, index) => {
    const location = `${filePath}[${index}]`;
    for (const field of ['id', 'title', 'action', 'input', 'expected', 'requirementIds']) {
      if (!(field in row)) {
        console.error(`${location}: missing ${field}`);
        failed = true;
      }
    }
    if (typeof row.id !== 'string' || row.id.trim() === '' || ids.has(row.id)) {
      console.error(`${location}: id must be non-empty and unique`);
      failed = true;
    }
    ids.add(row.id);
    if (!Array.isArray(row.requirementIds) || row.requirementIds.length === 0) {
      console.error(`${location}: requirementIds must be a non-empty array`);
      failed = true;
    }
  });

  console.log(`${filePath}: ${rows.length} case row(s)`);
}

if (failed) process.exitCode = 1;
