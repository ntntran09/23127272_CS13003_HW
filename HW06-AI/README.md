# HW06-AI - API Testing

## Student information

| Field | Value |
| --- | --- |
| Student | NGUYEN THIEN NHA TRAN |
| Student ID | 23127272 |
| Class | 23KTPM2 |
| SUT | EShop |
| Public repository | <https://github.com/ntntran09/23127272_CS13003_HW> |
| SUT source commit | `85af3ba875c88283615e22cb108f13e2fccaf0e9` |

## Selected APIs

| Pool | Feature | Endpoints |
| --- | --- | --- |
| A | FR-02 Login and account lockout | `POST /api/login` |
| B | FR-07 Add to shopping cart | `POST /api/cart` (supporting `GET /api/cart` for state checks) |
| C | FR-15 Create product | `POST /api/products` |

The selection follows the student's revised group allocation on 18/08/2026: member 1's three APIs.

## Test summary

Local Newman run: 18/08/2026, `http://127.0.0.1:3001`, pinned SUT commit above.

| Metric | Pool A | Pool B | Pool C | Total |
| --- | ---: | ---: | ---: | ---: |
| Selected APIs | 1 | 1 | 1 | 3 |
| AI-generated cases | 35 | 35 | 35 | 105 |
| Student-origin extensions | 5 | 5 | 5 | 15 |
| Designed | 40 | 40 | 40 | 120 |
| Executed | 39 | 40 | 40 | 119 |
| Passed | 19 | 14 | 14 | 47 |
| Failed | 20 | 26 | 26 | 72 |
| Not run | 1 | 0 | 0 | 1 |
| Confirmed bug groups | 4 | 4 | 3 | 9 unique total* |

\* `BUG-03` is cross-cutting and counted once in the total. The unexecuted case is the exact 30-second lockout-expiry boundary, which requires a controllable clock or timed fixture.

Newman executed 222 requests (214 collection items plus eight in-script state-verification callbacks) and 466 assertions. There were 124 failed assertions but zero request, pre-request, or test-script failures. Failures are retained as contract-deviation evidence.

## Main deliverables

| Artifact | Location |
| --- | --- |
| Main report | `main-report.md` |
| Reviewed test catalog | `test-design/test-cases.json` and `test-design/test-cases.md` |
| Test-case table | `reports/test-case-results.csv` (XLSX export remains blocked because the required artifact-tool runtime is unavailable) |
| Postman/Newman | `postman/` and `reports/newman-report.html` |
| Bug drafts | `bug-reports.md` |
| Reusable generator skill | `skills/generate-eshop-api-tests/` |
| Reusable CI evidence skill | `skills/setup-newman-ci-evidence/` |
| CI workflow/report | `.github/workflows/hw06-api.yml`; `ci-cd-report.md` |

## Reproduce

```powershell
Set-Location .\HW06-AI\automation
npm ci
npm run test:skill
npm run validate:skill
npm run test:api
```

`npm run test:api` is expected to exit nonzero against the pinned buggy SUT because the suite intentionally detects specification deviations.

## Self-assessment

| No. | Criterion | Maximum | Self-assessed |
| ---: | --- | ---: | ---: |
| 1 | Pool A full pipeline | 30 | 27 |
| 2 | Pool B full pipeline | 30 | 27 |
| 3 | Pool C full pipeline | 30 | 27 |
| 4 | Agent Skill | 10 | 9 |
| | Total | 100 | **090** |

Provisional grade: `090`. Student should adjust after supplying screenshots, public issue links, two CI run links, group-uniqueness confirmation, and the self-drawn diagram.

The AI Audit Report, Appendix A, and AI Critique have been rebuilt from the current FR-02/FR-07/FR-15 session (`AI docs/` and `appendix_a/`), based on the recovered Codex transcript under `AI docs/evidence/current-selection-session/`. The self-drawn generator diagram is done (`test-generator/23127272_HW06_test_generator_diagram.png` + `.excalidraw`). Still to recreate before packaging: the PDFs, the Excel test cases/summary, and the Git commit log (the FR-02/FR-07/FR-15 rework is currently uncommitted in the working tree and must be committed as per-step commits).
