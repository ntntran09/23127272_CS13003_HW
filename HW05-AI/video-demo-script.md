# Vietnamese Demo Script - Minimum 6 Minutes

The student must narrate this personally. Keep JMeter/terminal and Task Manager in the same frame when showing a run.

## 0:00-0:40 - Introduction

“Em là Nguyễn Thiện Nhã Trân, MSSV 23127272. Bài HW05 của em dùng Apache JMeter để kiểm thử hiệu năng EShop theo Scenario D, quy trình quản trị viên xử lý trạng thái đơn hàng.”

Show the repository, `README.md`, and the three named JMX files.

## 0:40-1:40 - Workflow and data isolation

Show `admin-orders.csv` and explain:

- admin login and explicit role check;
- list orders, products, and categories;
- pending-to-confirmed update;
- re-read and verify;
- one unique order per iteration; recycle disabled;
- restart/seed/preflight before every run.

## 1:40-2:40 - Load

Open the Load HTML dashboard and raw stats. State: 5,533 samples, 0 errors, p95 264 ms, 30.74 req/s, backend CPU peak 5.22%, memory ceiling 167.9 MiB. Explain that 42 req/s is only a one-second peak.

## 2:40-3:50 - Stress

Show the staged plan and report. Explain 25 -> 50 -> 100 VU, 25,530 samples, 0 errors, p95 622 ms, saturation after second 197, and update p95 875 ms. Explain why CPU peak 6.2% does not prove a CPU bottleneck.

## 3:50-4:50 - Spike and invalid-run handling

Show peak 135 threads, spike p95, and recovery buckets. State pre-spike p95 mean 63.90 ms, spike 1,512.18 ms, recovery 83.32 ms. Briefly show the discarded sleep-invalid folder and explain why exit code 0 was not enough.

## 4:50-5:35 - Endurance

Show the 15-minute JTL/resource trace and state final stable RPS, p95 trend, error rate, and memory first/last tenth. Do not read the peak RPS as sustained threshold.

## 5:35-6:25 - AI critique and CI proposal

Show the misinterpretation table: peak versus sustained capacity, overall versus per-label p95, spike phase separation, and why Load cannot prove a memory leak. Then show the Mermaid continuous-testing flow: path filter, smoke, fixed seed, p95 regression gate, clean-worker rerun, nightly Stress, weekly Endurance.

## 6:25-6:50 - Evidence and conclusion

Show the hardware hostname `TRAN`, raw `.jtl`, HTML report, resource CSV, and AI Audit Report. State that screenshots and narration are student-created and that the student accepts responsibility for AI-assisted work.

Unlisted YouTube URL: `TBD - student must upload`
