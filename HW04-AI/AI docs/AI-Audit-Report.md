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
| **Assignment ID:** | HW04-AI - Automation Testing on EShop |
| **Assignment date:** | 08/08/2026 (implementation), 11/08/2026 (test-validity review) |
| **AI tool(s) used:** | OpenAI Codex; Claude (Claude Code, Opus 5) |
| **AI used in this assignment:** | Yes |

## 2. Instructions

This audit records AI-assisted work used for HW04-AI. Long AI outputs are referenced by transcript or artifact path instead of pasted in full. Final files were reviewed and corrected by the student before submission. The main course requirement used as review basis is `../2026.HW04.Automation Testing_En.md`: drive an AI tool step by step to convert at least twelve test cases per feature into automation scripts, review and fix the generated scripts, produce multi-browser HTML reports and a bug report, and attach an AI Audit Report.

Two sessions with two different tools are covered. Full prompt and final-output evidence for the 2026-08-08 implementation session is stored in `evidence/implementation-session/codex-chat-logs/`. The 2026-08-11 review session used Claude Code; its transcript, extracted interactions, and readable chat log are stored in `evidence/review-session/claude-chat-logs/`, together with the `extract-interactions.js` script that produced them. The user prompts of both sessions are collected in `../appendix_a/`.

## 3. Audit Table - one row per artifact

| (1) Prompt + Tool | (2) AI Output | (3) Verdict | (4) Reasoning | (5) Student Fix |
| :---- | :---- | :---- | :---- | :---- |
| **Tool:** Codex<br>**Time:** 2026-08-08T14:42:58.357Z<br>**Prompt:** Draft an implementation plan for this assignment. If any Agent Skill is created, scope it to a reusable task rather than to this assignment. | Implementation plan. Evidence: `evidence/implementation-session/codex-chat-logs/codex-chat-log.md`, Interaction 2. | INCOMPLETE | The plan correctly selected FR-03/FR-11/FR-14 and separated task skills, but assumed Firefox/WebKit availability before checking the environment. | Replaced the unavailable-browser plan with verified Chromium, Chrome, and Edge projects; documented the shared-engine limitation in `../main-report.md`, section 4. |
| **Tool:** Codex<br>**Time:** 2026-08-08T14:46:33.888Z<br>**Prompt:** The EShop SUT is already forked into the local workspace. Proceed with the implementation. | Playwright config, 36 test cases with external data rows, three specs, fixtures, matrix runner, validators, reports, skills, and report drafts. Evidence: `evidence/implementation-session/codex-chat-logs/codex-chat-log.md`, Interaction 3, and the repository artifacts under `../automation/`. | INCOMPLETE | The initial generated runner did not start `npx.cmd` correctly on Windows; the first OTP regex and back-link scope also caused false failures and false passes. The final artifacts required execution-based human corrections. | Called the resolved Playwright CLI with Node, checked spawn errors, fixed OTP numeric boundaries, scoped the locator to `main`, reduced verified waits, and decoded report metadata for validation. |
| **Tool:** Codex<br>**Time:** 2026-08-08T14:59:19.739Z<br>**Prompt:** Why is Microsoft Edge not part of the browser matrix? | Reconfigured projects and matrix to use installed Microsoft Edge alongside Chromium and Chrome. Evidence: `evidence/implementation-session/codex-chat-logs/codex-chat-log.md`, Interaction 4. | VALID | Edge was installed and launched successfully. Smoke and full matrix runs produced a distinct Edge HTML report for every feature. | None. |
| **Tool:** Claude (Claude Code, Opus 5)<br>**Time:** 2026-08-10T19:45:44.079Z<br>**Prompt:** Review whether the content of the automated test cases is sound, scoped to HW04. | Review of the 36 cases against the HW02 requirement documents. Reported ten problem classes, the most serious being three fixtures that supplied the expected answer to their own assertion, so the test could not fail. Evidence: `evidence/review-session/claude-chat-logs/claude-chat-log.md`, Interaction 1. | VALID | Each finding was checked against the requirement source and the recorded run artifacts before acceptance. One finding in the review was wrong: a missing order-sorting case was demanded, but FR-11 specifies no ordering requirement, so no such case is owed. | Rejected the unfounded sorting finding; accepted the rest as the basis for the fix session below. |
| **Tool:** Claude (Claude Code, Opus 5)<br>**Time:** 2026-08-10T19:51:19.184Z<br>**Prompt:** Apply the accepted corrections to the suite and re-run the browser matrix. | Rewrote `mockForgotPassword` around an account registry, rebuilt the FR-11 ownership case on mixed data, anchored the money and OTP oracles, corrected the 255-character data, extended `validate-test-data.js`, re-ran the 9-run matrix, and updated the reports. Evidence: `evidence/review-session/claude-chat-logs/claude-chat-log.md`, Interaction 2. | INCOMPLETE | The corrections are supported by a full re-run (234 executions) and surfaced a genuine new defect, BUG-FR11-01. However, the first attempt to anchor the money assertion was itself wrong: it anchored on the `<tr>` text, where cells concatenate without separators, breaking 12 previously passing FR-11 tests. It was caught only because the suite was re-executed. | Re-ran the suite, diagnosed the regression from the failure artifact, and moved the assertion to the money `<td>` with both ends anchored. |

