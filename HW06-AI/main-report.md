# HW06-AI API Testing Report - EShop

| Field | Value |
| --- | --- |
| Student | NGUYEN THIEN NHA TRAN |
| Student ID | 23127272 |
| Class | 23KTPM2 |
| Date | 18/08/2026 |
| SUT commit | `85af3ba875c88283615e22cb108f13e2fccaf0e9` |
| Base URL | `http://localhost:3000` |

## 1. Scope and selection

The selected APIs are pending the student decision in `api-selection.md`. Endpoint-specific results must not be written before that gate is complete.

## 2. Method

For each selected API, the workflow is: contract inventory -> input/output variables -> equivalence classes -> boundary values -> state transitions -> SEC-01 through SEC-07 traceability -> exact response schemas -> at least 35 AI cases -> human verdict and correction -> at least 5 student-added cases -> Postman/Newman execution -> bug triage.

The requirements and API specification are the test oracle. Source code and observed responses are implementation evidence. A mismatch is investigated as a potential bug; implementation behavior is not silently copied into expected results.

## 3. API 1 - Pool A

TBD after student selection.

Required subsections: contract, variables, equivalence classes, minimum domain set, BVA, state/security/schema cases, 35+ AI cases with audit verdicts, 5+ student extensions, execution summary, and bugs.

## 4. API 2 - Pool B

TBD after student selection.

## 5. API 3 - Pool C

TBD after student selection.

## 6. Cross-suite security traceability

| Requirement | Covered by test IDs | Result | Evidence |
| --- | --- | --- | --- |
| SEC-01 | TBD | Not executed | TBD |
| SEC-02 | TBD | Not executed | TBD |
| SEC-03 | TBD | Not executed | TBD |
| SEC-04 | TBD | Not executed | TBD |
| SEC-05 | TBD | Not executed | TBD |
| SEC-06 | TBD | Not executed | TBD |
| SEC-07 | TBD | Not executed | TBD |

## 7. Postman features used

Planned and to be confirmed after real execution: collection, collection variables, environment, collection-level pre-request script, request tests, JSON Schema assertions, data-driven Collection Runner/Newman data file, console, mock server, monitor, and Newman reporters. Remove any item not actually used and add evidence links.

## 8. Execution summary

No Newman run has been performed because the APIs are not selected. Do not attach a generated or placeholder report as execution evidence.

## 9. Bug report summary

No bug is claimed yet. A bug requires a reproduced specification deviation, request/response evidence, student-captured screenshot, and published GitHub Issue URL.

## 10. CI/CD report

The final workflow must start/reset the pinned SUT, run the reviewed collection with Newman, upload reports, and preserve a normal all-passing run plus a separate deliberate-failure run. Commit SHAs, run URLs, and screenshots remain student-owned execution evidence.

## 11. AI-driven test generator

The reusable skill is under `skills/generate-eshop-api-tests/`. It validates catalog counts, origins, review verdicts, EC coverage, security coverage, schemas, and Postman conversion. Pseudocode is under `test-generator/pseudocode.md`.

The required diagram is not AI-generated. The student must make and export it personally using `test-generator/SELF-DRAWN-DIAGRAM-REQUIRED.md` only as a checklist.

## 12. Limitations and human-review gates

- API selection and group uniqueness are pending.
- Case verdicts and corrections require student review.
- Screenshots, diagram, monitors/mock-server evidence, GitHub Issues, CI URLs, and final signature cannot be fabricated by AI.
- PDF, Excel, HTML, and ZIP outputs will be generated only after their source data is final.
