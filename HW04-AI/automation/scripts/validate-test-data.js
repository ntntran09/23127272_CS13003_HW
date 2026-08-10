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
  const cases = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const caseIds = new Set();
  const datasetIds = new Set();
  let totalDatasets = 0;
  let multiDatasetCases = 0;

  if (cases.length < 12) {
    console.error(`${fileName}: expected at least 12 test cases, found ${cases.length}`);
    invalid = true;
  }

  for (const row of cases) {
    for (const field of ['id', 'title', 'action', 'requirementIds', 'datasets']) {
      if (row[field] === undefined || row[field] === null || row[field] === '') {
        console.error(`${fileName}: ${row.id || '<unknown>'} is missing ${field}`);
        invalid = true;
      }
    }
    if (!row.id.startsWith(prefix) || caseIds.has(row.id)) {
      console.error(`${fileName}: invalid or duplicate case id ${row.id}`);
      invalid = true;
    }
    caseIds.add(row.id);

    if (!Array.isArray(row.requirementIds) || row.requirementIds.length === 0) {
      console.error(`${fileName}: ${row.id} must declare non-empty requirementIds`);
      invalid = true;
    }

    if (!Array.isArray(row.datasets) || row.datasets.length === 0) {
      console.error(`${fileName}: ${row.id} must declare at least one dataset`);
      invalid = true;
      continue;
    }
    if (row.datasets.length >= 2) multiDatasetCases += 1;

    for (const dataset of row.datasets) {
      for (const field of ['id', 'title', 'input', 'expected']) {
        if (dataset[field] === undefined || dataset[field] === null || dataset[field] === '') {
          console.error(`${fileName}: ${row.id} / ${dataset.id || '<unknown dataset>'} is missing ${field}`);
          invalid = true;
        }
      }
      if (!dataset.id.startsWith(prefix) || datasetIds.has(dataset.id)) {
        console.error(`${fileName}: invalid or duplicate dataset id ${dataset.id}`);
        invalid = true;
      }
      datasetIds.add(dataset.id);
      totalDatasets += 1;
    }
  }

  if (multiDatasetCases === 0) {
    console.error(`${fileName}: data-driven rule violated - every test case has exactly one dataset; at least one case must run multiple datasets`);
    invalid = true;
  }

  console.log(`${fileName}: ${cases.length} test cases, ${totalDatasets} datasets, ${multiDatasetCases} multi-dataset case(s)`);
}

if (invalid) process.exitCode = 1;
