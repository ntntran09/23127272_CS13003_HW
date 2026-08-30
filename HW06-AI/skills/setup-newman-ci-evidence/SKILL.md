---
name: setup-newman-ci-evidence
description: Configure and verify GitHub Actions evidence runs for Newman/Postman API suites, including a genuine all-passing run and an opt-in run with exactly one controlled failing assertion. Use when a repository needs reproducible CI run links, screenshots, and downloadable Newman artifacts without weakening the real test oracle.
---

# Setup Newman CI Evidence

Build an auditable GitHub Actions workflow around an existing reviewed Postman collection. Keep the normal collection unchanged and keep remote evidence claims separate from local preparation.

## Inspect First

1. Read the assignment or acceptance criteria, existing workflow, `package.json`, Postman collection/environment, SUT startup command, health endpoint, and current Newman report.
2. Record the homework repository commit, SUT repository and exact commit, Node/Newman versions, base URL, and required student header.
3. Determine whether the reviewed collection currently exits zero. If genuine SUT defects remain, state that a green contract run needs a corrected SUT commit. Never change expected results to match buggy behavior.

## Workflow Contract

Create one manually dispatchable workflow with typed inputs for:

- `evidence_mode`: `passing` or `deliberate-failure`;
- `sut_repository`;
- exact `sut_ref`.

The workflow must:

1. use read-only repository permissions;
2. install pinned dependencies with `npm ci`;
3. run generator/unit checks and catalog validation before API execution;
4. check out, seed, start, and health-check the selected SUT commit;
5. override CI-only base URL and student ID on the Newman command line rather than modifying the local environment;
6. run the complete reviewed collection first and require exit code zero for both evidence modes;
7. in `deliberate-failure` mode only, run a separate one-item collection with one intentionally false assertion;
8. validate the deliberate Newman JSON with `scripts/verify_newman_failure_count.py`, then deliberately return a nonzero job result;
9. upload JSON, HTML, and backend logs with `if: always()`.

The controlled collection must be clearly labeled evidence-only. Do not insert its false assertion into the reviewed test suite.

## Verification

Run locally before requesting a public run:

```powershell
npm --prefix HW06-AI/automation ci
npm --prefix HW06-AI/automation run test:skill
npm --prefix HW06-AI/automation run test:ci-skill
npm --prefix HW06-AI/automation run validate:skill
python (Join-Path $env:CODEX_HOME 'skills/.system/skill-creator/scripts/quick_validate.py') HW06-AI/skills/setup-newman-ci-evidence
```

Syntax-check the workflow with an Actions-aware validator when available. A local check does not prove that GitHub accepted or executed the workflow.

## Public Evidence Gate

Read [references/evidence-runbook.md](references/evidence-runbook.md) before creating remote runs. Require explicit authorization before committing, pushing, dispatching a workflow, or publishing screenshots. Do not mark evidence complete until real commit links, run URLs, screenshots, inputs, and artifacts have been recorded.
