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
| Assignment date | 2026-08-08 |
| AI tool(s) used | OpenAI Codex |
| AI used in this assignment | Yes |

## 2. Instructions

The student must review each provisional verdict below and replace it with exactly `VALID`, `INVALID`, or `INCOMPLETE`. Full prompt/final-output evidence is stored in `evidence/implementation-session/codex-chat-logs/`.

## 3. Audit Table

| (1) Prompt + Tool | (2) AI Output | (3) Verdict | (4) Reasoning | (5) Student Fix |
| :---- | :---- | :---- | :---- | :---- |
| **Tool:** Codex<br>**Time:** 2026-08-08T14:42:58.357Z<br>**Prompt:** “Lên plan để thực hiện homework này, nếu có tạo skill thì ko tạo skill cho bài tập này mà tạo cho từng tác vụ cần làm” | Implementation plan. See transcript Interaction 2. | **INCOMPLETE – provisional** | The plan correctly selected FR-03/FR-11/FR-14 and separated task skills, but assumed Firefox/WebKit availability before checking the environment. | Replaced the unavailable-browser plan with verified Chromium, Chrome, and Edge projects; documented the shared-engine limitation. |
| **Tool:** Codex<br>**Time:** 2026-08-08T14:46:33.888Z<br>**Prompt:** “tui có fork eshop trong code rùi nghe, bạn thao tác tiếp đi” | Generated Playwright config, 36 external data rows, three specs, fixtures, matrix runner, validators, reports, skills, and report drafts. See repository artifacts and transcript Interaction 3. | **INCOMPLETE – provisional** | Initial generated runner did not start `npx.cmd` correctly on Windows; the first OTP regex and back-link scope also caused false failures/passes. The final artifacts required execution-based human corrections. | Called the resolved Playwright CLI with Node, checked spawn errors, fixed OTP numeric boundaries, scoped the locator to `main`, reduced verified waits, and decoded report metadata for validation. |
| **Tool:** Codex<br>**Time:** 2026-08-08T14:59:19.739Z<br>**Prompt:** “sao ko phải là edge?” | Reconfigured projects and matrix to use installed Microsoft Edge alongside Chromium and Chrome. | **VALID – provisional** | Edge was installed and launched successfully. Smoke and full matrix runs produced a distinct Edge HTML report for every feature. | None, subject to student confirmation. |

## 4. AI Use Declaration

I use AI tools for planning the automation workflow, generating initial Playwright scripts and external test data, reviewing and correcting automation code, creating reusable task skills, and drafting the audit/report structure. I reviewed the executed results and remain responsible for the final submission.

## 5. Signature / Submission Checklist

| Item | Status |
| :---- | :---- |
| Every AI-assisted artifact has a prompt | Partial – re-export after the implementation session ends |
| Every AI-assisted artifact has output evidence | Done for current exported interactions |
| Every output has a verdict | Student confirmation pending |
| Invalid or incomplete outputs have student fixes | Drafted |
| AI-original vs final-file comparisons attached when applicable | Not applicable; corrections are documented from execution evidence |
| Codex/chat transcript attached | Done |

**Student confirmation:** TODO – review the transcript, verdicts, reasoning, and fixes before signing.
