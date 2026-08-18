# HW06 CI/CD Report

## Pipeline

Workflow: `.github/workflows/hw06-api.yml`.

The manual workflow installs the pinned Newman toolchain, runs generator unit tests and full catalog validation, checks out EShop commit `85af3ba875c88283615e22cb108f13e2fccaf0e9`, installs/seeds the backend, waits for `GET /api/products`, runs the reviewed Postman collection, and uploads Newman JSON/HTML plus the backend log even on failure.

The workflow is manual while API selection is pending so an incomplete catalog does not create misleading CI evidence.

## Passing sample commit/run

| Field | Value |
| --- | --- |
| Commit SHA/link | TBD |
| Workflow run URL | TBD |
| Screenshot | TBD - student capture |
| Result | Not run |

## Deliberate-failure sample commit/run

| Field | Value |
| --- | --- |
| Commit SHA/link | TBD |
| Controlled failing assertion | TBD |
| Workflow run URL | TBD |
| Screenshot | TBD - student capture |
| Result | Not run |

Create the deliberate failure in a separate commit/branch or revert it immediately after capturing the failed run. Do not leave a weakened oracle in the final passing collection.
