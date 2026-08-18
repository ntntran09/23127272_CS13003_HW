# HW06 CI/CD Report

## Pipeline

Workflow: `.github/workflows/hw06-api.yml`.

The manual workflow installs the pinned Newman toolchain, runs generator unit tests and full catalog validation, checks out EShop commit `85af3ba875c88283615e22cb108f13e2fccaf0e9`, installs/seeds the backend, waits for `GET /api/products`, runs the reviewed Postman collection, and uploads Newman JSON/HTML plus the backend log even on failure.

The workflow remains manual so the student controls when public evidence is created. API selection and the catalog are now complete. No remote run is claimed in this report.

Local equivalents completed on 18/08/2026: generator tests `3/3` passed; catalog validation passed; the full Newman contract suite executed against the pinned SUT and exited `1` because 48 cases exposed ten bug groups. Setup/test-script failures were zero.

## Passing sample commit/run

| Field | Value |
| --- | --- |
| Commit SHA/link | TBD |
| Workflow run URL | TBD |
| Screenshot | TBD - student capture |
| Result | Not run remotely - student action required |

## Deliberate-failure sample commit/run

| Field | Value |
| --- | --- |
| Commit SHA/link | TBD |
| Controlled failing assertion | Use a temporary explicit assertion in a separate commit; do not weaken the final oracle |
| Workflow run URL | TBD |
| Screenshot | TBD - student capture |
| Result | Not run remotely - student action required |

Create the deliberate failure in a separate commit/branch or revert it immediately after capturing the failed run. Do not leave a weakened oracle in the final passing collection.

The pinned teaching SUT intentionally violates several contracts, so the full reviewed suite cannot honestly produce an all-passing run without fixing the SUT. For the required passing sample, use a bug-fixed SUT commit and preserve that commit link. Do not relabel current buggy behavior as expected merely to make CI green.
