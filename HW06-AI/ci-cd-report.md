# HW06 CI/CD Report

## Pipeline

Workflow: `.github/workflows/hw06-api.yml`. Reusable setup skill: `skills/setup-newman-ci-evidence/`.

The manual workflow accepts `passing` or `deliberate-failure` evidence mode plus an exact SUT repository and commit. Its default repository is the student's fork, `ntntran09/eshop-sut`. It installs the pinned Newman toolchain, runs generator unit tests and full catalog validation, installs/seeds the selected backend, waits for `GET /api/products`, runs the complete reviewed Postman collection, and uploads Newman JSON/HTML plus the backend log even on failure. The CI command overrides `base_url` with `http://127.0.0.1:3000`, so it does not modify the student's local Postman environment.

Both modes require the reviewed collection to pass first. The failure mode then runs the separate evidence-only case `CI-FAIL-001`; a deterministic verifier requires exactly one failed assertion, no failed request or script, and the assertion name `DELIBERATE FAILURE - controlled CI evidence`. The step exits nonzero after verification so GitHub records the run as failed by design. The false assertion is not present in the reviewed contract suite.

The workflow remains manual so the student controls when public evidence is created. API selection and the catalog are now complete. No remote run is claimed in this report.

Local checks completed on 30/08/2026: workflow `actionlint` passed; generator tests `3/3` passed; catalog validation passed; skill validation passed; CI verifier tests `4/4` passed. The evidence-only Newman case was also executed against the pinned SUT and produced exactly one failed assertion with zero request/infrastructure failures. The earlier full Newman contract suite still exits `1` against the pinned buggy SUT, so no green remote run is claimed.

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
| Controlled failing assertion | `CI-FAIL-001` in `ci/deliberate-failure.postman_collection.json` |
| Workflow run URL | TBD |
| Screenshot | TBD - student capture |
| Result | Not run remotely - student action required |

Run the deliberate failure only through the opt-in workflow mode. Do not copy its false `418` oracle into the reviewed collection.

The pinned teaching SUT intentionally violates several contracts, so the full reviewed suite cannot honestly produce an all-passing run without fixing the SUT. For the required passing sample, use a bug-fixed SUT commit and preserve that commit link. Do not relabel current buggy behavior as expected merely to make CI green.
