# HW04 Automation Defect Log

Execution date: 2026-08-11  
Browsers: Playwright Chromium, Google Chrome, Microsoft Edge  
Evidence source: three independent HTML runs per feature under `automation/reports/<feature>/<browser>/`

The same failure reproduced on all three browsers. Each item below is counted once as a unique product defect, not three times. The 90 failed executions consolidate into the eleven defects below.

| ID | Requirement | Automated cases | Actual result | Evidence | GitHub Issue |
| --- | --- | --- | --- | --- | --- |
| BUG-FR03-01 | FR-03, FR-22 | FR03-AUTO-001-01, FR03-AUTO-003-01..03 | Neither step 1 nor step 2 displays a step indicator; OUT1 requires "Step 1 / 2" then "Step 2 / 2". | `automation/test-results/fr03/chromium/fr03-password-reset-FR-03--cd765-opens-the-two-step-contract-chromium/test-failed-1.png` | TODO |
| BUG-FR03-02 | FR-03 | FR03-AUTO-001-01, FR03-AUTO-012-01 | Step 1 exposes no back-to-login control of any kind (neither link nor button); the step-2 "← Quay lại" button returns to step 1 instead of `/login`. | `automation/test-results/fr03/chromium/fr03-password-reset-FR-03--e62d2-01-Direct-entry-to-step-one-chromium/test-failed-1.png` | TODO |
| BUG-FR03-03 | FR-22 | FR03-AUTO-005-01..03, FR03-AUTO-006-02 | Forgot-password email input uses `type="text"`; malformed and whitespace-only email pass browser validity. | `automation/test-results/fr03/chromium/fr03-password-reset-FR-03--44751-AUTO-005-01-Missing-at-sign-chromium/test-failed-1.png` | TODO |
| BUG-FR03-04 | FR-22 | FR03-AUTO-004-01..03 | An unregistered email triggers `alert("Lỗi: User not found")` instead of inline feedback above submit. | `automation/test-results/fr03/chromium/fr03-password-reset-FR-03--601f7-4-01-Clearly-unknown-domain-chromium/test-failed-1.png` | TODO |
| BUG-FR03-05 | FR-03, SEC-07 | FR03-AUTO-007-01..02 | The step-2 OTP field is labelled "Mã OTP (4 số)" while FR-03/IN6 specifies exactly 6 digits. Scope note: the automated run mocks `/api/forgot-password`, so this is a UI-contract defect only; the digit count the live backend generates is **not** covered by this evidence and needs a separate API check. | `automation/test-results/fr03/chromium/fr03-password-reset-FR-03--b0b7c--01-Mid-range-six-digit-OTP-chromium/test-failed-1.png` | TODO |
| BUG-FR03-06 | FR-03, FR-22 | FR03-AUTO-008-01..02, FR03-AUTO-009-01..02, FR03-AUTO-011-01..02 | Confirmation-password input is absent (step 2 renders 2 inputs, not 3), so equality and required validation cannot occur. | `automation/test-results/fr03/chromium/fr03-password-reset-FR-03--13a65-008-01-Default-account-flow-chromium/test-failed-1.png` | TODO |
| BUG-FR03-07 | FR-01, FR-03 | FR03-AUTO-010-01..03 | Valid reset cannot complete: `POST /api/reset-password` never fires and the page stays on `/forgot-password`. Reproduced with three FR-01-compliant passwords, including one using only the allowed special characters. | `automation/test-results/fr03/chromium/fr03-password-reset-FR-03--7bd48-resentative-strong-password-chromium/test-failed-1.png` | TODO |
| BUG-FR11-01 | FR-11, SEC-02 | FR11-AUTO-006-01..02 | The profile page renders every order in the response without checking `user_id`. Served mixed data (own order plus another user's order), the table shows both rows, including the foreign order `#999` and its total `987.654.321 ₫`. OUT5 requires that no order belonging to another user is visible. Scope note: the endpoint is mocked, so this proves the client performs no ownership filtering; whether the backend also fails to filter is a separate API check. | `automation/test-results/fr11/chromium/fr11-order-history-FR-11-U-47e7f-distinctive-delivered-order-chromium/test-failed-1.png` | TODO |
| BUG-FR11-02 | FR-10, FR-11 | FR11-AUTO-008-01 | A shipping order still displays a cancel button; shipping may only be canceled by an admin. | `automation/test-results/fr11/chromium/fr11-order-history-FR-11-U-4eb87-O-008-01-Shipping-order-row-chromium/test-failed-1.png` | TODO |
| BUG-FR11-03 | FR-11 | FR11-AUTO-012-02 | An unparseable order date is rendered verbatim as "Invalid Date" instead of a readable fallback. | `automation/test-results/fr11/chromium/fr11-order-history-FR-11-U-b17ad-UTO-012-02-Unparseable-date-chromium/test-failed-1.png` | TODO |
| BUG-FR14-01 | FR-14 | FR14-AUTO-008-01..03 | Empty and whitespace-only category names trigger `POST /api/categories` and create blank-equivalent rows. | `automation/test-results/fr14/chromium/fr14-category-management-F-74857-FR14-AUTO-008-01-Empty-name-chromium/test-failed-1.png` | TODO |

## Evidence scope

Every row above is a UI-level oracle, matching the HW02 scope note that API status codes and database state are not part of the test oracle. Where a fixture stands in for the backend, the row says so explicitly and names the API check that would still be required. No row claims backend behaviour that the recorded run did not observe.

## GitHub issue checklist

For each item, add the public issue URL above after manually confirming the screenshot and reproduction steps. Attach the corresponding PNG directly to the issue; a repository-relative filename alone is not an issue attachment.
