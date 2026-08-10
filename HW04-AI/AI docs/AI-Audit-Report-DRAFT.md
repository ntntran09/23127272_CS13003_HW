**Faculty of Information Technology (FIT) - Ho Chi Minh City University of Science (HCMUS)**

**CS423 / CSC13003 - Software Testing (AI-augmented - 2026)**

# AI Audit Report – Draft Pending Student Verdict Review

## 1. Student Information

| Field | Value |
| :---- | :---- |
| Student name | NGUYEN THIEN NHA TRAN |
| Student ID | 23127272 |
| Class / Cohort | 23KTPM2 |
| Assignment ID | HW04-AI |
| Assignment date | 2026-08-08 (implementation), 2026-08-11 (test-validity review) |
| AI tool(s) used | OpenAI Codex; Claude (Claude Code, Opus 5) |
| AI used in this assignment | Yes |

## 2. Instructions

The student must review each provisional verdict below and replace it with exactly `VALID`, `INVALID`, or `INCOMPLETE`. Full prompt/final-output evidence for the 2026-08-08 implementation session is stored in `evidence/implementation-session/codex-chat-logs/`. The 2026-08-11 review session used a second tool (Claude Code); its transcript, extracted interactions, and readable chat log are stored in `evidence/review-session/claude-chat-logs/`, together with the `extract-interactions.js` script that produced them.

## 3. Audit Table

| (1) Prompt + Tool | (2) AI Output | (3) Verdict | (4) Reasoning | (5) Student Fix |
| :---- | :---- | :---- | :---- | :---- |
| **Tool:** Codex<br>**Time:** 2026-08-08T14:42:58.357Z<br>**Prompt:** Draft an implementation plan for this assignment. If any Agent Skill is created, scope it to a reusable task rather than to this assignment. | Implementation plan. See transcript Interaction 2. | **INCOMPLETE – provisional** | The plan correctly selected FR-03/FR-11/FR-14 and separated task skills, but assumed Firefox/WebKit availability before checking the environment. | Replaced the unavailable-browser plan with verified Chromium, Chrome, and Edge projects; documented the shared-engine limitation. |
| **Tool:** Codex<br>**Time:** 2026-08-08T14:46:33.888Z<br>**Prompt:** The EShop SUT is already forked into the local workspace. Proceed with the implementation. | Generated Playwright config, 36 test cases with external data rows, three specs, fixtures, matrix runner, validators, reports, skills, and report drafts. See repository artifacts and transcript Interaction 3. | **INCOMPLETE – provisional** | Initial generated runner did not start `npx.cmd` correctly on Windows; the first OTP regex and back-link scope also caused false failures/passes. The final artifacts required execution-based human corrections. | Called the resolved Playwright CLI with Node, checked spawn errors, fixed OTP numeric boundaries, scoped the locator to `main`, reduced verified waits, and decoded report metadata for validation. |
| **Tool:** Codex<br>**Time:** 2026-08-08T14:59:19.739Z<br>**Prompt:** Why is Microsoft Edge not part of the browser matrix? | Reconfigured projects and matrix to use installed Microsoft Edge alongside Chromium and Chrome. | **VALID – provisional** | Edge was installed and launched successfully. Smoke and full matrix runs produced a distinct Edge HTML report for every feature. | None, subject to student confirmation. |
| **Tool:** Claude (Claude Code, Opus 5)<br>**Date:** 2026-08-11<br>**Prompt:** Review whether the content of the automated test cases is sound, scoped to HW04. | Review of the 36 cases against the HW02 requirement documents. Reported ten problem classes, the most serious being three fixtures that supplied the expected answer to their own assertion, so the test could not fail. | **VALID – provisional** | Each finding was checked against the requirement source and the recorded run artifacts before acceptance. One finding in the review — a missing order-sorting case — was **wrong**: FR-11 specifies no ordering requirement, so no such case is owed. | Rejected the unfounded sorting finding; accepted the rest as the basis for the fix session below. |
| **Tool:** Claude (Claude Code, Opus 5)<br>**Date:** 2026-08-11<br>**Prompt:** Apply the accepted corrections to the suite and re-run the browser matrix. | Rewrote `mockForgotPassword` around an account registry, rebuilt the FR-11 ownership case on mixed data, anchored the money and OTP oracles, corrected the 255-character data, extended `validate-test-data.js`, re-ran the 9-run matrix, and updated the reports. | **INCOMPLETE – provisional** | The corrections are supported by a full re-run (234 executions) and surfaced a genuine new defect, BUG-FR11-01. However, the first attempt to anchor the money assertion was itself wrong: it anchored on the `<tr>` text, where cells concatenate without separators, breaking 12 previously passing FR-11 tests. It was caught only because the suite was re-executed. | Re-ran the suite, diagnosed the regression from the failure artifact, and moved the assertion to the money `<td>` with both ends anchored. |

## 4. AI Use Declaration

I use AI tools for planning the automation workflow, generating initial Playwright scripts and external test data, reviewing and correcting automation code, auditing the validity of the generated test cases against the requirement documents, creating reusable task skills, and drafting the audit/report structure. Two tools were used: OpenAI Codex for the 2026-08-08 implementation session and Claude (Claude Code) for the 2026-08-11 test-validity review and fix session. I reviewed the executed results and remain responsible for the final submission.

## 5. Signature / Submission Checklist

| Item | Status |
| :---- | :---- |
| Every AI-assisted artifact has a prompt | Partial – re-export after the implementation session ends |
| Every AI-assisted artifact has output evidence | Done – both sessions exported (`evidence/implementation-session/`, `evidence/review-session/`) |
| Every output has a verdict | Student confirmation pending |
| Invalid or incomplete outputs have student fixes | Drafted |
| AI-original vs final-file comparisons attached when applicable | Not applicable; corrections are documented from execution evidence |
| Codex/chat transcript attached | Done |

**Student confirmation:** TODO – review the transcript, verdicts, reasoning, and fixes before signing.
