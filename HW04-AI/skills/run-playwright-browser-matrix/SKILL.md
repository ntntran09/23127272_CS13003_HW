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
- Cover more than one rendering engine. Chromium, Chrome, and Edge are three executables sharing one renderer, so a matrix built only from them satisfies a browser count while evidencing nothing about cross-browser behaviour. The runner refuses a single-engine matrix unless `--allow-single-engine` is passed, and that limitation then belongs in the report.
- Smoke one feature on each newly added engine before committing to the full matrix, so an engine-specific breakage is not discovered after a long run.
- Confirm the Playwright config reads `STUDENT_ID`, `RUN_TIMESTAMP`, `FEATURE`, `BROWSER`, `PLAYWRIGHT_HTML_OUTPUT_DIR`, and `PLAYWRIGHT_OUTPUT_DIR`.
- Configure the HTML reporter title to visibly include runner identity and ISO timestamp.

See [references/report-contract.md](references/report-contract.md) for the required report contract.

## Execute

Use the bundled runner from the Playwright project root:

```text
node <skill-path>/scripts/run-matrix.js \
  --root . \
  --student-id RUNNER_ID \
  --browsers chromium,firefox,webkit \
  --features login=tests/login.spec.js,cart=tests/cart.spec.js
```

The runner deliberately continues after failing tests so every feature-browser report is produced. It separates two outcomes that look alike from an exit code: a run whose tests failed, and a run that never produced a report. The second is an orchestration failure, and it must be fixed before any result is read as a product defect.

## Verify

Never verify from directory names — a copied or relabelled directory passes that check. Decode the report each HTML file embeds and read its own metadata:

```text
node <skill-path>/scripts/verify-reports.js \
  --root . \
  --runner-id RUNNER_ID \
  --browsers chromium,firefox,webkit \
  --features login,cart \
  --summary reports/run-summary.json
```

The verifier is dependency-free Node, so it runs on any platform, and it exits nonzero when any of these fails:

- `metadata["Run by"]` equals the requested runner ID;
- `metadata["Run timestamp"]` parses as an ISO timestamp;
- feature and browser metadata match the report path;
- the visible report title begins with `Run by: <runner-id>`;
- totals equal passed + failed + flaky + skipped;
- the report contains at least one test, since a zero-test report is an orchestration failure that otherwise reads as a clean pass;
- every expected combination exists.

## Review

Classify failures from traces/screenshots. Never rerun only passing subsets for final evidence. If a browser runtime is unavailable, report the missing run instead of copying or relabeling another browser's output.

Return the matrix command, browser list, report paths, execution totals, failed-run count, and any environment limitations. Never embed assignment names or a fixed student identifier in this skill.
