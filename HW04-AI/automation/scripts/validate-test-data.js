const fs = require('node:fs');
const path = require('node:path');

const dataDir = path.resolve(__dirname, '..', 'data');
const testDir = path.resolve(__dirname, '..', 'tests');

// Dataset fields the spec dereferences for a given action. Without this list a
// missing field only surfaces as an undefined at run time, inside a browser run.
const expected = [
  {
    fileName: 'fr03-password-reset.json',
    specName: 'fr03-password-reset.spec.js',
    prefix: 'FR03',
    requiredByAction: {},
  },
  {
    fileName: 'fr11-order-history.json',
    specName: 'fr11-order-history.spec.js',
    prefix: 'FR11',
    requiredByAction: {
      'one-order': ['expectedTotal', 'expectedLabel'],
      formatting: ['expectedTotal'],
      ownership: ['foreignTotal'],
    },
  },
  {
    fileName: 'fr14-category-management.json',
    specName: 'fr14-category-management.spec.js',
    prefix: 'FR14',
    requiredByAction: {
      'delete-category': ['keepName'],
      'safe-rendering': ['forbiddenTag'],
    },
  },
];

let invalid = false;

function fail(message) {
  console.error(message);
  invalid = true;
}

function implementedActions(specPath) {
  const source = fs.readFileSync(specPath, 'utf8');
  return new Set(Array.from(source.matchAll(/case '([a-z0-9-]+)':/g), (match) => match[1]));
}

for (const { fileName, specName, prefix, requiredByAction } of expected) {
  const filePath = path.join(dataDir, fileName);
  const cases = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const handled = implementedActions(path.join(testDir, specName));
  const caseIds = new Set();
  const datasetIds = new Set();
  let totalDatasets = 0;
  let multiDatasetCases = 0;

  if (cases.length < 12) {
    fail(`${fileName}: expected at least 12 test cases, found ${cases.length}`);
  }

  for (const row of cases) {
    for (const field of ['id', 'title', 'action', 'requirementIds', 'datasets']) {
      if (row[field] === undefined || row[field] === null || row[field] === '') {
        fail(`${fileName}: ${row.id || '<unknown>'} is missing ${field}`);
      }
    }
    if (!row.id.startsWith(prefix) || caseIds.has(row.id)) {
      fail(`${fileName}: invalid or duplicate case id ${row.id}`);
    }
    caseIds.add(row.id);

    if (!handled.has(row.action)) {
      fail(`${fileName}: ${row.id} declares action "${row.action}" that ${specName} does not implement`);
    }

    if (!Array.isArray(row.requirementIds) || row.requirementIds.length === 0) {
      fail(`${fileName}: ${row.id} must declare non-empty requirementIds`);
    }

    if (!Array.isArray(row.datasets) || row.datasets.length === 0) {
      fail(`${fileName}: ${row.id} must declare at least one dataset`);
      continue;
    }
    if (row.datasets.length >= 2) multiDatasetCases += 1;

    for (const dataset of row.datasets) {
      for (const field of ['id', 'title', 'input', 'expected']) {
        if (dataset[field] === undefined || dataset[field] === null || dataset[field] === '') {
          fail(`${fileName}: ${row.id} / ${dataset.id || '<unknown dataset>'} is missing ${field}`);
        }
      }
      if (!dataset.id.startsWith(`${row.id}-`) || datasetIds.has(dataset.id)) {
        fail(`${fileName}: dataset ${dataset.id} must be unique and prefixed with its case id ${row.id}`);
      }
      datasetIds.add(dataset.id);

      for (const field of requiredByAction[row.action] || []) {
        if (dataset[field] === undefined || dataset[field] === null || dataset[field] === '') {
          fail(`${fileName}: ${dataset.id} (action ${row.action}) is missing ${field}`);
        }
      }

      if (dataset.expectedLength !== undefined && dataset.input.name.length !== dataset.expectedLength) {
        fail(`${fileName}: ${dataset.id} declares length ${dataset.expectedLength} but the value is ${dataset.input.name.length} characters`);
      }

      // FR-03 fixtures answer from an account registry. A case that expects an
      // OTP must name an email the registry actually knows, otherwise the test
      // would be asserting against a value the fixture never issued.
      const accounts = dataset.accounts || row.accounts;
      if (accounts && dataset.input.email && row.action !== 'unregistered-email') {
        if (!Object.prototype.hasOwnProperty.call(accounts, dataset.input.email)) {
          fail(`${fileName}: ${dataset.id} uses email ${dataset.input.email} that is absent from its account registry`);
        }
      }
      if (accounts && row.action === 'unregistered-email' && Object.prototype.hasOwnProperty.call(accounts, dataset.input.email)) {
        fail(`${fileName}: ${dataset.id} expects rejection but ${dataset.input.email} is registered in its account registry`);
      }

      totalDatasets += 1;
    }
  }

  if (multiDatasetCases === 0) {
    fail(`${fileName}: data-driven rule violated - every test case has exactly one dataset; at least one case must run multiple datasets`);
  }

  console.log(`${fileName}: ${cases.length} test cases, ${totalDatasets} datasets, ${multiDatasetCases} multi-dataset case(s)`);
}

if (invalid) process.exitCode = 1;
