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

The selection follows the student's revised group allocation on 18/08/2026: member 1's three APIs. Confirmed unique within the group — no other member selected the same three APIs (FR-02 / FR-07 / FR-15).

## Test summary

Local Newman run: 30/08/2026, `http://127.0.0.1:3001`, pinned SUT commit above.

| Metric | Pool A | Pool B | Pool C | Total |
| --- | ---: | ---: | ---: | ---: |
| Selected APIs | 1 | 1 | 1 | 3 |
| AI-generated cases | 35 | 35 | 35 | 105 |
| Student-origin extensions | 5 | 5 | 5 | 15 |
| Designed | 40 | 40 | 40 | 120 |
| Executed | 40 | 40 | 40 | 120 |
| Passed | 19 | 14 | 14 | 47 |
| Failed | 21 | 26 | 26 | 73 |
| Not run | 0 | 0 | 0 | 0 |
| Confirmed bug groups | 4 | 4 | 3 | 9 unique total* |

\* `BUG-03` is cross-cutting and counted once in the total. The 30-second lockout-expiry case (A-AI-035) was executed manually with a timed wait; it failed because the SUT stays locked ~180s instead of 30s (BUG-04).

Newman executed 222 requests (214 collection items plus eight in-script state-verification callbacks) and 466 assertions. There were 124 failed assertions but zero request, pre-request, or test-script failures. Failures are retained as contract-deviation evidence.

## Main deliverables

| Artifact | Location |
| --- | --- |
| Main report | `main-report.md` |
| Reviewed test catalog | `test-design/test-cases.json` and `test-design/test-cases.md` |
| Test-case table | `reports/test-case-results.csv` and `reports/23127272_HW06_test_cases.xlsx` (Test Cases + Summary sheets) |
| Report PDFs | `output/pdf/23127272_HW06_Main_Report.pdf`, `output/pdf/23127272_HW06_AI_Audit.pdf` |
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
| 1 | Pool A (FR-02) full pipeline | 30 | 28 |
| 2 | Pool B (FR-07) full pipeline | 30 | 28 |
| 3 | Pool C (FR-15) full pipeline | 30 | 28 |
| 4 | Agent Skill (AI-driven generator) | 10 | 9 |
| | Total | 100 | **093** |

Self-assessed grade: `093`. Each API completes the full pipeline — generate (35 AI cases), audit (verdicts confirmed), extend (5 student cases, six refined during review), execute (real Newman run with actual-status evidence), and bugs (published as GitHub Issues #57-#65 with screenshots). The Agent Skill ships the generator, validator, unit tests, pseudocode, and a self-drawn diagram. Deductions: the 30-second lockout-expiry case is left manual, and the generator demo video is optional and not yet recorded (add it to raise the skill score).

Deliverables status: AI Audit Report, Appendix A, and AI Critique rebuilt for FR-02/FR-07/FR-15 (`AI docs/`, `appendix_a/`); self-drawn diagram, Excel workbook, and both report PDFs generated; nine bugs filed as GitHub Issues with screenshots; CI green (success) and red (one-failing) runs recorded in `ci-cd-report.md`; Git commit log in `git-commit-log.txt`. Remaining before zipping: optional demo video, then create `23127272_HW06_AI_API_093.zip`.
