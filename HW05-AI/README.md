# HW05-AI Performance Testing - Scenario D

## Student information

| Field | Value |
| --- | --- |
| Student | NGUYEN THIEN NHA TRAN |
| Student ID | 23127272 |
| Class | 23KTPM2 |
| Tool | Apache JMeter 5.6.3 |
| Workflow | Admin login -> orders -> products/categories -> update status -> verify |

## Test summary

| Scenario | Plan | Result summary |
| --- | --- | --- |
| Load | `performance/plans/23127272_Load_20260817.jmx` | 5,533 samples; p95 264 ms; 30.74 req/s; 0 errors |
| Stress | `performance/plans/23127272_Stress_20260817.jmx` | 25,530 samples; p95 622 ms; saturation after ~197 s; 0 errors |
| Spike | `performance/plans/23127272_Spike_20260817.jmx` | 10,727 samples; peak 135 VU; recovery p95 mean 83.32 ms; 0 errors |
| Endurance | `performance/plans/23127272_Endurance_20260817.jmx` | 42,094 samples; 47.55 req/s after warm-up; p95 97 ms; 0 errors; memory plateau |

Endpoint groups covered: auth-heavy, read-heavy, and transactional. One source-confirmed access-control bug is documented locally; GitHub publication is pending.

Demo video: `TBD - student must record own Vietnamese narration and add unlisted YouTube URL`.

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

The student must fill this after adding screenshots, video, issue URL, and signing the audit.

| No. | Criterion | Maximum | Self-assessed |
| ---: | --- | ---: | ---: |
| 1 | Load testing | 30 | TBD |
| 2 | Stress testing | 20 | TBD |
| 3 | Spike testing | 20 | TBD |
| 4 | AI analysis + misinterpretation hunt | 10 | TBD |
| 5 | Continuous performance testing proposal | 10 | TBD |
| 6 | Agent skills | 10 | TBD |
| | Total | 100 | TBD |

Final archive name: `23127272_HW05_AI_Performance_<SelfAssessedGrade>.zip`.
