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
| A | FR-03 Forgot password/password reset | `POST /api/forgot-password`; `POST /api/reset-password` |
| B | FR-11 Order history and cancellation | `GET /api/orders/my-orders`; `GET /api/orders/:id`; `PUT /api/orders/:id/cancel` |
| C | FR-14 Category CRUD | `GET/POST /api/categories`; `PUT/DELETE /api/categories/:id` |

The selection follows the student's HW02/HW04 choices. Group-combination uniqueness still needs the student's confirmation.

## Test summary

Local Newman run: 18/08/2026, `http://127.0.0.1:3001`, pinned SUT commit above.

| Metric | Pool A | Pool B | Pool C | Total |
| --- | ---: | ---: | ---: | ---: |
| Selected APIs | 1 | 1 | 1 | 3 |
| AI-generated cases | 35 | 35 | 35 | 105 |
| Student-origin extensions | 5 | 5 | 5 | 15 |
| Designed | 40 | 40 | 40 | 120 |
| Executed | 39 | 40 | 40 | 119 |
| Passed | 18 | 34 | 19 | 71 |
| Failed | 21 | 6 | 21 | 48 |
| Not run | 1 | 0 | 0 | 1 |
| Confirmed bug groups | 4 | 3 | 4 | 10 unique total* |

\* `BUG-04` is cross-cutting and counted under both FR-03 and FR-14 above but once in the total. The unexecuted case is OTP expiry, which requires a controllable clock or authorized waiting fixture.

Newman executed 348 sequential setup/test requests and 601 assertions. There were 86 failed assertions but zero setup, pre-request, or test-script failures. Failures are retained as contract-deviation evidence.

## Main deliverables

| Artifact | Location |
| --- | --- |
| Main report | `main-report.md` and `output/pdf/23127272_HW06_Main_Report.pdf` |
| Reviewed test catalog | `test-design/test-cases.json` and `test-design/test-cases.md` |
| Test-case table | `reports/test-case-results.csv` (XLSX export remains blocked because the required artifact-tool runtime is unavailable) |
| Postman/Newman | `postman/` and `reports/newman-report.html` |
| Bug drafts | `bug-reports.md` |
| Reusable generator skill | `skills/generate-eshop-api-tests/` |
| AI audit and critique | `AI docs/` |
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

Final archive name after those actions: `23127272_HW06_AI_API_090.zip`.
