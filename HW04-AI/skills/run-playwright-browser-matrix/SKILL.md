---
name: run-playwright-browser-matrix
description: Execute selected Playwright feature specs as separate runs across three or more browser projects, create isolated HTML reports, attach runner identity and ISO timestamps, and verify report metadata and execution totals. Use when grading, audit, or release evidence requires one report per feature-browser combination rather than a single combined report.
---

# Run Playwright Browser Matrix

Produce attributable, non-overwriting execution evidence. Do not fabricate reports or edit generated results.

## Preconditions

- Confirm the SUT URLs respond.
- Run `npx playwright test --list` and verify the expected test count.
- Confirm every requested browser project launches before starting the full matrix.
- Confirm the Playwright config reads `STUDENT_ID`, `RUN_TIMESTAMP`, `FEATURE`, `BROWSER`, `PLAYWRIGHT_HTML_OUTPUT_DIR`, and `PLAYWRIGHT_OUTPUT_DIR`.
- Configure the HTML reporter title to visibly include runner identity and ISO timestamp.

See [references/report-contract.md](references/report-contract.md) for the required report contract.

## Execute

Use the bundled runner from the Playwright project root:

```text
node <skill-path>/scripts/run-matrix.js \
  --root . \
  --student-id RUNNER_ID \
  --browsers chromium,chrome,edge \
  --features login=tests/login.spec.js,cart=tests/cart.spec.js
```

The runner deliberately continues after failing tests so every feature-browser report is produced. Its final nonzero exit code means at least one run contains a failed test or could not start; it does not imply the report generation failed.

## Verify

Inspect every expected `reports/<feature>/<browser>/index.html`. Decode the embedded Playwright `report.json` and verify:

- `metadata["Run by"]` equals the requested runner ID;
- `metadata["Run timestamp"]` parses as an ISO timestamp;
- feature and browser metadata match the report path;
- the visible report title begins with `Run by: <runner-id> |`;
- totals equal passed + failed + flaky + skipped;
- every expected combination exists exactly once.

## Review

Classify failures from traces/screenshots. Never rerun only passing subsets for final evidence. If a browser runtime is unavailable, report the missing run instead of copying or relabeling another browser's output.

Return the matrix command, browser list, report paths, execution totals, failed-run count, and any environment limitations. Never embed assignment names or a fixed student identifier in this skill.
