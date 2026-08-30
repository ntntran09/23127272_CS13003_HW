# Prompt 03 — Execute the suite deterministically and verify results

| Field | Value |
| --- | --- |
| Tool | Codex |
| Date | 2026-08-18 |
| Stage | Execute (deterministic run) |
| Source | ../AI docs/evidence/current-selection-session/codex-interaction-log.md#interaction-3 |

## Prompt

```text
Automate and execute the selected cases with Postman/Newman against the pinned SUT
commit, and report only verified results. Every request must carry the
X-Student-Id header. If the run is not clean, do not report the failures as SUT
bugs until the harness itself is proven correct.
```

## AI output (summary)

The first attempt was rejected as invalid: the build command ran from the wrong
working directory and used a stale collection, and the SUT process already
listening on port 3000 could not be reset because of Windows file locks. That
evidence was discarded rather than reported. A clean SUT instance was started from
the same pinned source commit on `127.0.0.1:3001`, and the full reviewed suite was
re-run deterministically with the `X-Student-Id: 23127272` pre-request header.

Verified result: 120 designed, 119 executed, 46 passed, 73 failed, 1 manual; 212
requests and 457 assertions; **zero** request, pre-request, or test-script
failures. Failures are retained as contract-deviation evidence, and nine
reproducible bug groups were triaged.

Evidence: `automation/run-sut-3001.js`, `reports/newman-cli.txt`,
`reports/newman-report.json`, `reports/newman-report.html`, `reports/test-summary.json`.
