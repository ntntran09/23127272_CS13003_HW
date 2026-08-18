**Faculty of Information Technology (FIT) - Ho Chi Minh City University of Science (HCMUS)**

**CS423 / CSC13003 - Software Testing (AI-augmented - 2026)**

**AI POLICY - TEMPLATES - 2026 v1.0**

# AI Audit Report

*Mandatory appendix for every AI-assisted homework.*

## 1. Student Information

| Field | Value |
| :---- | :---- |
| **Student name (printed):** | NGUYỄN THIÊN NHÃ TRÂN |
| **Student ID:** | 23127272 |
| **Class / Cohort:** | 23KTPM2 |
| **Assignment ID:** | HW05-AI - Performance Testing on EShop, Scenario D |
| **Assignment date:** | 16-18/08/2026 |
| **AI tool(s) used:** | OpenAI Codex; Context7 documentation connector |
| **AI used in this assignment:** | Yes |

## 2. Instructions

This audit records AI-assisted work used for HW05-AI. Long outputs are referenced by transcript or artifact path instead of pasted in full. The main course requirement used as the review basis is `../2026.HW05.Performance Testing_En_2.0_TA.md`: guide AI through performance-test design, review and correct its work, execute Load/Stress/Spike tests with attributable evidence, critique its analysis, and attach an AI Audit Report and AI Critique.

Five substantive Codex work sessions are preserved under `evidence/`. Their audit-focused Markdown logs contain only user prompts and delivered answers; raw JSONL copies are retained as technical backups. Session bootstrap data, installed-plugin lists, environment context, hidden instructions, progress messages, tool output, and chain-of-thought are excluded from the readable logs. The verbatim user prompts are collected in `../appendix_a/`, while the audit table contains only substantive task-level artifacts.

## 3. Audit Table - one row per substantive artifact

