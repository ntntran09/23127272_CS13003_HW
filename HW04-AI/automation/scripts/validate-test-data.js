const fs = require('node:fs');
const path = require('node:path');

const dataDir = path.resolve(__dirname, '..', 'data');
const expected = [
  ['fr03-password-reset.json', 'FR03'],
  ['fr11-order-history.json', 'FR11'],
  ['fr14-category-management.json', 'FR14'],
];

let invalid = false;

for (const [fileName, prefix] of expected) {
  const filePath = path.join(dataDir, fileName);
  const rows = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const ids = new Set();

  if (rows.length < 12) {
    console.error(`${fileName}: expected at least 12 rows, found ${rows.length}`);
    invalid = true;
  }

  for (const row of rows) {
    for (const field of ['id', 'title', 'action', 'expected', 'requirementIds']) {
      if (row[field] === undefined || row[field] === null || row[field] === '') {
        console.error(`${fileName}: ${row.id || '<unknown>'} is missing ${field}`);
        invalid = true;
      }
    }
    if (!row.id.startsWith(prefix) || ids.has(row.id)) {
      console.error(`${fileName}: invalid or duplicate id ${row.id}`);
      invalid = true;
    }
    ids.add(row.id);
  }

  console.log(`${fileName}: ${rows.length} valid data rows`);
}

if (invalid) process.exitCode = 1;
