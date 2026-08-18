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

## Current gate

The three APIs are intentionally **not selected yet**. The student must select one API from each of Pool A, B, and C and confirm that the combination is not duplicated in the group. See `api-selection.md`.

## Test summary

| Metric | Pool A | Pool B | Pool C | Total |
| --- | ---: | ---: | ---: | ---: |
| Selected APIs | TBD | TBD | TBD | 0 |
| AI-generated cases | TBD | TBD | TBD | 0 |
| Student-added cases | TBD | TBD | TBD | 0 |
| Executed | TBD | TBD | TBD | 0 |
| Passed | TBD | TBD | TBD | 0 |
| Failed | TBD | TBD | TBD | 0 |
| Confirmed bugs | TBD | TBD | TBD | 0 |

Do not replace `TBD` values with invented evidence. Update them only after real selection and execution.

## Prepared deliverables

| Artifact | Location | Status |
| --- | --- | --- |
| Assignment | `2026.HW06.API Testing_En.md` | Source |
| API selection gate | `api-selection.md` | Awaiting student |
| Main report | `main-report.md` | Scaffolded |
| Test catalog | `test-design/test-cases.json` | Empty until selection |
| Reusable generator skill | `skills/generate-eshop-api-tests/` | Validated |
| Generator pseudocode | `test-generator/pseudocode.md` | Prepared |
| Self-drawn diagram | `test-generator/SELF-DRAWN-DIAGRAM-REQUIRED.md` | Student action required |
| Postman environment | `postman/23127272_HW06.local.postman_environment.json` | Prepared |
| Newman project | `automation/package.json` | Prepared |
| AI Audit Report | `AI docs/AI-Audit-Report.md` | Finalize after review |
| AI Critique | `AI docs/AI_critique.md` | Finalize after execution |

## Reproduce setup checks

```powershell
python .\skills\generate-eshop-api-tests\scripts\validate_catalog.py `
  .\test-design\test-cases.json --allow-partial

python C:\Users\tinal\.codex\skills\.system\skill-creator\scripts\quick_validate.py `
  .\skills\generate-eshop-api-tests

Set-Location .\automation
npm ci
```

## Self-assessment

| No. | Criterion | Maximum | Self-assessed |
| ---: | --- | ---: | ---: |
| 1 | API 1 full pipeline | 30 | TBD |
| 2 | API 2 full pipeline | 30 | TBD |
| 3 | API 3 full pipeline | 30 | TBD |
| 4 | Agent Skill | 10 | TBD |
| | Total | 100 | **TBD** |

Final archive format: `23127272_HW06_AI_API_<grade>.zip`.
