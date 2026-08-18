**Faculty of Information Technology (FIT) - Ho Chi Minh City University of Science (HCMUS)**

**CS423 / CSC13003 - Software Testing (AI-augmented - 2026)**

**AI POLICY - TEMPLATES - 2026 v1.0**

# AI Audit Report

*Mandatory appendix for every AI-assisted homework.*

## 1. Student Information

| Field | Value |
| :---- | :---- |
| **Student name (printed):** | NGUYEN THIEN NHA TRAN |
| **Student ID:** | 23127272 |
| **Class / Cohort:** | 23KTPM2 |
| **Assignment ID:** | HW06-AI - API Testing on EShop |
| **Assignment date:** | 18/08/2026 |
| **AI tool(s) used:** | OpenAI Codex; Context7 documentation connector |
| **AI used in this assignment:** | Yes |

## 2. Instructions

This audit records AI-assisted work used for HW06-AI. Long outputs are referenced by transcript or artifact path instead of pasted in full. The review basis is `../2026.HW06.API Testing_En.md`: select one API from Pools A, B, and C; generate, audit, extend, and execute at least 40 cases per API; preserve Postman/Newman evidence; report genuine bugs; create a reusable test-generator skill; and attach an AI Audit Report, AI Critique, and prompt log.

One substantive Codex session is preserved under `evidence/setup-session/`. Its readable Markdown log and curated `../appendix_a/` files contain only user prompts and delivered answers. The raw JSONL remains as a technical backup. Session bootstrap data, plugin lists, environment context, hidden instructions, progress-only messages, tool output, and chain-of-thought are excluded from Appendix A. The audit table consolidates the interaction history into substantive task-level artifacts.

## 3. Audit Table - one row per substantive artifact

| (1) Prompt + Tool | (2) AI Output | (3) Verdict | (4) Reasoning | (5) Student Fix |
| :---- | :---- | :---- | :---- | :---- |
| **Tool:** Codex<br>**Time:** 2026-08-18T03:55:56.480Z<br>**Prompt:** Read the HW06 assignment, set up a reusable skill, and complete the homework. | Created the initial reusable generator skill, catalog validator, Postman builder, environment, report scaffolds, and CI workflow. Evidence: `../skills/generate-eshop-api-tests/` and commit `c860a0e`. | INCOMPLETE | The infrastructure was useful, but the first prompt did not yet identify the student's unique Pool A/B/C selections. Endpoint-specific generation and execution could not be completed without that decision. | Paused at the selection gate and requested the three choices instead of inventing them. |
| **Tool:** Codex<br>**Time:** 2026-08-18T03:56:28.957Z<br>**Prompt:** "khoang chọn trc api nhe" | Stopped before selecting APIs, validated the neutral skill/scaffold, and recorded the unresolved selection gate. Evidence: `../appendix_a/prompt_02.md`. | VALID | This obeyed the student's explicit constraint and preserved responsibility for group uniqueness. | None. |
| **Tool:** Codex<br>**Time:** 2026-08-18T04:19:27.346Z<br>**Prompt:** Reuse the API choices from HW02 and HW04. | Selected FR-03, FR-11, and FR-14 from prior final artifacts; generated and reviewed 105 AI cases; added 15 student-origin extensions; produced the collection, execution reports, bug drafts, reports, skill, critique, and PDFs. | INCOMPLETE | Counts, schemas, security traceability, and local execution evidence validate, but AI verdicts still require student confirmation. One OTP-expiry case needs an authorized timing fixture, and external/human-owned evidence remains incomplete. | Student confirms group uniqueness, reviews/signs verdicts, performs the expiry case, captures screenshots, publishes issues, records CI runs, and draws the generator diagram. |
| **Tool:** Codex<br>**Time:** 2026-08-18<br>**Prompt:** Automate and execute the selected cases in Postman/Newman. | The first builder used asynchronous setup inside pre-request scripts. The invalid run is retained locally under `../reports/harness-defect-run/`. | INVALID | Newman rejected top-level `await`; an async-IIFE revision still did not make Newman wait. These harness defects caused false authentication failures and could have been misreported as SUT bugs. | Replaced asynchronous setup with 229 explicit sequential setup requests, fixed environment/collection variable precedence, reset the pinned SUT, and reran. Final setup and script failures: 0. |
| **Tool:** Codex<br>**Time:** 2026-08-18<br>**Prompt:** Complete the local HW06 package and report verified results. | Final local evidence: 120 designed cases; 119 executed; 71 passed; 48 failed; 1 manual; 601 assertions; 10 reproducible bug groups; Markdown/CSV, Newman JSON/HTML, and visually checked PDFs. | INCOMPLETE | Local results are attributable and the test harness is clean. XLSX authoring is blocked because the required artifact-tool dependency loader is unavailable. Screenshots, public issue URLs, two CI runs, signature, and the self-drawn diagram cannot be fabricated by AI. | Export the CSV as a reviewed XLSX in an artifact-tool-enabled session and complete every student-owned evidence item before packaging. |
| **Tool:** Codex<br>**Time:** 2026-08-18T04:53:17.289Z<br>**Prompt:** "AI audit và appendix a như hw 5" | Converted this report to the same six-section structure as HW05 and added `../appendix_a/README.md` plus one prompt/output file per recorded user interaction. | VALID | The audit now separates concise artifact-level evaluation from the complete prompt/output trace, while excluding bootstrap and tool noise as required by the course audit policy. | None. |

