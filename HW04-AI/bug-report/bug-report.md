# HW04 Automation Defect Log

Execution date: 2026-08-08  
Browsers: Playwright Chromium, Google Chrome, Microsoft Edge  
Evidence source: three independent HTML runs per feature

The same failure reproduced on all three browsers. Each item below is counted once as a unique product defect, not three times.

| ID | Requirement | Automated cases | Actual result | Evidence | GitHub Issue |
| --- | --- | --- | --- | --- | --- |
| BUG-FR03-01 | FR-03, FR-22 | FR03-AUTO-001, FR03-AUTO-003 | Neither step 1 nor step 2 displays a step indicator. | `screenshots/chromium/fr03-password-reset-FR-03--52353-poses-the-two-step-contract-chromium.png` | TODO |
| BUG-FR03-02 | FR-03 | FR03-AUTO-001, FR03-AUTO-012 | Step 1 has no back-to-login control; the step-2 back button returns to step 1 instead of `/login`. | `screenshots/chromium/fr03-password-reset-FR-03--33bd4--is-available-from-step-one-chromium.png` | TODO |
| BUG-FR03-03 | FR-22 | FR03-AUTO-005 | Forgot-password email input uses `type="text"`; malformed email passes browser validity. | `screenshots/chromium/fr03-password-reset-FR-03--727d5-ses-browser-email-semantics-chromium.png` | TODO |
| BUG-FR03-04 | FR-22 | FR03-AUTO-004 | An unregistered email triggers a JavaScript alert instead of inline feedback above submit. | `screenshots/chromium/fr03-password-reset-FR-03--b6bee-ep-one-with-inline-feedback-chromium.png` | TODO |
| BUG-FR03-05 | FR-03, SEC-07 | FR03-AUTO-007 | UI specifies four OTP digits and the live backend generates four digits, while the requirement specifies six. | `screenshots/chromium/fr03-password-reset-FR-03--a87f5--exactly-six-numeric-digits-chromium.png` | TODO |
| BUG-FR03-06 | FR-03, FR-22 | FR03-AUTO-008, FR03-AUTO-009, FR03-AUTO-011 | Confirmation-password input is absent, so equality and required validation cannot occur. | `screenshots/chromium/fr03-password-reset-FR-03--8c716-mation-password-is-required-chromium.png` | TODO |
| BUG-FR03-07 | FR-01, FR-03 | FR03-AUTO-010 | Valid password `NewPass1!` is rejected because the client regex requires whitespace and does not accept the allowed special-character set. | `screenshots/chromium/fr03-password-reset-FR-03--9a045-pletes-and-returns-to-login-chromium.png` | TODO |
| BUG-FR11-01 | FR-10, FR-11 | FR11-AUTO-009 | A shipping order still displays a cancel button; shipping may only be canceled by an admin. | `screenshots/chromium/fr11-order-history-FR-11-U-d5298-ng-order-cannot-be-canceled-chromium.png` | TODO |
| BUG-FR14-01 | FR-14 | FR14-AUTO-009, FR14-AUTO-010 | Empty and whitespace-only category names trigger `POST /api/categories` and create blank-equivalent rows. | `screenshots/chromium/fr14-category-management-F-b6c68-y-category-name-is-rejected-chromium.png` | TODO |

## GitHub issue checklist

For each item, add the public issue URL above after manually confirming the screenshot and reproduction steps. Attach the corresponding PNG directly to the issue; a repository-relative filename alone is not an issue attachment.
