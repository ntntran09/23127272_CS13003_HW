# HW04 Automation Defect Log

Execution date: 2026-08-11  
Browsers: Playwright Chromium, Google Chrome, Microsoft Edge  
Evidence source: three independent HTML runs per feature under `automation/reports/<feature>/<browser>/`

The same failure reproduced on all three browsers. Each item below is counted once as a unique product defect, not three times. The 90 failed executions consolidate into the eleven defects below.

| ID | Requirement | Automated cases | Actual result | Evidence | GitHub Issue |
| --- | --- | --- | --- | --- | --- |
| BUG-FR03-01 | FR-03, FR-22 | FR03-AUTO-001-01, FR03-AUTO-003-01..03 | Neither step 1 nor step 2 displays a step indicator; OUT1 requires "Step 1 / 2" then "Step 2 / 2". | `automation/reports/fr03/chromium/data/14b0abde30c660b7704e1d62efd629eac4f97331.png` | [#1](https://github.com/ntntran09/23127272_CS13003_HW/issues/1) |
| BUG-FR03-02 | FR-03 | FR03-AUTO-001-01, FR03-AUTO-012-01 | Step 1 exposes no back-to-login control of any kind (neither link nor button); the step-2 "← Quay lại" button returns to step 1 instead of `/login`. | `automation/reports/fr03/chromium/data/14b0abde30c660b7704e1d62efd629eac4f97331.png` | [#2](https://github.com/ntntran09/23127272_CS13003_HW/issues/2) |
| BUG-FR03-03 | FR-22 | FR03-AUTO-005-01..03, FR03-AUTO-006-02 | Forgot-password email input uses `type="text"`; malformed and whitespace-only email pass browser validity. | `automation/reports/fr03/chromium/data/001f25f42355490f15598665a03f4486bad13d42.png` | [#3](https://github.com/ntntran09/23127272_CS13003_HW/issues/3) |
| BUG-FR03-04 | FR-22 | FR03-AUTO-004-01..03 | An unregistered email triggers `alert("Lỗi: User not found")` instead of inline feedback above submit. | `automation/reports/fr03/chromium/data/febdfc438ec65fc6f94caa7208bb36619c67dea9.png` | [#4](https://github.com/ntntran09/23127272_CS13003_HW/issues/4) |
| BUG-FR03-05 | FR-03, SEC-07 | FR03-AUTO-007-01..02 | The step-2 OTP field is labelled "Mã OTP (4 số)" while FR-03/IN6 specifies exactly 6 digits. Scope note: the automated run mocks `/api/forgot-password`, so this is a UI-contract defect only; the digit count the live backend generates is **not** covered by this evidence and needs a separate API check. | `automation/reports/fr03/chromium/data/a126dbf5c32e135f937f901684697fe959cfd4c3.png` | [#10](https://github.com/ntntran09/23127272_CS13003_HW/issues/10) |
| BUG-FR03-06 | FR-03, FR-22 | FR03-AUTO-008-01..02, FR03-AUTO-009-01..02, FR03-AUTO-011-01..02 | Confirmation-password input is absent (step 2 renders 2 inputs, not 3), so equality and required validation cannot occur. | `automation/reports/fr03/chromium/data/19dbbdd6602d8418409d56aa18cd7df3f16b74f9.png` | [#5](https://github.com/ntntran09/23127272_CS13003_HW/issues/5) |
| BUG-FR03-07 | FR-01, FR-03 | FR03-AUTO-010-01..03 | Valid reset cannot complete: `POST /api/reset-password` never fires and the page stays on `/forgot-password`. Reproduced with three FR-01-compliant passwords, including one using only the allowed special characters. | `automation/reports/fr03/chromium/data/257638a282915838771d3f76f3e9a6ffa7b604c1.png` | [#6](https://github.com/ntntran09/23127272_CS13003_HW/issues/6) |
| BUG-FR11-01 | FR-11, SEC-02 | FR11-AUTO-006-01..02 | The profile page renders every order in the response without checking `user_id`. Served mixed data (own order plus another user's order), the table shows both rows, including the foreign order `#999` and its total `987.654.321 ₫`. OUT5 requires that no order belonging to another user is visible. Scope note: the endpoint is mocked, so this proves the client performs no ownership filtering; whether the backend also fails to filter is a separate API check. | `automation/reports/fr11/chromium/data/b9ee426bdf06e8ec681510d7fd430dbcfbbf0921.png` | [#7](https://github.com/ntntran09/23127272_CS13003_HW/issues/7) |
| BUG-FR11-02 | FR-10, FR-11 | FR11-AUTO-008-01 | A shipping order still displays a cancel button; shipping may only be canceled by an admin. | `automation/reports/fr11/chromium/data/42510053eca5d6d01452f6ebc2a10a9325670af7.png` | [#8](https://github.com/ntntran09/23127272_CS13003_HW/issues/8) |
| BUG-FR11-03 | FR-11 | FR11-AUTO-012-02 | An unparseable order date is rendered verbatim as "Invalid Date" instead of a readable fallback. | `automation/reports/fr11/chromium/data/cbc99a1b6284ecb5a44c72ff42f3b242ddbe67aa.png` | [#11](https://github.com/ntntran09/23127272_CS13003_HW/issues/11) |
| BUG-FR14-01 | FR-14 | FR14-AUTO-008-01..03 | Empty and whitespace-only category names trigger `POST /api/categories` and create blank-equivalent rows. | `automation/reports/fr14/chromium/data/434fb4bca08b5aaed120cfc6384f1def69919ec4.png` | [#9](https://github.com/ntntran09/23127272_CS13003_HW/issues/9) |

## Evidence scope

Every row above is a UI-level oracle, matching the HW02 scope note that API status codes and database state are not part of the test oracle. Where a fixture stands in for the backend, the row says so explicitly and names the API check that would still be required. No row claims backend behaviour that the recorded run did not observe.

## GitHub issues

All eleven defects are filed as public issues on `ntntran09/23127272_CS13003_HW`, linked in the table above. Each issue states the requirement it violates, the automated case ids, the expected and actual behaviour, and renders its screenshot inline.

One nuance for review: the screenshots are embedded from the committed report attachments via `raw.githubusercontent.com`, pinned to commit `de66ce0`, rather than uploaded as GitHub file attachments — the GitHub API used by `gh` cannot upload issue attachments. They render as images in the issue exactly as an upload would, and the pinned commit keeps them stable, but they are repository files rather than issue-owned uploads.
