# Prompt 05 — CI/CD pipeline and reusable evidence skill

| Field | Value |
| --- | --- |
| Tool | Codex |
| Date | 2026-08-29 |
| Stage | CI/CD pipeline + reusable skill |
| Source | ../AI docs/evidence/current-selection-session/codex-interaction-log.md#interaction-5 |

## Prompt

```text
Set up the CI/CD pipeline that runs Newman in GitHub Actions against my own fork
of the SUT, and package it as a reusable skill. It must support two runs — one
where all API tests pass and one where exactly one test fails — and it must never
touch the upstream repository, only my fork.
```

## AI output (summary)

Added `.github/workflows/hw06-api.yml`, a manual workflow with `passing` and
`deliberate-failure` modes that targets the student's fork, installs the pinned
Newman toolchain, validates the generator and catalog, seeds and waits for the
SUT, runs the full reviewed collection, and uploads Newman JSON/HTML plus the
backend log on both success and failure. The `deliberate-failure` mode runs a
separate one-item evidence collection only after the real suite passes and a
deterministic verifier confirms exactly one controlled assertion failure. Packaged
the process as the reusable `setup-newman-ci-evidence` skill.

Validated locally: `actionlint` passed, generator tests 3/3, catalog validation
passed, CI verifier tests 4/4. Remote run URLs and screenshots remain student
actions.

Evidence: `.github/workflows/hw06-api.yml`, `skills/setup-newman-ci-evidence/`,
`ci/deliberate-failure.postman_collection.json`, `ci-cd-report.md`.