## **4\. Summary of AI Accuracy**

Aggregate the verdicts from Section 3 and complete the table below.

| Metric | Count | Percentage |
| :---- | :---- | :---- |
| **Total AI-generated artifacts audited** | 5 | 100% |
| **VALID (correct, accepted as-is)** | 2 | 40.0% |
| **INVALID (wrong; rejected)** | 0 | 0% |
| **INCOMPLETE (acceptable after edits)** | 3 | 60.0% |

## **5\. Conclusion — When should AI be used (or not)?**

Based on the audit of five AI-assisted artifacts across two tools, AI was useful for translating existing HW02 domain cases into a consistent external-data Playwright structure, for building the browser-matrix runner and report validators, for packaging two reusable task skills, and for auditing the suite it had itself produced. It was not reliable at deciding whether a test could fail. Three fixtures were generated so that the case handed the fixture the answer it was about to assert, and the FR-11 ownership case would have passed against a system with no ownership check at all; that defect survived a green run on three browsers. AI was also unreliable about the environment, assuming Firefox and WebKit runtimes were present, and about platform detail, spawning `npx.cmd` in a way that reported nine failed runs before any Playwright process had started. Even the review pass produced one unfounded finding (an ordering requirement FR-11 does not have) and one self-inflicted regression (a money regex anchored on the whole `<tr>`). The lesson for HW04 is that AI should be used for structured conversion, scaffolding, and first-pass review, while the student must own the oracle: for every generated case, state which change to the product would make it fail, and verify that the fixture does not already guarantee the answer.

## **6\. Mandatory Disclosure (paste verbatim)**

Automation planning, Playwright configuration, the initial `.spec.js` scripts and external JSON test data, the multi-browser matrix runner, the report and data validators, the reusable task skills, and the draft report structure were initially generated or assisted by OpenAI Codex and Claude (Claude Code); I reviewed and modified the FR-03, FR-11, and FR-14 automation, replaced the tautological fixtures with an account registry and mixed ownership data, anchored the money and OTP oracles, corrected the boundary-length data, fixed the Windows spawn defect in the matrix runner, rejected an unfounded review finding about order sorting, diagnosed and repaired a regression that the AI fix itself introduced, re-executed the full 234-execution matrix, and confirmed the eleven reported defects against the requirement documents. The detailed AI Audit Report and prompt appendix are attached in the AI documentation folder. I confirm I did not use AI to generate any artifact listed in the prohibited category.

## **Signature**

| Student name (printed): | NGUYỄN THIÊN NHÃ TRÂN |
| :---- | :---- |
| **Student ID:** | 23127272 |
| **Class / Cohort:** | 23KTPM2 |
| **Course:** | CS423 / CSC13003 - Software Testing |
| **Instructor:** | Dr. Lam Quang Vu / Dr. Tran Duy Hoang / MSc. Tran Thi Bich Hanh / MSc. Truong Phuoc Loc / MSc. Ho Tuan Thanh |
| **Date:** | 11/08/2026 |
| **Signature:** |  |
