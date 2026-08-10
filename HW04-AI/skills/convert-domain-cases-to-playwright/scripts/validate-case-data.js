const fs = require('node:fs');
const path = require('node:path');

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error('Usage: node validate-case-data.js <data-file.json> [more-data-files.json]');
  process.exit(2);
}

let failed = false;

function fail(message) {
  console.error(message);
  failed = true;
}

for (const input of files) {
  const filePath = path.resolve(input);
  let rows;
  try {
    rows = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    fail(`${filePath}: ${error.message}`);
    continue;
  }

  if (!Array.isArray(rows)) {
    fail(`${filePath}: root value must be an array`);
    continue;
  }

  const caseIds = new Set();
  const datasetIds = new Set();
  const sourceCases = new Set();
  let totalDatasets = 0;
  let multiDatasetCases = 0;

  rows.forEach((row, index) => {
    const location = `${filePath}[${index}]`;
    for (const field of ['id', 'title', 'action', 'requirementIds', 'sourceCases', 'datasets']) {
      if (!(field in row)) fail(`${location}: missing ${field}`);
    }

    if (typeof row.id !== 'string' || row.id.trim() === '' || caseIds.has(row.id)) {
      fail(`${location}: id must be non-empty and unique`);
    }
    caseIds.add(row.id);

    if (typeof row.action !== 'string' || row.action.trim() === '') {
      fail(`${location}: action must be a non-empty dispatch key`);
    }

    if (!Array.isArray(row.requirementIds) || row.requirementIds.length === 0) {
      fail(`${row.id || location}: requirementIds must be a non-empty array`);
    }

    // Traceability to the original cases is what makes coverage measurable
    // instead of asserted, so it is required rather than optional.
    if (!Array.isArray(row.sourceCases) || row.sourceCases.length === 0) {
      fail(`${row.id || location}: sourceCases must name at least one original case ID`);
    } else {
      row.sourceCases.forEach((id) => sourceCases.add(id));
    }

    if (!Array.isArray(row.datasets) || row.datasets.length === 0) {
      fail(`${row.id || location}: datasets must be a non-empty array`);
      return;
    }
    if (row.datasets.length >= 2) multiDatasetCases += 1;

    row.datasets.forEach((dataset, datasetIndex) => {
      const where = `${row.id || location} / dataset[${datasetIndex}]`;
      for (const field of ['id', 'title', 'input', 'expected']) {
        if (dataset[field] === undefined || dataset[field] === null || dataset[field] === '') {
          fail(`${where}: missing ${field}`);
        }
      }
      if (typeof dataset.id === 'string') {
        if (datasetIds.has(dataset.id)) fail(`${where}: duplicate dataset id ${dataset.id}`);
        if (typeof row.id === 'string' && !dataset.id.startsWith(`${row.id}-`)) {
          fail(`${where}: dataset id ${dataset.id} must be prefixed with its case id ${row.id}`);
        }
        datasetIds.add(dataset.id);
      }
      totalDatasets += 1;
    });
  });

  if (rows.length > 0 && multiDatasetCases === 0) {
    fail(`${filePath}: every case has exactly one dataset; at least one case must run multiple datasets`);
  }

  console.log(
    `${filePath}: ${rows.length} case(s), ${totalDatasets} dataset(s), `
    + `${multiDatasetCases} multi-dataset case(s), ${sourceCases.size} original case(s) covered`,
  );
}

if (failed) process.exitCode = 1;
