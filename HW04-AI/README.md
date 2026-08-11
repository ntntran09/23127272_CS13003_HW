# HW04-AI – Automation Testing

## Student Information

| Field | Value |
| --- | --- |
| Student | NGUYEN THIEN NHA TRAN |
| Student ID | 23127272 |
| Class | 23KTPM2 |

## Test Summary

| Metric | Count |
| --- | ---: |
| Features | 3 |
| Automated test cases | 41 |
| Data-driven datasets | 88 |
| Browsers | 5 |
| Rendering engines | 3 |
| Browser runs / HTML reports | 15 |
| Test executions | 440 |
| Passed | 238 |
| Failed | 202 |
| Unique reviewed defects | 17 |

Browsers: Playwright Chromium, Firefox, WebKit, Google Chrome, Microsoft Edge — Blink, Gecko, and WebKit engines.

Two of the 202 failures are a Firefox teardown flake, not defects; see `bug-report/bug-report.md`.

## Deliverables

| Deliverable | Location / Status |
| --- | --- |
| Main report | `main-report.md`; PDF at `output/pdf/23127272_HW04_Main_Report.pdf` |
| Automation | `automation/` |
| External test data | `automation/data/` |
| HTML reports | `automation/reports/` |
| Report summary | `automation/reports/run-summary.json` |
| Bug report and screenshots | `bug-report/`; 17 issues filed at [ntntran09/eshop-sut Issues](https://github.com/ntntran09/eshop-sut/issues) |
| Task skills | `skills/` |
| AI Audit Report | `AI docs/AI-Audit-Report.md`; PDF at `output/pdf/23127272_HW04_AI_Audit_Report.pdf` |
| AI Critique | `AI docs/AI_critique.md`; PDF at `output/pdf/23127272_HW04_AI_Critique.pdf` |
| Appendix A prompts | `appendix_a/README.md` and `appendix_a/prompt_*.md` |
| AI session evidence | `AI docs/evidence/implementation-session/` (Codex), `AI docs/evidence/review-session/` (Claude) |
| Git commit log | `git_log.md` |
| Demo video | https://youtu.be/YGdgjPMiork |
| Skill demo video | https://youtu.be/Jsy-zFRlMDk |
| Public repository | https://github.com/ntntran09/23127272_CS13003_HW |

## Self-Assessment

| No. | Criteria | Grade | Self-Assessed Grade |
| --- | --- | ---: | ---: |
| 1 | Task 1 – Feature A (FR-03) | 25 | 25 |
| 2 | Task 1 – Feature B (FR-11) | 25 | 25 |
| 3 | Task 1 – Feature C (FR-14) | 25 | 25 |
| 4 | Task 2 – Demo video | 15 | 15 |
| 5 | Agent Skills | 10 | 10 |
|  | **Total** | **100** | **100** |

## Remaining Submission Blockers

- Record the Vietnamese narrated video with `whoami` and `hostname`.
- Record the skill demonstration or clearly include it in the main video.
- Sign the AI Audit Report (`AI docs/AI-Audit-Report.md`, Signature section).
- Commit spread: eight `.spec.js` commits exist, but over two calendar days rather than four.

## Submission Package

The zip exceeds the 20 MB limit as one file, so the HTML reports are split. Both
files are needed; unzip them into the same folder and the report tree merges.

| File | Size | Contents |
| --- | ---: | --- |
| `23127272_HW04_AI_Automation_100.zip` | 14.2 MB | All required documents (main report, AI Audit Report, AI Critique, git log, bug report, this README, PDFs) plus the FR-03 and FR-14 HTML reports |
| `23127272_HW04_AI_Automation_100_reports_fr11.zip` | 9.0 MB | FR-11 HTML reports and `run-summary.json` |

Playwright trace archives (`trace.zip`, ~50 MB) are excluded from both files and
from the repository. Screenshots and videos are included, and every HTML report
opens standalone.