## **4. Summary of AI Accuracy**

| Metric | Count | Percentage |
| :---- | :---- | :---- |
| **Total AI-generated artifacts audited** | 6 | 100% |
| **VALID (correct, accepted as-is)** | 2 | 33.3% |
| **INVALID (wrong; rejected)** | 1 | 16.7% |
| **INCOMPLETE (acceptable after edits/actions)** | 3 | 50.0% |

## **5. Conclusion - When should AI be used (or not)?**

Across six substantive audited artifacts, AI was most useful for repeatable enumeration and automation: deriving domain and boundary partitions, expanding state/security/schema coverage, building a validated catalog, generating a Postman Collection, parsing Newman evidence, and assembling consistent reports. Its strongest failure was in the test harness, not the SUT analysis. The original asynchronous setup created false 401 responses, showing that a large failure count is meaningless until prerequisites, timing, and variable scope are independently verified. AI also underweighted cross-request risks such as OTP rotation, forbidden-transition persistence, update isolation, and repeated delete until prior HW02/HW04 evidence was explicitly compared. AI should therefore generate candidate cases, scripts, traceability, and reproducible summaries; it should not be trusted as the final judge of the oracle, harness correctness, human review, or submission completeness. The student must validate the test mechanism, rerun from clean state, group related symptoms into genuine bugs, preserve raw evidence, and personally create every prohibited or externally attributable artifact.

## **6. Mandatory Disclosure (paste verbatim)**

FR-03, FR-11, and FR-14 test generation, domain and boundary analysis, security and schema traceability, Postman Collection construction, Newman automation, result parsing, bug-draft preparation, reusable Agent Skill design, report drafting, AI Critique drafting, AI Audit organization, Appendix A extraction, PDF generation, checklist reconciliation, and provisional grading were generated or assisted by OpenAI Codex with documentation lookups through Context7. I reviewed or must review the expected results, preliminary audit verdicts, and final submission contents. The Newman output is a real local run against pinned EShop commit `85af3ba875c88283615e22cb108f13e2fccaf0e9`. Screenshots, public GitHub Issue pages, CI run links, the self-drawn generator diagram, signature, and other prohibited evidence are not claimed as AI-generated or complete. The detailed AI Audit Report and Appendix A prompt log are attached. I confirm I did not use AI to fabricate any artifact listed in the prohibited category.

## **Signature**

| Student name (printed): | NGUYEN THIEN NHA TRAN |
| :---- | :---- |
| **Student ID:** | 23127272 |
| **Class / Cohort:** | 23KTPM2 |
| **Course:** | CS423 / CSC13003 - Software Testing |
| **Instructor:** | Dr. Lam Quang Vu / Dr. Tran Duy Hoang / MSc. Tran Thi Bich Hanh / MSc. Truong Phuoc Loc / MSc. Ho Tuan Thanh |
| **Date:** | 18/08/2026 |
| **Signature:** | **STUDENT ACTION** |
