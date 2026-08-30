# HW06 CI/CD Report

## Pipeline

Workflow: `.github/workflows/hw06-api.yml` (GitHub Actions, manual `workflow_dispatch`).

The job checks out this homework repository, installs the pinned Newman
toolchain, validates the generator and reviewed catalog, then checks out the
EShop SUT at an exact commit (default: the student's fork `ntntran09/eshop-sut`
at the pinned commit `85af3ba875c88283615e22cb108f13e2fccaf0e9`), seeds and
starts the backend, waits for a health check on `GET /api/products`, and runs a
CI Postman suite with Newman. Newman JSON/HTML and the backend log are uploaded
as artifacts on both success and failure.

The workflow input `evidence_mode` selects which suite runs:

| Mode | Suite | Expected result |
| --- | --- | --- |
| `green` | `ci/ci-suite-green.postman_collection.json` — 12 reviewed cases that pass on the SUT | All assertions pass → job **green** |
| `red` | `ci/ci-suite-red.postman_collection.json` — the same 12 cases **plus one real reviewed case** `C-AI-002` (missing-JWT product creation) that fails on the SUT | Exactly one test case fails → job **red** |

Both suites are built from the reviewed catalog by `tools/build_ci_suites.py`;
every case is a genuine reviewed case with the specification as its oracle. The
red run's single failure is **not** a fabricated assertion — `C-AI-002` expects
`401` for an unauthenticated `POST /api/products` but the SUT returns `200`,
which is the real defect BUG-08. Every request carries `X-Student-Id: 23127272`
via the collection pre-request script.

Local verification (30/08/2026, `127.0.0.1:3001`, pinned SUT commit): the green
suite ran 41 assertions with 0 failures; the red suite ran 44 assertions with
the single failing case `C-AI-002` (2 assertions on that one case). Generator
unit tests 3/3 and catalog validation both pass.

## Green sample run (all API test cases passing)

| Field | Value |
| --- | --- |
| Commit SHA | (this repository's `main` at submission) |
| Workflow run URL | TBD_GREEN_URL |
| Result | Green — all cases pass |
| Screenshot | `reports/screenshots/ci/ci-green.png` — student capture |

## Red sample run (one test case failing)

| Field | Value |
| --- | --- |
| Commit SHA | (this repository's `main` at submission) |
| Failing case | `C-AI-002` — `POST /api/products` without a JWT returns `200` instead of `401` (BUG-08) |
| Workflow run URL | TBD_RED_URL |
| Result | Red — exactly one test case fails |
| Screenshot | `reports/screenshots/ci/ci-red.png` — student capture |

## Notes

The two runs differ only by the `evidence_mode` input, so a single pinned SUT
commit demonstrates both an all-passing pipeline and a one-failing pipeline
without weakening any expected result or fabricating a test. The full 120-case
contract suite (in `reports/`) is intentionally red against this teaching SUT
because it detects the SUT's real bugs; the CI green suite is the passing subset
used to demonstrate the pipeline itself.