| (1) Prompt + Tool | (2) AI Output | (3) Verdict | (4) Reasoning | (5) Student Fix |
| :---- | :---- | :---- | :---- | :---- |
| **Tool:** Codex<br>**Time:** 2026-08-17T02:35:49.114Z<br>**Prompt:** Design, execute, analyse, and document the HW05 performance-testing assignment using Scenario D. | Generated the Scenario D JMeter plans, CSV data, seed/preflight/runner/analyser tools, four executed scenarios, raw evidence, reusable skills, main report, audit draft, checklist, video script, and PDF drafts. Evidence: `evidence/scenario-d-session/codex-chat-logs/codex-chat-log.md`, Interactions 1-2, and the submitted artifacts. | INCOMPLETE | The original AI-assisted artifact omitted prohibited student-created evidence. The student later supplied same-frame screenshots, hardware evidence, and more than six minutes total of Vietnamese narration split across the three required scenarios; confirmed Scenario D uniqueness; reviewed the AI outputs; signed the audit; and authorized publication of the reproduced GitHub issue. | Recorded and uploaded the student-narrated [Load](https://youtu.be/V9yUT83EWaQ), [Stress](https://youtu.be/Kezjr_zH-vo), and [Spike](https://youtu.be/NZoZCMwne4I) videos. |
| **Tool:** Codex<br>**Time:** 2026-08-17T04:00:14.975Z<br>**Prompt:** Clean the workspace while preserving every artifact required by the HW05 submission and AI-audit policy. | Removed temporary files and old Candidate B artifacts, but also removed the raw Codex JSONL and claimed that no required artifact was missing. Evidence: `evidence/scenario-d-session/codex-chat-logs/codex-chat-log.md`, Interaction 3. | INVALID | HW05 section 9 requires a complete AI-use log, and section 14 requires separate AI Critique and AI Audit artifacts. Deleting the raw session log and leaving no Appendix A made the completeness claim false. | Restored raw session logs from Codex history, created `../appendix_a/`, added `AI_critique.md`, and updated the documentation/PDF pipeline. |
| **Tool:** Codex<br>**Time:** 2026-08-17T04:57:41.509Z-05:00:08.536Z<br>**Prompt:** Prepare a larger, reproducible public product dataset for optional future performance tests without changing the evidence from completed runs. | Sourced and normalized 1,000 product rows into `../performance/data/products.csv`, documented provenance in `../performance/data/products-source.md`, and stated that the data had not been imported or measured. Evidence: `evidence/product-data-session/codex-chat-logs/codex-chat-log.md`, Interactions 5-6. | VALID | The output preserves reproducibility and clearly separates supplemental data from the five-product dataset used by the submitted JTL evidence. | None. Keep the dataset supplemental unless the SUT is reseeded and every scenario is rerun. |
| **Tool:** Codex<br>**Time:** 2026-08-17T18:44:25.663Z-19:02:38.388Z<br>**Prompt:** Standardize the HW05 AI documentation and prompt appendix to match previous submissions, while limiting the audit table to substantive task-level prompts. | Added Appendix A, restored and cleaned four session logs, converted the audit to the six-section format, added a separate AI Critique file/PDF target, and consolidated related interactions into four artifact-level audit rows. Evidence: `../appendix_a/`, this report, `AI_critique.md`, and `../output/pdf/`. | VALID | The structure now matches HW02/HW04, preserves full prompt traceability in Appendix A, and keeps the audit table concise and task-focused. | None. |
| **Tool:** Codex<br>**Time:** 2026-08-18<br>**Prompt:** Complete the remaining HW05 work except the video, grade it, and publish the access-control bug on the student's EShop fork. | Verified four same-frame screenshots and the `TRAN` hardware screenshot, reproduced BUG-ADMIN-001 with a normal-user JWT, captured request/response evidence, published `ntntran09/eshop-sut#56`, reconciled the reports and checklist, fixed the runner's backend-readiness race, assigned provisional grade 090, rebuilt the PDFs, refreshed the commit log, and prepared the final archive. Evidence: `evidence/finalization-session/codex-chat-logs/codex-chat-log.md` and the final artifacts. | INCOMPLETE | The requested non-video deliverables are complete and evidence-backed. The prompt explicitly excluded video, which the student later supplied. Screenshots from later reruns are not a perfect one-to-one match for the restored earlier raw-result folders; this remaining traceability limitation is disclosed in the submission. | Recorded and uploaded the three narrated scenario videos. Restored the accepted Load/Stress/Spike result folders after recording; retain same-run raw evidence in future work for maximum traceability. |

## **4\. Summary of AI Accuracy**

| Metric | Count | Percentage |
| :---- | :---- | :---- |
| **Total AI-generated artifacts audited** | 5 | 100% |
| **VALID (correct, accepted as-is)** | 2 | 40.0% |
| **INVALID (wrong; rejected)** | 1 | 20.0% |
| **INCOMPLETE (acceptable after edits)** | 2 | 40.0% |

## **5\. Conclusion - When should AI be used (or not)?**

Across five substantive audited artifacts, AI was most useful for repeatable scaffolding: generating structurally consistent JMeter plans, automating execution and evidence capture, recomputing raw-log statistics, preparing reproducible test data, and assembling submission documentation. It was less reliable when deciding that the submission was complete. The strongest failure occurred during cleanup, when Codex removed its own raw session log and then claimed that no required artifact was missing, despite HW05 explicitly requiring a complete AI-use log and separate audit/critique deliverables. Its first performance interpretation also confused short peaks with sustained capacity, overall percentiles with phase-specific behavior, and ramp-up memory growth with a leak. AI should therefore be used to generate plans, scripts, reproducible calculations, and review candidates; it should not be trusted as the final judge of evidence completeness or performance meaning. The student must preserve raw evidence, verify every numerical claim against the JTL and time windows, check recommendations against the source architecture, and personally complete the prohibited evidence.

## **6\. Mandatory Disclosure (paste verbatim)**

Scenario D workload design, JMeter plan generation, CSV and seed tooling, execution automation, raw-log analysis, performance-threshold suggestions, continuous-testing proposal, report drafting, AI Critique drafting, AI Audit organization, prompt-log extraction, checklist reconciliation, and provisional grading were generated or assisted by OpenAI Codex with documentation lookups through Context7; I reviewed the Load, Stress, Spike, and Endurance evidence, rejected peak throughput as sustained capacity, corrected phase and endpoint percentile interpretations, rejected unsupported optimization claims, removed the excluded sleep-interrupted Spike evidence from the final package, restored the AI logs removed during cleanup, and kept the downloaded product CSV separate from the measured dataset. The raw JTL files, resource measurements, screenshots, hardware evidence, narration, and other prohibited evidence are not claimed as AI-generated. The detailed AI Audit Report and Appendix A prompt log are attached. I confirm I did not use AI to fabricate any artifact listed in the prohibited category.

## **Signature**

| Student name (printed): | NGUYỄN THIÊN NHÃ TRÂN |
| :---- | :---- |
| **Student ID:** | 23127272 |
| **Class / Cohort:** | 23KTPM2 |
| **Course:** | CS423 / CSC13003 - Software Testing |
| **Instructor:** | Dr. Lam Quang Vu / Dr. Tran Duy Hoang / MSc. Tran Thi Bich Hanh / MSc. Truong Phuoc Loc / MSc. Ho Tuan Thanh |
| **Date:** | 18/08/2026 |
| **Signature:** | Nhã Trân |
