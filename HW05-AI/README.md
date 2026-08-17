# HW05-AI Performance Testing - Scenario D

## Student information

| Field | Value |
| --- | --- |
| Student | NGUYEN THIEN NHA TRAN |
| Student ID | 23127272 |
| Class | 23KTPM2 |
| Tool | Apache JMeter 5.6.3 |
| Workflow | Admin login -> orders -> products/categories -> update status -> verify |
| Public repository | <https://github.com/ntntran09/23127272_CS13003_HW> |

## Test summary

| Scenario | Plan | Result summary |
| --- | --- | --- |
| Load | `performance/plans/23127272_Load_20260817.jmx` | 5,533 samples; p95 264 ms; 30.74 req/s; 0 errors |
| Stress | `performance/plans/23127272_Stress_20260817.jmx` | 25,530 samples; p95 622 ms; saturation after ~197 s; 0 errors |
| Spike | `performance/plans/23127272_Spike_20260817.jmx` | 10,727 samples; peak 135 VU; recovery p95 mean 83.32 ms; 0 errors |
| Endurance | `performance/plans/23127272_Endurance_20260817.jmx` | 42,094 samples; 47.55 req/s after warm-up; p95 97 ms; 0 errors; memory plateau |

Endpoint groups covered: auth-heavy, read-heavy, and transactional. One source-confirmed access-control bug is published at <https://github.com/ntntran09/eshop-sut/issues/56>.

Demo video: `TBD - student must record own Vietnamese narration and add unlisted YouTube URL`.

## Submission documents

| Artifact | Location |
| --- | --- |
| Main report | `main-report.md`; PDF at `output/pdf/23127272_HW05_Performance_Report.pdf` |
| AI Audit Report | `AI docs/AI-Audit-Report.md`; PDF at `output/pdf/23127272_HW05_AI_Audit_Report.pdf` |
| AI Critique | `AI docs/AI_critique.md`; PDF at `output/pdf/23127272_HW05_AI_Critique.pdf` |
| Appendix A - AI prompts | `appendix_a/README.md` and `appendix_a/prompt_*.md` |
| Readable AI logs | `AI docs/evidence/*/codex-chat-logs/codex-chat-log.md` |
| Raw AI log backups | `AI docs/evidence/*/codex-chat-logs/rollout-*.jsonl` |
| Git commit log | `git-commit-log.txt` |
| Peak/hardware screenshots | `performance/evidence/*-peak.png`; `performance/evidence/hardware-dxdiag.png` |
| Bug report | `bug-report/BUG-ADMIN-001-missing-role-enforcement.md`; evidence PNG; [GitHub issue #56](https://github.com/ntntran09/eshop-sut/issues/56) |

## Reproduce

Prerequisites:

- EShop repository at `D:\CODE\eshop-sut`.
- JMeter 5.6.3 at `D:\CODE\tools\apache-jmeter-5.6.3`.
- Java 21 and Node.js.
- Task Manager open beside the terminal for the required same-frame screenshot.

Run one scenario from this directory:

```powershell
.\performance\tools\run-scenario.ps1 -Scenario Load
.\performance\tools\run-scenario.ps1 -Scenario Stress
.\performance\tools\run-scenario.ps1 -Scenario Spike
.\performance\tools\run-scenario.ps1 -Scenario Endurance
```

The runner refuses to overwrite an existing evidence directory. It restarts the verified EShop process on port 3000, seeds a clean order pool, runs preflight, invokes JMeter CLI, and records backend CPU/RAM.

Recompute all raw-log statistics:

```powershell
.\performance\tools\analyse-all-results.ps1
```

Validate the three assignment plans:

```powershell
node .\skills\design-api-performance-suite\scripts\validate-test-plan.js `
  .\performance\plans\23127272_Load_20260817.jmx `
  .\performance\plans\23127272_Stress_20260817.jmx `
  .\performance\plans\23127272_Spike_20260817.jmx
```

## Self-assessment

Provisional self-assessment with the requested video exception. The score deducts for the missing video and for weaker one-to-one traceability because the peak screenshots were captured during later reruns while the earlier accepted raw-result folders were restored.

| No. | Criterion | Maximum | Self-assessed |
| ---: | --- | ---: | ---: |
| 1 | Load testing | 30 | 26 |
| 2 | Stress testing | 20 | 17 |
| 3 | Spike testing | 20 | 17 |
| 4 | AI analysis + misinterpretation hunt | 10 | 10 |
| 5 | Continuous performance testing proposal | 10 | 10 |
| 6 | Agent skills | 10 | 10 |
| | Total | 100 | **90** |

Grade rationale: full credit is claimed for the raw-log AI analysis, CI proposal, and reusable Agent Skills. Task 1 is reduced because the required narrated video is not included and the peak screenshots were captured during later reruns rather than the exact restored raw-result runs. The assignment's missing-document regulation may allow the instructor to apply a larger completeness penalty until the video is supplied.

Final archive name: `23127272_HW05_AI_Performance_090.zip`.
