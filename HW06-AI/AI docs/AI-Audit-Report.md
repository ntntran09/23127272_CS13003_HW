**Faculty of Information Technology (FIT) - Ho Chi Minh City University of Science (HCMUS)**

**CS423 / CSC13003 - Software Testing (AI-augmented - 2026)**

# AI Audit Report - HW06-AI

## 1. Student Information

| Field | Value |
| :---- | :---- |
| **Student name (printed):** | NGUYEN THIEN NHA TRAN |
| **Student ID:** | 23127272 |
| **Class / Cohort:** | 23KTPM2 |
| **Assignment ID:** | HW06-AI - API Testing |
| **Assignment date:** | 18/08/2026 |
| **AI tool(s) used:** | OpenAI Codex; Context7 documentation connector |
| **AI used in this assignment:** | Yes |

## 2. Instructions

The table records AI-assisted artifacts using `VALID`, `INVALID`, or `INCOMPLETE`. Verdicts below are evidence-based drafts; the student must review and sign them. Full prompt/output evidence is in `evidence/setup-session/codex-chat-logs/codex-chat-log.md`; raw technical logs are retained separately and are not copied into this table.

## 3. Audit Table

| (1) Prompt + Tool | (2) AI Output | (3) Verdict | (4) Reasoning | (5) Student Fix |
| :---- | :---- | :---- | :---- | :---- |
| **Tool:** OpenAI Codex<br>**Time:** 18/08/2026<br>**Prompt:** "Read `D:\CODE\23127272_CS13003_HW\HW06-AI\2026.HW06.API Testing_En.md` and set up skill and complete the hw06" | Reusable skill, validator, builder, report scaffolds, Postman environment, and CI workflow. Evidence: `skills/generate-eshop-api-tests/` and commit `c860a0e`. | INCOMPLETE | The initial output correctly created neutral infrastructure but could not select APIs without the student's decision. The assignment requires one choice from each pool and a complete per-API pipeline. | Student later instructed Codex to reuse HW02/HW04 selections. |
| **Tool:** OpenAI Codex<br>**Time:** 18/08/2026<br>**Prompt:** "khoang chọn trc api nhe" | Stopped at the API-selection gate and did not invent Pool A/B/C choices. | VALID | This obeyed the explicit constraint and preserved group-selection responsibility. | None. |
| **Tool:** OpenAI Codex<br>**Time:** 18/08/2026<br>**Prompt:** "Còn api thì lấy theo nhx lựa chọn của Hw02 và Hw04" | Selected FR-03, FR-11, and FR-14 from prior final artifacts; generated 120 cases, including 105 AI cases and 15 student-origin extensions; produced raw and reviewed catalogs. | INCOMPLETE | Coverage/counts/schema/security traceability validate, but all audit verdicts are still AI preliminary labels. One OTP-expiry case correctly remains manual/incomplete. Detailed comparison: `evidence/setup-session/ai-final-comparisons/test-catalog.md`. | Student reviews every verdict, confirms group uniqueness, and signs. Keep `A-STU-038` incomplete until a valid timing fixture is used. |
| **Tool:** OpenAI Codex<br>**Time:** 18/08/2026<br>**Prompt:** Same completion request; automate the selected cases in Postman/Newman. | Initial builder used asynchronous pre-request setup. The first retained run is under `reports/harness-defect-run/`. | INVALID | Top-level `await` was not accepted, and an async-IIFE workaround did not make Newman wait. This caused false authentication failures and could have misclassified harness defects as SUT bugs. | Replaced asynchronous setup with 229 explicit sequential setup requests, fixed variable-scope precedence, reset the SUT, and reran. Final setup/script failures: 0. |
| **Tool:** OpenAI Codex<br>**Time:** 18/08/2026<br>**Prompt:** Same completion request; execute, analyze, and prepare submission artifacts. | Final local run: 119 executed cases, 71 passed, 48 failed, 1 not run; 10 reproducible bug groups; Markdown/CSV reports, Newman JSON/HTML, verified PDF exports, critique, and issue drafts. | INCOMPLETE | Local artifacts are evidence-backed, but XLSX authoring is blocked because the required artifact-tool dependency loader is unavailable. Anti-cheat and external-state requirements also require student work: screenshots, self-drawn diagram, published GitHub Issues, and CI run URLs. | Student exports/reviews the workbook in an artifact-tool-enabled session, captures/publishes required evidence, performs the manual expiry case, reviews PDFs, and updates links/signature. |

## 4. AI Use Declaration

I use AI tools for assignment analysis, skill design, domain/security/schema test generation, catalog validation, Postman/Newman automation, result parsing, report drafting, spreadsheet/PDF preparation, and audit-log organization. I remain responsible for API uniqueness, test-oracle correctness, human verdicts, real execution screenshots, the self-drawn diagram, issue publication, CI evidence, and final submission accuracy.

## 5. Signature / Submission Checklist

| Item | Status |
| :---- | :---- |
| Every AI-assisted artifact has a prompt/evidence reference | Complete for this Codex session |
| Every output has a draft verdict and reasoning | Complete |
| Invalid/incomplete outputs have fixes/actions | Complete |
| AI-original vs final catalog comparison attached | Complete |
| Codex transcript and raw JSONL attached | Complete |
| Student review/signature | **STUDENT ACTION** |
| Real screenshots, issue URLs, CI links, self-drawn diagram | **STUDENT ACTION** |

**Student confirmation:** I reviewed all AI-generated material and remain responsible for the correctness of the submitted work.

Signature/date: **STUDENT ACTION**
