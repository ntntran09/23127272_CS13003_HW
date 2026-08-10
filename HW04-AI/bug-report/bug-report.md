# HW04 Automation Defect Log

Execution date: 2026-08-10  
Browsers: Playwright Chromium, Google Chrome, Microsoft Edge  
Evidence source: three independent HTML runs per feature under `automation/reports/<feature>/<browser>/`

The same failure reproduced on all three browsers. Each item below is counted once as a unique product defect, not three times. The 84 failed executions consolidate into the ten defects below.

| ID | Requirement | Automated cases | Actual result | Evidence | GitHub Issue |
| --- | --- | --- | --- | --- | --- |
| BUG-FR03-01 | FR-03, FR-22 | FR03-AUTO-001-01, FR03-AUTO-003-01..03 | Neither step 1 nor step 2 displays a step indicator (expected "2/2" on step two is absent). | `automation/test-results/fr03/chromium/fr03-password-reset-FR-03--cd765-opens-the-two-step-contract-chromium/test-failed-1.png` | TODO |
| BUG-FR03-02 | FR-03 | FR03-AUTO-012-01 | Step 1 has no back-to-login control; the step-2 back button returns to step 1 instead of `/login`. | `automation/test-results/fr03/chromium/fr03-password-reset-FR-03--e62d2-01-Direct-entry-to-step-one-chromium/test-failed-1.png` | TODO |
| BUG-FR03-03 | FR-22 | FR03-AUTO-005-01..03, FR03-AUTO-006-02 | Forgot-password email input uses `type="text"`; malformed and whitespace-only email passes browser validity. | `automation/test-results/fr03/chromium/fr03-password-reset-FR-03--44751-AUTO-005-01-Missing-at-sign-chromium/test-failed-1.png` | TODO |
| BUG-FR03-04 | FR-22 | FR03-AUTO-004-01..03 | An unregistered email triggers a JavaScript alert instead of inline feedback above submit. | `automation/test-results/fr03/chromium/fr03-password-reset-FR-03--601f7-4-01-Clearly-unknown-domain-chromium/test-failed-1.png` | TODO |
| BUG-FR03-05 | FR-03, SEC-07 | FR03-AUTO-007-01..02 | UI labels the OTP field "4 số" and the live backend generates four digits, while the requirement specifies six. | `automation/test-results/fr03/chromium/fr03-password-reset-FR-03--b0b7c--01-Mid-range-six-digit-OTP-chromium/test-failed-1.png` | TODO |
| BUG-FR03-06 | FR-03, FR-22 | FR03-AUTO-008-01..02, FR03-AUTO-009-01..02, FR03-AUTO-011-01..02 | Confirmation-password input is absent, so equality and required validation cannot occur. | `automation/test-results/fr03/chromium/fr03-password-reset-FR-03--13a65-008-01-Default-account-flow-chromium/test-failed-1.png` | TODO |
| BUG-FR03-07 | FR-01, FR-03 | FR03-AUTO-010-01..03 | Valid reset cannot complete: the reset POST never fires and the page never redirects to `/login`. | `automation/test-results/fr03/chromium/fr03-password-reset-FR-03--7bd48-resentative-strong-password-chromium/test-failed-1.png` | TODO |
| BUG-FR11-01 | FR-10, FR-11 | FR11-AUTO-008-01 | A shipping order still displays a cancel button; shipping may only be canceled by an admin. | `automation/test-results/fr11/chromium/fr11-order-history-FR-11-U-4eb87-O-008-01-Shipping-order-row-chromium/test-failed-1.png` | TODO |
| BUG-FR11-02 | FR-11 | FR11-AUTO-012-02 | An unparseable order date is rendered verbatim as "Invalid Date" instead of a readable fallback. | `automation/test-results/fr11/chromium/fr11-order-history-FR-11-U-b17ad-UTO-012-02-Unparseable-date-chromium/test-failed-1.png` | TODO |
| BUG-FR14-01 | FR-14 | FR14-AUTO-008-01..03 | Empty and whitespace-only category names trigger `POST /api/categories` and create blank-equivalent rows. | `automation/test-results/fr14/chromium/fr14-category-management-F-74857-FR14-AUTO-008-01-Empty-name-chromium/test-failed-1.png` | TODO |

## GitHub issue checklist

For each item, add the public issue URL above after manually confirming the screenshot and reproduction steps. Attach the corresponding PNG directly to the issue; a repository-relative filename alone is not an issue attachment.
